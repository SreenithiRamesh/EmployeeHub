import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmployeeForm from './EmployeeForm';

const API_URL = 'http://localhost:5000/api/employees';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (employeeData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Submitting employee data:', employeeData);

      const dataToSubmit = {
        first_name: employeeData.first_name?.trim(),
        last_name: employeeData.last_name?.trim(),
        email: employeeData.email?.trim(),
        phone: employeeData.phone?.trim() || null,
        department_id: employeeData.department_id ? parseInt(employeeData.department_id) : null,
        position: employeeData.position?.trim() || null,
        salary: employeeData.salary ? parseFloat(employeeData.salary) : null,
        hire_date: employeeData.hire_date || null,
        status: employeeData.status || 'Active',
        skills: Array.isArray(employeeData.skills) 
          ? employeeData.skills
              .map(skill => {
                if (skill === null || skill === undefined) return null;
                if (typeof skill === 'string') return skill.trim();
                if (typeof skill === 'number') return skill.toString();
                if (typeof skill === 'object' && skill.value) return skill.value.toString().trim();
                if (typeof skill === 'object' && skill.name) return skill.name.toString().trim();
                return skill.toString().trim();
              })
              .filter(skill => skill && skill !== '')
          : []
      };

      // Validation checks
      if (!dataToSubmit.first_name || dataToSubmit.first_name.length === 0) {
        setError('First name is required');
        return;
      }

      if (!dataToSubmit.last_name || dataToSubmit.last_name.length === 0) {
        setError('Last name is required');
        return;
      }

      if (!dataToSubmit.email || dataToSubmit.email.length === 0) {
        setError('Email is required');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dataToSubmit.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!dataToSubmit.department_id) {
        setError('Department is required');
        return;
      }

      // Field length validations
      if (dataToSubmit.first_name.length > 50) {
        setError('First name must be less than 50 characters');
        return;
      }

      if (dataToSubmit.last_name.length > 50) {
        setError('Last name must be less than 50 characters');
        return;
      }

      if (dataToSubmit.email.length > 100) {
        setError('Email must be less than 100 characters');
        return;
      }

      if (dataToSubmit.phone && dataToSubmit.phone.length > 20) {
        setError('Phone number must be less than 20 characters');
        return;
      }

      if (dataToSubmit.position && dataToSubmit.position.length > 100) {
        setError('Position must be less than 100 characters');
        return;
      }

      // Salary validation
      if (dataToSubmit.salary !== null) {
        if (isNaN(dataToSubmit.salary) || dataToSubmit.salary < 0) {
          setError('Please enter a valid salary amount (positive number)');
          return;
        }
        if (dataToSubmit.salary > 9999999.99) {
          setError('Salary amount is too large');
          return;
        }
      }

      // Date validation
      if (dataToSubmit.hire_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dataToSubmit.hire_date)) {
          setError('Please enter a valid date in YYYY-MM-DD format');
          return;
        }
        
        const hireDate = new Date(dataToSubmit.hire_date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (hireDate > today) {
          setError('Hire date cannot be in the future');
          return;
        }
      }

      // Skills validation
      if (dataToSubmit.skills.length > 10) {
        setError('Maximum 10 skills allowed');
        return;
      }

      const uniqueSkills = [...new Set(dataToSubmit.skills.map(skill => skill.toLowerCase()))];
      if (uniqueSkills.length !== dataToSubmit.skills.length) {
        setError('Duplicate skills are not allowed');
        return;
      }

      const response = await axios.post(API_URL, dataToSubmit, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      navigate('/employees');

    } catch (error) {
      let errorMessage = 'Failed to create employee. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            errorMessage = `Validation Error: ${serverMessage || 'Please check your input data.'}`;
            break;
          case 422:
            errorMessage = `Data Error: ${serverMessage || 'Please check your input data format.'}`;
            break;
          case 500:
            if (serverMessage && serverMessage.includes('Duplicate entry')) {
              if (serverMessage.includes('email')) {
                errorMessage = 'An employee with this email address already exists.';
              } else {
                errorMessage = 'An employee with this information already exists.';
              }
            } else if (serverMessage && serverMessage.includes('foreign key constraint')) {
              errorMessage = 'Invalid department or skill selected. Please refresh the page and try again.';
            } else if (serverMessage && serverMessage.includes('Data too long')) {
              errorMessage = 'One or more fields contain too much data. Please shorten your input.';
            } else {
              errorMessage = `Server Error: ${serverMessage || 'Please contact support if this persists.'}`;
            }
            break;
          case 404:
            errorMessage = 'Server endpoint not found. Please check if the server is running.';
            break;
          case 503:
            errorMessage = 'Server is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = `Error (${status}): ${serverMessage || 'Unknown error occurred.'}`;
        }
      } else if (error.request) {
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please ensure the server is running on port 5000.';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. The server is taking too long to respond.';
        } else {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) {
      setError('Please wait for the current operation to complete.');
      return;
    }
    
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel? Any unsaved changes will be lost.'
    );
    
    if (confirmCancel) {
      navigate('/employees');
    }
  };

  // Inline styles
  const styles = {
  
    errorMessage: {
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      padding: '10px 15px',
      borderRadius: '4px',
      marginBottom: '20px'
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: 'white',
      fontSize: '1.2rem',
      fontFamily: 'Arial, sans-serif'
    },
    loadingContent: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '20px 30px',
      borderRadius: '10px',
      backdropFilter: 'blur(10px)'
    },
    loadingSpinner: {
      width: '30px',
      height: '30px',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderTop: '3px solid #ffffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '15px'
    },
    spinAnimation: `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
  };

  return (
    <div style={styles.formPage}>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {isSubmitting && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.loadingSpinner}></div>
            Creating employee...
          </div>
          <style>{styles.spinAnimation}</style>
        </div>
      )}

      <EmployeeForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={{}}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}