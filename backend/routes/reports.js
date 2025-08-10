const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Using the connection pool from your db config

// ========== DASHBOARD ROUTES ==========
router.get('/dashboard/department-stats', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        d.id,
        d.name as department,
        COUNT(e.id) as employee_count,
        ROUND(AVG(e.salary), 2) as avg_salary,
        MIN(e.salary) as min_salary,
        MAX(e.salary) as max_salary,
        SUM(e.salary) as total_salary,
        (SELECT COUNT(*) 
         FROM employee_projects ep 
         JOIN projects p ON ep.project_id = p.id
         WHERE p.department_id = d.id) AS project_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
      ORDER BY employee_count DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ error: 'Failed to fetch department statistics' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/dashboard/hiring-trends', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        DATE_FORMAT(hire_date, '%Y-%m') as month,
        DATE_FORMAT(hire_date, '%M %Y') as month_name,
        COUNT(*) as hires
      FROM employees 
      WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        AND hire_date IS NOT NULL
      GROUP BY DATE_FORMAT(hire_date, '%Y-%m'), DATE_FORMAT(hire_date, '%M %Y')
      ORDER BY month ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hiring trends:', error);
    res.status(500).json({ error: 'Failed to fetch hiring trends' });
  } finally {
    if (connection) connection.release();
  }
});

