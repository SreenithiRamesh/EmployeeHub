import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/employees';

// SVG Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const SortAscIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);

const SortDescIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M19 12l-7 7-7-7"/>
  </svg>
);

const EmptyStateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7f8c8d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);
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
export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'first_name', order: 'asc' });
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        sortBy: sort.field,
        sortOrder: sort.order
      };
      const res = await axios.get(API_URL, { params });
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchEmployees();
    } catch (err) {
      alert('Failed to delete employee');
      console.error('Error deleting employee:', err);
    }
  };

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchEmployees();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data when pagination or sort changes
  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, sort]);

  // Helper function to get full name
  const getFullName = (employee) => {
    const firstName = employee.first_name || '';
    const lastName = employee.last_name || '';
    return `${firstName} ${lastName}`.trim() || employee.name || 'N/A';
  };

  // Helper function to format salary
  const formatSalary = (salary) => {
    if (!salary) return '-';
    return `$${parseFloat(salary).toLocaleString()}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Styles
  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  };

  const contentStyle = {
    padding: '2rem',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px',
  };

  const titleStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0',
  };

  const addButtonStyle = {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
  };

  const searchContainerStyle = {
    marginBottom: '25px',
    position: 'relative',
    width: '100%',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '14px 16px 14px 45px',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#7f8c8d',
    fontSize: '1.2rem',
  };

  const tableContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    marginBottom: '25px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '16px 12px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.2s ease',
    borderBottom: 'none',
  };

  const tdStyle = {
    padding: '14px 12px',
    borderBottom: '1px solid #ecf0f1',
    fontSize: '0.95rem',
    color: '#2c3e50',
  };

  const actionButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    margin: '0 2px',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const editButtonStyle = {
    ...actionButtonStyle,
    color: '#667eea',
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    color: '#e74c3c',
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  };

  const pageButtonStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    backgroundColor: '#ffffff',
    color: '#2c3e50',
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  };

  const activePageButtonStyle = {
    ...pageButtonStyle,
    backgroundColor: '#667eea',
    color: 'white',
    border: '1px solid #667eea',
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
    color: '#7f8c8d',
  };

  const errorStyle = {
    backgroundColor: '#fdf2f2',
    color: '#e74c3c',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    margin: '20px 0',
    border: '1px solid #fecaca',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#7f8c8d',
    fontSize: '1.1rem',
  };

  const spinnerStyle = {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
    marginRight: '10px',
  };

  const statusBadgeStyle = (status) => ({
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '500',
    backgroundColor: status === 'Active' ? '#d4edda' : 
                    status === 'On Leave' ? '#fff3cd' : '#f8d7da',
    color: status === 'Active' ? '#155724' : 
           status === 'On Leave' ? '#856404' : '#721c24',
  });

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    
    // Always show first page
    if (totalPages > 0) pages.push(1);
    
    // Show ellipsis if needed
    if (currentPage > 3) pages.push('...');
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) pages.push('...');
    
    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
    
    return pages;
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          Loading employees...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
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
          <button className="nav-item active" onClick={() => navigate('/employees')}>
            <EmployeesIcon />
            Employees
          </button>
          <button className="nav-item" onClick={() => navigate('/reports')}>
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
      <div style={contentStyle}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .search-input:focus {
              border-color: #667eea !important;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
              outline: none !important;
            }
            
            .add-btn:hover {
              background-color: #5a67d8 !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
            }
            
            .table-header:hover {
              background-color: #5a67d8 !important;
            }
            
            .table-row:hover {
              background-color: #f8f9fa !important;
            }
            
            .edit-btn:hover {
              background-color: rgba(102, 126, 234, 0.1) !important;
            }
            
            .delete-btn:hover {
              background-color: #ffebee !important;
            }
            
            .page-btn:hover:not(.active) {
              background-color: #f8f9fa !important;
              border-color: #667eea !important;
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

        .brand-text {
          margin-left: 0.5rem;
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
          gap: 0.5rem;
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

        .dropdown-arrow {
          font-size: 0.8rem;
          transition: transform 0.3s ease;
        }

        .profile-dropdown:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        /* Icon Styles */
        .nav-item svg {
          width: 1.2em;
          height: 1.2em;
        }
          `}
        </style>

        <div style={headerStyle}>
          <h1 style={titleStyle}></h1>
          <button 
            onClick={() => navigate('/add')} 
            style={addButtonStyle}
            className="add-btn"
          >
            <AddIcon />
            Add Employee
          </button>
        </div>

        <div style={searchContainerStyle}>
          <div style={searchIconStyle}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search employees by name, department, position, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInputStyle}
            className="search-input"
          />
        </div>

        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('first_name')} 
                  style={thStyle}
                  className="table-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Name 
                    {sort.field === 'first_name' && (sort.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('email')} 
                  style={thStyle}
                  className="table-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Email 
                    {sort.field === 'email' && (sort.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('department_name')} 
                  style={thStyle}
                  className="table-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Department 
                    {sort.field === 'department_name' && (sort.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('position')} 
                  style={thStyle}
                  className="table-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Position 
                    {sort.field === 'position' && (sort.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('salary')} 
                  style={thStyle}
                  className="table-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Salary 
                    {sort.field === 'salary' && (sort.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('hire_date')} 
                  style={thStyle}
                  className="table-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Hire Date 
                    {sort.field === 'hire_date' && (sort.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')} 
                  style={thStyle}
                  className="table-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Status 
                    {sort.field === 'status' && (sort.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                  </div>
                </th>
                <th style={{ ...thStyle, cursor: 'default' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="8" style={emptyStateStyle}>
                    <div style={{ marginBottom: '10px' }}><EmptyStateIcon /></div>
                    <div>No employees found</div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="table-row">
                    <td style={tdStyle}>{getFullName(emp)}</td>
                    <td style={tdStyle}>{emp.email || '-'}</td>
                    <td style={tdStyle}>{emp.department_name || emp.department || '-'}</td>
                    <td style={tdStyle}>{emp.position || emp.role || '-'}</td>
                    <td style={tdStyle}>{formatSalary(emp.salary)}</td>
                    <td style={tdStyle}>{formatDate(emp.hire_date || emp.joining_date)}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(emp.status || 'Active')}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => navigate(`/edit/${emp.id}`)}
                        style={editButtonStyle}
                        className="edit-btn"
                        title="Edit Employee"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        style={deleteButtonStyle}
                        className="delete-btn"
                        title="Delete Employee"
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={paginationStyle}>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              style={{
                ...pageButtonStyle,
                opacity: pagination.page === 1 ? 0.5 : 1,
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              First
            </button>
            
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              style={{
                ...pageButtonStyle,
                opacity: pagination.page === 1 ? 0.5 : 1,
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Prev
            </button>

            {generatePageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={index} style={{ color: '#7f8c8d', padding: '0 5px' }}>...</span>
              ) : (
                <button
                  key={index}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  style={pagination.page === pageNum ? activePageButtonStyle : pageButtonStyle}
                  className={pagination.page === pageNum ? 'active' : 'page-btn'}
                >
                  {pageNum}
                </button>
              )
            ))}

            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              style={{
                ...pageButtonStyle,
                opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
            
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
              disabled={pagination.page === pagination.totalPages}
              style={{
                ...pageButtonStyle,
                opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Last
            </button>
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '0.9rem', 
          color: '#7f8c8d' 
        }}>
          Showing {employees.length} of {pagination.total} employees
        </div>
      </div>
    </div>
  );
}