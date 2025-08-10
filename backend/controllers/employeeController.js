const db = require('../config/db');

// Helper function for error handling
const handleQueryError = (res, err) => {
  console.error('Database error:', err);
  return res.status(500).json({ error: err.message });
};

// Helper function to get or create skill by name
const getOrCreateSkillId = async (connection, skillName) => {
  try {
    const [existingSkills] = await connection.query(
      'SELECT id FROM skills WHERE name = ?',
      [skillName.trim()]
    );
    if (existingSkills.length > 0) {
      return existingSkills[0].id;
    }
    const [result] = await connection.query(
      'INSERT INTO skills (name) VALUES (?)',
      [skillName.trim()]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error getting/creating skill:', error);
    throw error;
  }
};

// Helper function to get employee by ID (promise-based)
const getEmployeeByIdHelper = async (id) => {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT e.*, d.name AS department_name, CONCAT(e.first_name, ' ', e.last_name) AS full_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = ?
    `;
    const [rows] = await connection.query(sql, [id]);
    if (rows.length === 0) {
      throw new Error('Employee not found');
    }
    const skillsSql = `
      SELECT s.name
      FROM skills s
      JOIN employee_skills es ON s.id = es.skill_id
      WHERE es.employee_id = ?
    `;
    const [skillRows] = await connection.query(skillsSql, [id]);
    const skills = skillRows.map(row => row.name);
    const employee = {
      ...rows[0],
      skills: skills
    };
    return employee;
  } catch (error) {
    console.error('Error in getEmployeeByIdHelper:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// ========== BASIC CRUD OPERATIONS ==========

// Get all employees (with pagination, sorting, searching)
exports.getAllEmployees = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'e.id';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    const searchQuery = req.query.search || '';
    const searchCondition = searchQuery
      ? `AND (e.first_name LIKE ? OR e.last_name LIKE ? OR d.name LIKE ? OR e.position LIKE ?)`
      : '';
    const searchParams = searchQuery
      ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
      : [];

    const sql = `
      SELECT e.*, d.name AS department_name, CONCAT(e.first_name, ' ', e.last_name) AS full_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1 ${searchCondition}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1 ${searchCondition}
    `;

    const [results] = await connection.query(sql, [...searchParams, limit, offset]);
    const [countResult] = await connection.query(countSql, searchParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const employeeIds = results.map(emp => emp.id);
    let skillsMap = new Map();
    if (employeeIds.length > 0) {
      const skillsSql = `
        SELECT es.employee_id, s.name
        FROM employee_skills es
        JOIN skills s ON es.skill_id = s.id
        WHERE es.employee_id IN (?)
      `;
      const [skillRows] = await connection.query(skillsSql, [employeeIds]);
      skillRows.forEach(row => {
        if (!skillsMap.has(row.employee_id)) {
          skillsMap.set(row.employee_id, []);
        }
        skillsMap.get(row.employee_id).push(row.name);
      });
    }

    const formattedResults = results.map(emp => ({
      ...emp,
      skills: skillsMap.get(emp.id) || []
    }));

    res.json({
      data: formattedResults,
      pagination: { page, limit, total, totalPages }
    });
  } catch (err) {
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await getEmployeeByIdHelper(id);
    res.json(employee);
  } catch (err) {
    if (err.message === 'Employee not found') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    handleQueryError(res, err);
  }
};

// Create new employee with skills
exports.createEmployee = async (req, res) => {
  const { first_name, last_name, department_id, position, salary, hire_date, skills, email } = req.body;
  if (!first_name || !last_name || !department_id || !email) {
    return res.status(400).json({ error: 'First name, last name, email, and department are required' });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const empSql = `
      INSERT INTO employees (first_name, last_name, department_id, position, salary, hire_date, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const empValues = [
      first_name,
      last_name,
      department_id,
      position || null,
      salary ? parseFloat(salary) : null,
      hire_date || null,
      email
    ];
    const [result] = await connection.query(empSql, empValues);
    const employeeId = result.insertId;

    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        if (skillName) {
          const skillId = await getOrCreateSkillId(connection, skillName);
          const linkSql = `INSERT INTO employee_skills (employee_id, skill_id) VALUES (?, ?)`;
          await connection.query(linkSql, [employeeId, skillId]);
        }
      }
    }

    await connection.commit();
    res.status(201).json({ id: employeeId, message: 'Employee created successfully' });
  } catch (err) {
    await connection.rollback();
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Update existing employee with skills
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, department_id, position, salary, hire_date, skills, email } = req.body;

  if (!first_name || !last_name || !department_id || !email) {
    return res.status(400).json({ error: 'First name, last name, email, and department are required' });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const updateEmpSql = `
      UPDATE employees
      SET first_name = ?, last_name = ?, department_id = ?, position = ?, salary = ?, hire_date = ?, email = ?
      WHERE id = ?
    `;
    const updateEmpValues = [
      first_name,
      last_name,
      department_id,
      position || null,
      salary ? parseFloat(salary) : null,
      hire_date || null,
      email,
      id
    ];
    await connection.query(updateEmpSql, updateEmpValues);

    await connection.query('DELETE FROM employee_skills WHERE employee_id = ?', [id]);

    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        if (skillName) {
          const skillId = await getOrCreateSkillId(connection, skillName);
          const linkSql = `INSERT INTO employee_skills (employee_id, skill_id) VALUES (?, ?)`;
          await connection.query(linkSql, [id, skillId]);
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    await connection.rollback();
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query('DELETE FROM employee_skills WHERE employee_id = ?', [id]);
    const [result] = await connection.query('DELETE FROM employees WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Employee not found' });
    }

    await connection.commit();
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    await connection.rollback();
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// ========== DEPARTMENT RELATED FUNCTIONS ==========

