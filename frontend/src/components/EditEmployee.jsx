import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';

const API_URL = 'http://localhost:5000/api/employees';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function fetchEmployee() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/${id}`);
        
        // Transform the data to match the form structure
        const employee = res.data;
        const transformedData = {
          id: employee.id,
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          department_id: employee.department_id || '',
          position: employee.position || '',
          salary: employee.salary || '',
          hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
          status: employee.status || 'Active',
          skills: employee.skills || []
        };
        
        setEmployeeData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching employee:', err);
        if (err.response?.status === 404) {
          setError('Employee not found');
        } else {
          setError('Failed to load employee data');
        }
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError('');

    try {
      console.log('Updating employee with data:', formData);

      // Map frontend fields to database schema
      const dataToSubmit = {
        first_name: formData.first_name?.trim(),
        last_name: formData.last_name?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim() || null,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        position: formData.position?.trim() || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        hire_date: formData.hire_date || null,
        status: formData.status || 'Active',
        skills: Array.isArray(formData.skills) 
          ? formData.skills
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
        setSubmitError('First name is required');
        return;
      }

      if (!dataToSubmit.last_name || dataToSubmit.last_name.length === 0) {
        setSubmitError('Last name is required');
        return;
      }

      if (!dataToSubmit.email || dataToSubmit.email.length === 0) {
        setSubmitError('Email is required');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dataToSubmit.email)) {
        setSubmitError('Please enter a valid email address');
        return;
      }

      if (!dataToSubmit.department_id) {
        setSubmitError('Department is required');
        return;
      }

      // Field length validations
      if (dataToSubmit.first_name.length > 50) {
        setSubmitError('First name must be less than 50 characters');
        return;
      }

      if (dataToSubmit.last_name.length > 50) {
        setSubmitError('Last name must be less than 50 characters');
        return;
      }

      if (dataToSubmit.email.length > 100) {
        setSubmitError('Email must be less than 100 characters');
        return;
      }

      if (dataToSubmit.phone && dataToSubmit.phone.length > 20) {
        setSubmitError('Phone number must be less than 20 characters');
        return;
      }

      if (dataToSubmit.position && dataToSubmit.position.length > 100) {
        setSubmitError('Position must be less than 100 characters');
        return;
      }

      // Salary validation
      if (dataToSubmit.salary !== null) {
        if (isNaN(dataToSubmit.salary) || dataToSubmit.salary < 0) {
          setSubmitError('Please enter a valid salary amount (positive number)');
          return;
        }
        if (dataToSubmit.salary > 9999999.99) {
          setSubmitError('Salary amount is too large');
          return;
        }
      }

      // Date validation
      if (dataToSubmit.hire_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dataToSubmit.hire_date)) {
          setSubmitError('Please enter a valid date in YYYY-MM-DD format');
          return;
        }
        
        const hireDate = new Date(dataToSubmit.hire_date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (hireDate > today) {
          setSubmitError('Hire date cannot be in the future');
          return;
        }
      }

      // Skills validation
      if (dataToSubmit.skills.length > 10) {
        setSubmitError('Maximum 10 skills allowed');
        return;
      }

      const uniqueSkills = [...new Set(dataToSubmit.skills.map(skill => skill.toLowerCase()))];
      if (uniqueSkills.length !== dataToSubmit.skills.length) {
        setSubmitError('Duplicate skills are not allowed');
        return;
      }

      await axios.put(`${API_URL}/${id}`, dataToSubmit, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      navigate('/employees');

    } catch (error) {
      console.error('Error updating employee:', error);
      
      let errorMessage = 'Failed to update employee. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            errorMessage = `Validation Error: ${serverMessage || 'Please check your input data.'}`;
            break;
          case 404:
            errorMessage = 'Employee not found';
            break;
          case 422:
            errorMessage = `Data Error: ${serverMessage || 'Please check your input data format.'}`;
            break;
          case 500:
            if (serverMessage && serverMessage.includes('Duplicate entry')) {
              if (serverMessage.includes('email')) {
                errorMessage = 'Another employee with this email address already exists.';
              } else {
                errorMessage = 'Another employee with this information already exists.';
              }
            } else if (serverMessage && serverMessage.includes('foreign key constraint')) {
              errorMessage = 'Invalid department or skill selected. Please refresh the page and try again.';
            } else if (serverMessage && serverMessage.includes('Data too long')) {
              errorMessage = 'One or more fields contain too much data. Please shorten your input.';
            } else {
              errorMessage = `Server Error: ${serverMessage || 'Please contact support if this persists.'}`;
            }
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
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) {
      setSubmitError('Please wait for the current operation to complete.');
      return;
    }
    
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel? Any unsaved changes will be lost.'
    );
    
    if (confirmCancel) {
      navigate('/employees');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid #ccc',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px',
        }}></div>
        Loading employee data...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        color: '#e74c3c',
        fontSize: '1.2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
        {error}
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => navigate('/employees')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{

    }}>

      {submitError && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {submitError}
        </div>
      )}

      {isSubmitting && (
        <div style={{
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
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '20px 30px',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTop: '3px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '15px'
            }}></div>
            Updating employee...
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <EmployeeForm 
        initialData={employeeData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}