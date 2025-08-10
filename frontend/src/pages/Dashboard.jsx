import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPhoneAlt, FaEnvelope, FaRegBuilding } from "react-icons/fa";
import { MdHelpOutline } from "react-icons/md";
import { FaShieldAlt } from "react-icons/fa";
// SVG Icons
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
// Add these icon components to the existing ones in EmployeeDashboard
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
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"></path>
    <path d="M5 21V7l8-4v18"></path>
    <path d="M19 21V11l-6-4"></path>
    <path d="M9 9v.01"></path>
    <path d="M9 12v.01"></path>
    <path d="M9 15v.01"></path>
    <path d="M9 18v.01"></path>
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0L9.937 15.5Z"></path>
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line>
    <line x1="22" y1="11" x2="16" y2="11"></line>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4v16l-4-2-4 2V4"></path>
    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
    <line x1="8" y1="8" x2="16" y2="8"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <line x1="8" y1="16" x2="12" y2="16"></line>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
    <rect x="7" y="8" width="3" height="8"></rect>
    <rect x="14" y="12" width="3" height="4"></rect>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
    <path d="M16 8a6 6 0 0 1-6 6"></path>
    <path d="M8 14a6 6 0 0 1 6-6"></path>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    newHires: 0,
    avgSalary: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // API URLs - Updated to match your backend structure
  const API_BASE_URL = 'http://localhost:5000/api/employees';

  // Fetch dashboard statistics from your database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsResponse, activityResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard/stats`),
          axios.get(`${API_BASE_URL}/dashboard/recent-activity`)
        ]);
        
        setStats(statsResponse.data);
        setRecentActivity(activityResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to dummy data if API fails
        setStats({
          totalEmployees: 245,
          totalDepartments: 8,
          newHires: 12,
          avgSalary: 68500
        });
        setRecentActivity([
          { id: 1, type: 'add', action: 'Added new employee', name: 'John Doe - Software Engineer', time: '2 hours ago' },
          { id: 2, type: 'edit', action: 'Updated employee profile', name: 'Sarah Smith - HR Manager', time: '4 hours ago' },
          { id: 3, type: 'delete', action: 'Removed employee', name: 'Mike Johnson - Sales Rep', time: '1 day ago' },
          { id: 4, type: 'add', action: 'Added new employee', name: 'Emma Wilson - Designer', time: '2 days ago' },
          { id: 5, type: 'edit', action: 'Updated salary information', name: 'David Brown - Manager', time: '3 days ago' }
        ]);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    { 
      title: 'Add Employee', 
      icon: <UserPlusIcon />, 
      color: '#4CAF50',
      action: () => navigate('/employees/add')
    },
    { 
      title: 'View All Employees', 
      icon: <ListIcon />, 
      color: '#2196F3',
      action: () => navigate('/employees')
    },
    { 
      title: 'Reports', 
      icon: <BarChartIcon />, 
      color: '#FF9800',
      action: () => navigate('/reports')
    },
    { 
      title: 'Search Employees', 
      icon: <SearchIcon />, 
      color: '#9C27B0',
      action: () => navigate('/employees?focus=search')
    }
  ];

  const handleQuickAction = (action) => {
    action();
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
     {/* Navigation Bar */}
<nav className="navbar">
  <div className="nav-brand">
    <span className="brand-text">EmployeeHub</span>
  </div>
  <div className="nav-menu">
    <a href="#" className="nav-item active" onClick={() => navigate('/dashboard')}>
      <DashboardIcon />
      <span>Dashboard</span>
    </a>
    <a href="#" className="nav-item" onClick={() => navigate('/employees')}>
      <EmployeesIcon />
      <span>Employees</span>
    </a>
    <a href="#" className="nav-item" onClick={() => navigate('/reports')}>
      <ReportIcon />
      <span>Reports</span>
    </a>
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
      <main className="dashboard-main">
       

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E3F2FD' }}>
              <span style={{ color: '#1976D2' }}><UsersIcon /></span>
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : stats.totalEmployees}</h3>
              <p>Total Employees</p>
              <span className="stat-change positive">+5% from last month</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E8F5E8' }}>
              <span style={{ color: '#2E7D32' }}><BuildingIcon /></span>
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : stats.totalDepartments}</h3>
              <p>Departments</p>
              <span className="stat-change neutral">No change</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#FFF3E0' }}>
              <span style={{ color: '#F57C00' }}><SparkleIcon /></span>
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : stats.newHires}</h3>
              <p>New Hires (30 days)</p>
              <span className="stat-change positive">+12% from last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#F3E5F5' }}>
              <span style={{ color: '#7B1FA2' }}><DollarIcon /></span>
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : `$${stats.avgSalary.toLocaleString()}`}</h3>
              <p>Average Salary</p>
              <span className="stat-change positive">+3% from last month</span>
            </div>
          </div>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="content-grid">
          <div className="card">
            <div className="card-header">
              <h2>Quick Actions</h2>
              <p>Frequently used operations</p>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <div 
                  key={index} 
                  className="quick-action-card"
                  onClick={() => handleQuickAction(action.action)}
                  style={{ borderLeft: `4px solid ${action.color}` }}
                >
                  <div className="action-icon" style={{ color: action.color }}>{action.icon}</div>
                  <span>{action.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <p>Latest employee management actions</p>
            </div>
            <div className="activity-list">
              {loading ? (
                <div className="loading">Loading activities...</div>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'add' && <PlusIcon />}
                      {activity.type === 'edit' && <EditIcon />}
                      {activity.type === 'delete' && <TrashIcon />}
                    </div>
                    <div className="activity-content">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-name">{activity.name}</p>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
           
              <span className="brand-text">EmployeeHub</span>
            </div>
            <p className="footer-description">
              Streamline your employee management with our comprehensive HR solution.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" title="Follow us">
                <HeartIcon />
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#" onClick={() => navigate('/dashboard')}>Dashboard</a></li>
              <li><a href="#" onClick={() => navigate('/employees')}>Employees</a></li>
              <li><a href="#" onClick={() => navigate('/reports')}>Reports</a></li>
             
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
         
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Info</h3>
           <div className="contact-info">
  <p>
    <svg className="contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
    support@employeehub.com
  </p>
  <p>
    <svg className="contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
    +1 (555) 123-4567
  </p>
  <p>
    <svg className="contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
    123 Business St, Suite 100
  </p>
  <p>
    <svg className="contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"></circle>
      <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"></path>
    </svg>
    New York, NY 10001
  </p>
</div>

<style jsx>{`
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    color: #555;
  }
  
  .contact-info p {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
  }
  
  .contact-icon {
    flex-shrink: 0;
    color: #667eea;
  }
`}</style>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 EmployeeHub. All rights reserved.</p>
      <p>Made with <HeartIcon style={{ fill: '#e74c3c', stroke: '#e74c3c' }} />By SreenithiRamesh</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fa;
          color: #333;
        }

        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-attachment: fixed;
          display: flex;
          flex-direction: column;
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
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .brand-icon {
          font-size: 2rem;
        }

        .nav-menu {
          display: flex;
          gap: 2rem;
        }

       .nav-item {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-item svg {
    width: 1.2em;
    height: 1.2em;
  }
        .nav-item:hover,
        .nav-item.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
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

        .dropdown-arrow {
          font-size: 0.8rem;
          transition: transform 0.3s ease;
        }

        .profile-dropdown:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        /* Main Content Styles */
        .dashboard-main {
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .dashboard-header {
          margin-bottom: 2rem;
          color: white;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .dashboard-header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-content h3 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
          color: #2c3e50;
        }

        .stat-content p {
          color: #666;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .stat-change {
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }

        .stat-change.positive {
          color: #2e7d32;
          background: #e8f5e8;
        }

        .stat-change.neutral {
          color: #666;
          background: #f5f5f5;
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          margin-bottom: 1.5rem;
        }

        .card-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #2c3e50;
        }

        .card-header p {
          color: #666;
          font-size: 0.9rem;
        }

        /* Quick Actions */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .quick-action-card {
          padding: 1.5rem;
          border-radius: 12px;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .quick-action-card:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .action-icon {
          font-size: 2rem;
        }

        .quick-action-card span {
          font-weight: 500;
          color: #2c3e50;
          text-align: center;
        }

        /* Activity List */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          background: #f8f9fa;
          transition: background 0.2s ease;
        }

        .activity-item:hover {
          background: #e9ecef;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .activity-icon.add {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .activity-icon.edit {
          background: #fff3e0;
          color: #f57c00;
        }

        .activity-icon.delete {
          background: #ffebee;
          color: #d32f2f;
        }

        .activity-content {
          flex: 1;
        }

        .activity-action {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .activity-name {
          color: #666;
          font-size: 0.9rem;
        }

        .activity-time {
          color: #999;
          font-size: 0.85rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        /* Footer Styles */
        .footer {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          margin-top: auto;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 2rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .footer-section h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .footer-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 0.5rem;
        }

        .footer-links a {
          color: #666;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: #667eea;
        }

        .footer-social {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f8f9fa;
          border-radius: 50%;
          color: #666;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .contact-info p {
          color: #666;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-bottom {
          border-top: 1px solid #e0e0e0;
          padding: 1rem 2rem;
        }

        .footer-bottom-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #666;
          font-size: 0.9rem;
        }

        .footer-bottom-content p {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .bottom-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }

          .dashboard-main {
            padding: 1rem;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .footer-content {
            grid-template-columns: 1fr;
            padding: 2rem 1rem 1rem;
          }

          .footer-bottom-content {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .dashboard-header h1 {
            font-size: 2rem;
          }

          .profile-dropdown span {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 1rem;
          }

          .nav-brand .brand-text {
            display: none;
          }

          .footer-bottom {
            padding: 1rem;
          }
        
        }
        `}</style>
    </div>
  );
};

export default EmployeeDashboard;