// Get all departments
exports.getAllDepartments = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query('SELECT id, name FROM departments ORDER BY name');
    res.json(rows);
  } catch (err) {
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Get department stats
exports.getDepartmentStats = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        d.id,
        d.name,
        COUNT(e.id) AS employee_count,
        AVG(e.salary) AS avg_salary,
        MAX(e.salary) AS max_salary,
        MIN(e.salary) AS min_salary,
        SUM(e.salary) AS total_salary,
        (SELECT COUNT(*) 
         FROM employee_projects ep 
         JOIN projects p ON ep.project_id = p.id
         WHERE p.department_id = d.id) AS project_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id
      ORDER BY employee_count DESC
    `;
    
    const [results] = await connection.query(sql);
    
    // Format numbers
    const formattedResults = results.map(dept => ({
      ...dept,
      avg_salary: parseFloat(dept.avg_salary || 0).toFixed(2),
      total_salary: parseFloat(dept.total_salary || 0).toFixed(2)
    }));
    
    res.json(formattedResults);
  } catch (err) {
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Get dashboard department statistics (specific for dashboard)
exports.getDashboardDepartmentStats = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const departmentStatsQuery = `
      SELECT 
        d.name as department,
        COUNT(e.id) as employee_count,
        ROUND(AVG(e.salary), 0) as avg_salary
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      WHERE e.status = 'Active' OR e.status IS NULL
      GROUP BY d.id, d.name
      ORDER BY employee_count DESC
      LIMIT 6
    `;
    
    const [departmentStats] = await connection.query(departmentStatsQuery);
    res.json(departmentStats);
  } catch (error) {
    console.error('Error fetching dashboard department stats:', error);
    res.status(500).json([]);
  } finally {
    connection.release();
  }
};

// ========== SKILL RELATED FUNCTIONS ==========

// Get all skills
// Get all skills
exports.getAllSkills = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query('SELECT id, name FROM skills ORDER BY name');
    res.json(rows);  // Return objects with id and name, not just names
  } catch (err) {
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Add employee skill
exports.addEmployeeSkill = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { employee_id, skill_id } = req.body;
    const sql = `INSERT INTO employee_skills (employee_id, skill_id) VALUES (?, ?)`;
    
    await connection.query(sql, [employee_id, skill_id]);
    res.json({ success: true });
  } catch (err) {
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Get employee skills by employee ID
exports.getEmployeeSkills = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const sql = `
      SELECT s.* FROM skills s
      JOIN employee_skills es ON s.id = es.skill_id
      WHERE es.employee_id = ?
    `;
    
    const [results] = await connection.query(sql, [id]);
    res.json(results);
  } catch (err) {
    handleQueryError(res, err);
  } finally {
    connection.release();
  }
};

// Get employee project details
exports.getEmployeeProjectDetails = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const projectsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.start_date,
        p.end_date,
        p.status,
        p.budget
      FROM projects p
      JOIN employee_projects ep ON p.id = ep.project_id
      WHERE ep.employee_id = ?
      ORDER BY p.start_date DESC
    `;
    
    const [projects] = await connection.query(projectsQuery, [id]);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching employee projects:', error);
    res.status(500).json([]);
  } finally {
    connection.release();
  }
};