// ========== DETAILED REPORTS ROUTES ==========
router.get('/reports/salary-analysis', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get salary statistics
    const [salaryStats] = await connection.query(`
      SELECT 
        ROUND(AVG(salary)) as average_salary,
        ROUND((
          SELECT AVG(salary) FROM (
            SELECT salary FROM employees 
            WHERE salary IS NOT NULL 
            ORDER BY salary 
            LIMIT 2 - (SELECT COUNT(*) FROM employees WHERE salary IS NOT NULL) % 2
            OFFSET (SELECT (COUNT(*) - 1) / 2 FROM employees WHERE salary IS NOT NULL)
          ) as median_calc
        )) as median_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary
      FROM employees 
      WHERE salary IS NOT NULL AND salary > 0
    `);
    
    // Get salary distribution
    const [salaryDistribution] = await connection.query(`
      SELECT 
        CASE 
          WHEN salary BETWEEN 30000 AND 40000 THEN '30K-40K'
          WHEN salary BETWEEN 40001 AND 60000 THEN '40K-60K'
          WHEN salary BETWEEN 60001 AND 80000 THEN '60K-80K'
          WHEN salary BETWEEN 80001 AND 100000 THEN '80K-100K'
          WHEN salary > 100000 THEN '100K+'
          ELSE 'Other'
        END as salary_range,
        COUNT(*) as count
      FROM employees 
      WHERE salary IS NOT NULL AND salary > 0
      GROUP BY 
        CASE 
          WHEN salary BETWEEN 30000 AND 40000 THEN '30K-40K'
          WHEN salary BETWEEN 40001 AND 60000 THEN '40K-60K'
          WHEN salary BETWEEN 60001 AND 80000 THEN '60K-80K'
          WHEN salary BETWEEN 80001 AND 100000 THEN '80K-100K'
          WHEN salary > 100000 THEN '100K+'
          ELSE 'Other'
        END
      ORDER BY MIN(salary)
    `);

    res.json({
      stats: salaryStats[0],
      distribution: salaryDistribution
    });
  } catch (error) {
    console.error('Error fetching salary analysis:', error);
    res.status(500).json({ error: 'Failed to fetch salary analysis' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/reports/skills-analysis', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        s.name as skill,
        COUNT(es.employee_id) as count,
        ROUND((COUNT(es.employee_id) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage
      FROM skills s
      LEFT JOIN employee_skills es ON s.id = es.skill_id
      GROUP BY s.id, s.name
      HAVING count > 0
      ORDER BY count DESC
      LIMIT 10
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching skills analysis:', error);
    res.status(500).json({ error: 'Failed to fetch skills analysis' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/reports/tenure-analysis', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(`
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
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tenure analysis:', error);
    res.status(500).json({ error: 'Failed to fetch tenure analysis' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/reports/performance-metrics', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Calculate retention rate (employees who stayed more than 1 year / total)
    const [retentionData] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN DATEDIFF(CURDATE(), hire_date) > 365 THEN 1 END) as stayed_over_year
      FROM employees
    `);
    
    // Calculate average tenure
    const [tenureData] = await connection.query(`
      SELECT AVG(DATEDIFF(CURDATE(), hire_date) / 365) as avg_tenure 
      FROM employees 
      WHERE hire_date IS NOT NULL
    `);

    const metrics = {
      retentionRate: retentionData[0].total > 0 
        ? ((retentionData[0].stayed_over_year / retentionData[0].total) * 100).toFixed(1)
        : 0,
      averageTenure: parseFloat(tenureData[0]?.avg_tenure || 0).toFixed(1),
      promotionRate: (Math.random() * 20 + 10).toFixed(1), // Mock data - implement real logic
      satisfactionScore: (Math.random() * 2 + 3).toFixed(1) // Mock data - implement real logic
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch performance metrics',
      retentionRate: 0,
      averageTenure: 0,
      promotionRate: 0,
      satisfactionScore: 0
    });
  } finally {
    if (connection) connection.release();
  }
});

// ========== GROWTH ANALYTICS ==========
router.get('/reports/growth-analytics', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Monthly employee growth over the last year
    const [monthlyGrowth] = await connection.query(`
      SELECT 
        DATE_FORMAT(hire_date, '%Y-%m') as month,
        DATE_FORMAT(hire_date, '%M %Y') as month_name,
        COUNT(*) as new_hires,
        (
          SELECT COUNT(*) 
          FROM employees e2 
          WHERE e2.hire_date <= LAST_DAY(STR_TO_DATE(CONCAT(month, '-01'), '%Y-%m-%d'))
        ) as total_employees
      FROM employees
      WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(hire_date, '%Y-%m'), DATE_FORMAT(hire_date, '%M %Y')
      ORDER BY month
    `);
    
    // Department growth comparison
    const [departmentGrowth] = await connection.query(`
      SELECT 
        d.id,
        d.name as department,
        COUNT(CASE WHEN e.hire_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) THEN 1 END) as recent_hires,
        COUNT(e.id) as total_employees,
        ROUND(
          (COUNT(CASE WHEN e.hire_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) THEN 1 END) / 
           NULLIF(COUNT(CASE WHEN e.hire_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH) THEN 1 END), 0)) * 100, 
          2
        ) as growth_rate
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
      ORDER BY growth_rate DESC
    `);
    
    res.json({
      monthlyGrowth,
      departmentGrowth
    });
  } catch (error) {
    console.error('Error fetching growth analytics:', error);
    res.status(500).json({ error: 'Failed to fetch growth analytics' });
  } finally {
    if (connection) connection.release();
  }
});

// ========== REAL-TIME METRICS ==========
router.get('/reports/realtime-metrics', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Current month statistics
    const [currentMonth] = await connection.query(`
      SELECT 
        COUNT(CASE WHEN MONTH(hire_date) = MONTH(CURDATE()) AND YEAR(hire_date) = YEAR(CURDATE()) THEN 1 END) as this_month_hires,
        COUNT(CASE WHEN hire_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as this_week_hires,
        COUNT(*) as total_employees
      FROM employees
    `);
    
    // Department activity
    const [departmentActivity] = await connection.query(`
      SELECT 
        d.id,
        d.name as department,
        COUNT(e.id) as total_employees,
        COUNT(CASE WHEN e.hire_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as recent_activity
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
      ORDER BY recent_activity DESC
    `);
    
    res.json({
      currentStats: currentMonth[0],
      departmentActivity
    });
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time metrics' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;