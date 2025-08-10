import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// SVG Icon Components

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const EmployeesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const DepartmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="M8 8h8"></path>
    <path d="M8 12h8"></path>
    <path d="M8 16h8"></path>
  </svg>
);

const SummaryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <line x1="8" y1="16" x2="16" y2="16"></line>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState([]);

  const API_BASE_URL = 'http://localhost:5000/api/employees';
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const departmentResponse = await fetch(`${API_BASE_URL}/dashboard/department-stats`);
      const departmentData = await departmentResponse.json();
      setDepartmentStats(departmentData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setLoading(false);
      setDepartmentStats([
        { department: 'Engineering', employee_count: 25, avg_salary: 85000 },
        { department: 'Sales', employee_count: 15, avg_salary: 65000 },
        { department: 'Marketing', employee_count: 12, avg_salary: 60000 },
        { department: 'HR', employee_count: 8, avg_salary: 55000 },
        { department: 'Finance', employee_count: 10, avg_salary: 70000 },
        { department: 'Operations', employee_count: 18, avg_salary: 62000 }
      ]);
    }
  };

  const DEPARTMENT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FF8042'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
         
          <span className="brand-text">EmployeeHub</span>
        </div>
        <div className="nav-menu">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <DashboardIcon />
            Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate('/employees')}>
            <EmployeesIcon />
            Employees
          </button>
          <button className="nav-item active" onClick={() => navigate('/reports')}>
            <ReportIcon />
            Reports
          </button>
        </div>
        <div className="nav-profile">
          <div className="profile-avatar">
            <span>AD</span>
          </div>
          <div className="profile-dropdown">
            <span>Admin User</span>
            <div className="dropdown-arrow">▼</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="reports-main">
        <div className="reports-header">
          <div className="header-content">
           
          </div>
          <div className="header-actions">
            <button className="export-btn" onClick={() => window.print()}>
              <PrintIcon />
              Print Report
            </button>
          </div>
        </div>

        {/* Charts Container */}
        <div className="charts-container">
          <div className="chart-row">
            {/* Pie Chart Section */}
            <div className="pie-chart-section">
              <div className="chart-card">
                <div className="card-header">
                  <h3>
                    <DepartmentIcon />
                    Department Distribution
                  </h3>
                  <p>Number of employees by department</p>
                </div>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={departmentStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="employee_count"
                      >
                        {departmentStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} employees`,
                          props.payload.department
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) =>
                          `${entry.payload.department} (${entry.payload.employee_count})`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Table Section */}
            <div className="summary-section">
              <div className="chart-card">
                <div className="card-header">
                  <h3>
                    <SummaryIcon />
                    Department Summary
                  </h3>
                  <p>Detailed department statistics</p>
                </div>
                <div className="summary-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Employees</th>
                        <th>Avg Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((dept, index) => (
                        <tr key={index}>
                          <td>
                            <span
                              className="dept-indicator"
                              style={{ backgroundColor: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length] }}
                            ></span>
                            {dept.department}
                          </td>
                          <td>{dept.employee_count}</td>
                          <td>${dept.avg_salary ? parseInt(dept.avg_salary).toLocaleString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .reports-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Navigation Styles */
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 1.5rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .brand-icon {
          display: flex;
          align-items: center;
        }

        .nav-menu {
          display: flex;
          gap: 1.5rem;
        }

        .nav-item {
          background: none;
          border: none;
          color: #666;
          font-weight: 500;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
        }

        .nav-item:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .nav-item.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.15);
        }

        .nav-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .profile-dropdown {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
        }

        /* Main Content */
        .reports-main {
          padding: 2rem;
          max-width: 100%;
          margin: 0 auto;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          color: white;
        }

        .header-content h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .header-content p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .export-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          padding: 0.7rem 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .export-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Charts Container */
        .charts-container {
          width: 100%;
          margin-top: 2rem;
        }

        .chart-row {
          display: flex;
          gap: 2rem;
          width: 100%;
        }

        .pie-chart-section {
          flex: 1;
          min-width: 0;
        }

        .summary-section {
          flex: 1;
          min-width: 0;
        }

        .chart-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .chart-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .card-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
        }

        .card-header p {
          color: #666;
          font-size: 1rem;
        }

        .chart-content {
          margin-bottom: 2rem;
          flex: 1;
        }

        /* Summary Table */
        .summary-table {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .summary-table table {
          width: 100%;
          border-collapse: collapse;
          flex: 1;
        }

        .summary-table th,
        .summary-table td {
          text-align: left;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .summary-table th {
          font-weight: 600;
          color: #2c3e50;
          background-color: #f8f9fa;
        }

        .summary-table td {
          color: #555;
        }

        .dept-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }

        /* Icon Styles */
        .brand-icon svg {
          width: 1.8em;
          height: 1.8em;
          color: #667eea;
        }

        .nav-item svg {
          width: 1.2em;
          height: 1.2em;
          margin-right: 8px;
        }

        .export-btn svg {
          width: 1.2em;
          height: 1.2em;
        }

        .card-header h3 svg {
          width: 1.2em;
          height: 1.2em;
          color: #667eea;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .chart-row {
            flex-direction: column;
          }
          
          .reports-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }
          
          .reports-main {
            padding: 1rem;
          }
          
          .chart-card {
            padding: 1.5rem;
          }
          
          .header-content h1 {
            font-size: 2rem;
          }
        }

        @media print {
          .navbar,
          .header-actions {
            display: none;
          }
          
          .reports-container {
            background: white;
          }
          
          .header-content h1,
          .header-content p {
            color: black;
          }
          
          .chart-card {
            box-shadow: none;
            border: 1px solid #ddd;
            margin-bottom: 2rem;
            page-break-inside: avoid;
          }

          .chart-row {
            display: flex;
            flex-direction: row;
          }

          @page {
            size: landscape;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;