// ========== DASHBOARD & ANALYTICS FUNCTIONS ==========

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const totalEmployeesQuery = 'SELECT COUNT(*) as count FROM employees';
    const totalDepartmentsQuery = 'SELECT COUNT(*) as count FROM departments';
    const newHiresQuery = `
      SELECT COUNT(*) as count 
      FROM employees 
      WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `;
    const avgSalaryQuery = `
      SELECT ROUND(AVG(salary)) as average 
      FROM employees 
      WHERE salary IS NOT NULL AND salary > 0
    `;

    const [totalEmployeesResult] = await connection.query(totalEmployeesQuery);
    const [totalDepartmentsResult] = await connection.query(totalDepartmentsQuery);
    const [newHiresResult] = await connection.query(newHiresQuery);
    const [avgSalaryResult] = await connection.query(avgSalaryQuery);

    const stats = {
      totalEmployees: totalEmployeesResult[0]?.count || 0,
      totalDepartments: totalDepartmentsResult[0]?.count || 0,
      newHires: newHiresResult[0]?.count || 0,
      avgSalary: avgSalaryResult[0]?.average || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      totalEmployees: 0,
      totalDepartments: 0,
      newHires: 0,
      avgSalary: 0
    });
  } finally {
    connection.release();
  }
};

// Recent Activity
exports.getRecentActivity = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const recentActivitiesQuery = `
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        'New employee added' as action,
        'add' as type,
        hire_date as created_at,
        CASE 
          WHEN hire_date >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 
            CONCAT(TIMESTAMPDIFF(HOUR, hire_date, NOW()), ' hours ago')
          WHEN hire_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 
            CONCAT(TIMESTAMPDIFF(DAY, hire_date, NOW()), ' days ago')
          ELSE 
            DATE_FORMAT(hire_date, '%M %d, %Y')
        END as time
      FROM employees 
      WHERE hire_date IS NOT NULL
      ORDER BY hire_date DESC 
      LIMIT 8
    `;
    
    const [activities] = await connection.query(recentActivitiesQuery);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json([]);
  } finally {
    connection.release();
  }
};

// Monthly hiring trends
exports.getHiringTrends = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const hiringTrendsQuery = `
      SELECT 
        DATE_FORMAT(hire_date, '%Y-%m') as month,
        DATE_FORMAT(hire_date, '%M %Y') as month_name,
        COUNT(*) as hires
      FROM employees 
      WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND hire_date IS NOT NULL
      GROUP BY DATE_FORMAT(hire_date, '%Y-%m')
      ORDER BY month ASC
    `;
    
    const [trends] = await connection.query(hiringTrendsQuery);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching hiring trends:', error);
    res.status(500).json([]);
  } finally {
    connection.release();
  }
};

// ========== ENHANCED ANALYTICS FUNCTIONS ==========

// Enhanced Salary Analysis with more detailed data
exports.getSalaryAnalysis = async (req, res) => {
  const connection = await db.getConnection();
  try {
    // Get comprehensive salary statistics
    const statsQuery = `
      SELECT 
        ROUND(AVG(salary), 0) as average_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary,
        COUNT(*) as total_employees,
        ROUND(STDDEV(salary), 0) as salary_stddev
      FROM employees 
      WHERE salary IS NOT NULL AND salary > 0 AND (status = 'Active' OR status IS NULL)
    `;
    
    // Calculate median salary
    const medianQuery = `
      SELECT AVG(salary) as median_salary
      FROM (
        SELECT salary, 
               ROW_NUMBER() OVER (ORDER BY salary) as row_num,
               COUNT(*) OVER () as total_count
        FROM employees 
        WHERE salary IS NOT NULL AND salary > 0 AND (status = 'Active' OR status IS NULL)
      ) as ranked
      WHERE row_num IN (FLOOR((total_count + 1) / 2), CEIL((total_count + 1) / 2))
    `;
    
    // Get salary distribution with proper ranges
    const distributionQuery = `
      SELECT 
        CASE 
          WHEN salary < 40000 THEN 'Under $40K'
          WHEN salary BETWEEN 40000 AND 59999 THEN '$40K-$60K'
          WHEN salary BETWEEN 60000 AND 79999 THEN '$60K-$80K'
          WHEN salary BETWEEN 80000 AND 99999 THEN '$80K-$100K'
          WHEN salary BETWEEN 100000 AND 119999 THEN '$100K-$120K'
          WHEN salary >= 120000 THEN '$120K+'
          ELSE 'Other'
        END as range,
        COUNT(*) as count
      FROM employees 
      WHERE salary IS NOT NULL AND salary > 0 AND (status = 'Active' OR status IS NULL)
      GROUP BY 
        CASE 
          WHEN salary < 40000 THEN 'Under $40K'
          WHEN salary BETWEEN 40000 AND 59999 THEN '$40K-$60K'
          WHEN salary BETWEEN 60000 AND 79999 THEN '$60K-$80K'
          WHEN salary BETWEEN 80000 AND 99999 THEN '$80K-$100K'
          WHEN salary BETWEEN 100000 AND 119999 THEN '$100K-$120K'
          WHEN salary >= 120000 THEN '$120K+'
          ELSE 'Other'
        END
      ORDER BY MIN(salary)
    `;

    // Salary by department
    const departmentSalaryQuery = `
      SELECT 
        d.name as department,
        AVG(e.salary) as avg_salary,
        COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      WHERE e.salary IS NOT NULL AND e.salary > 0 AND (e.status = 'Active' OR e.status IS NULL)
      GROUP BY d.id, d.name
      ORDER BY avg_salary DESC
    `;

    const [statsResult] = await connection.query(statsQuery);
    const [medianResult] = await connection.query(medianQuery);
    const [distributionResult] = await connection.query(distributionQuery);
    const [departmentResult] = await connection.query(departmentSalaryQuery);

    const analysis = {
      averageSalary: statsResult[0]?.average_salary || 0,
      medianSalary: Math.round(medianResult[0]?.median_salary || 0),
      salaryRange: {
        min: statsResult[0]?.min_salary || 0,
        max: statsResult[0]?.max_salary || 0
      },
      standardDeviation: statsResult[0]?.salary_stddev || 0,
      totalEmployees: statsResult[0]?.total_employees || 0,
      salaryDistribution: distributionResult || [],
      departmentSalaries: departmentResult || []
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching salary analysis:', error);
    res.status(500).json({ 
      error: 'Failed to fetch salary analysis',
      averageSalary: 0,
      medianSalary: 0,
      salaryRange: { min: 0, max: 0 },
      salaryDistribution: [],
      departmentSalaries: []
    });
  } finally {
    connection.release();
  }
};

// Enhanced Skills Analysis
exports.getSkillsAnalysis = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const skillsQuery = `
      SELECT 
        s.name as skill,
        COUNT(es.employee_id) as count,
        ROUND((COUNT(es.employee_id) * 100.0) / (
          SELECT COUNT(DISTINCT e.id) 
          FROM employees e 
          WHERE e.status = 'Active' OR e.status IS NULL
        ), 1) as percentage
      FROM skills s
      LEFT JOIN employee_skills es ON s.id = es.skill_id
      LEFT JOIN employees e ON es.employee_id = e.id
      WHERE es.employee_id IS NOT NULL AND (e.status = 'Active' OR e.status IS NULL)
      GROUP BY s.id, s.name
      HAVING count > 0
      ORDER BY count DESC
      LIMIT 15
    `;
    
    // Skills by department
    const skillsByDeptQuery = `
      SELECT 
        d.name as department,
        s.name as skill,
        COUNT(es.employee_id) as count
      FROM skills s
      JOIN employee_skills es ON s.id = es.skill_id
      JOIN employees e ON es.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'Active' OR e.status IS NULL
      GROUP BY d.id, d.name, s.id, s.name
      ORDER BY d.name, count DESC
    `;

    const [skillsResult] = await connection.query(skillsQuery);
    const [skillsByDeptResult] = await connection.query(skillsByDeptQuery);

    const analysis = {
      topSkills: skillsResult || [],
      skillsByDepartment: skillsByDeptResult || []
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching skills analysis:', error);
    res.status(500).json({ 
      topSkills: [],
      skillsByDepartment: []
    });
  } finally {
    connection.release();
  }
};

// Employee Tenure Analysis
exports.getTenureAnalysis = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const tenureQuery = `
      SELECT 
        CASE 
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 < 1 THEN '0-1 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 BETWEEN 1 AND 3 THEN '1-3 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 BETWEEN 3 AND 5 THEN '3-5 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 BETWEEN 5 AND 10 THEN '5-10 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 >= 10 THEN '10+ years'
          ELSE 'Unknown'
        END as period,
        COUNT(*) as count
      FROM employees 
      WHERE hire_date IS NOT NULL
      GROUP BY 
        CASE 
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 < 1 THEN '0-1 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 BETWEEN 1 AND 3 THEN '1-3 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 BETWEEN 3 AND 5 THEN '3-5 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 BETWEEN 5 AND 10 THEN '5-10 years'
          WHEN DATEDIFF(CURDATE(), hire_date) / 365 >= 10 THEN '10+ years'
          ELSE 'Unknown'
        END
      ORDER BY 
        CASE period
          WHEN '0-1 years' THEN 1
          WHEN '1-3 years' THEN 2
          WHEN '3-5 years' THEN 3
          WHEN '5-10 years' THEN 4
          WHEN '10+ years' THEN 5
          ELSE 6
        END
    `;
    
    const [results] = await connection.query(tenureQuery);
    res.json(results);
  } catch (error) {
    console.error('Error fetching tenure analysis:', error);
    res.status(500).json([]);
  } finally {
    connection.release();
  }
};

// Performance Metrics
exports.getPerformanceMetrics = async (req, res) => {
  const connection = await db.getConnection();
  try {
    // Calculate retention rate
    const totalEmployeesQuery = 'SELECT COUNT(*) as total FROM employees';
    const activeEmployeesQuery = `
      SELECT COUNT(*) as active 
      FROM employees 
      WHERE hire_date <= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    `;
    const avgTenureQuery = `
      SELECT AVG(DATEDIFF(CURDATE(), hire_date) / 365) as avg_tenure 
      FROM employees 
      WHERE hire_date IS NOT NULL
    `;

    const [totalResult] = await connection.query(totalEmployeesQuery);
    const [activeResult] = await connection.query(activeEmployeesQuery);
    const [tenureResult] = await connection.query(avgTenureQuery);

    const metrics = {
      retentionRate: totalResult[0]?.total > 0 
        ? ((activeResult[0]?.active || 0) / totalResult[0].total * 100).toFixed(1)
        : 0,
      averageTenure: parseFloat(tenureResult[0]?.avg_tenure || 0).toFixed(1),
      promotionRate: (Math.random() * 20 + 10).toFixed(1), // Mock data - implement real logic
      satisfactionScore: (Math.random() * 2 + 3).toFixed(1) // Mock data - implement real logic
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      retentionRate: 0,
      averageTenure: 0,
      promotionRate: 0,
      satisfactionScore: 0
    });
  } finally {
    connection.release();
  }
};