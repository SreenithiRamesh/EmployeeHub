import React, { useState, useEffect } from 'react';

const EmployeeForm = ({ initialData = {}, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    salary: '',
    hire_date: '',
    status: 'Active',
    skills: []
  });
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  useEffect(() => {
   
    if (initialData && Object.keys(initialData).length > 0) {
      // Convert hire_date to proper format for input[type="date"]
      let hireDate = '';
      if (initialData.hire_date) {
        hireDate = new Date(initialData.hire_date).toISOString().split('T')[0];
      }

      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department_id: initialData.department_id || '',
        position: initialData.position || '',
        salary: initialData.salary || '',
        hire_date: hireDate,
        status: initialData.status || 'Active',
        skills: initialData.skills || []
      });
    }
    loadFormData();
  }, [initialData]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading departments
      const fallbackDepartments = [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Human Resources' },
        { id: 3, name: 'Marketing' },
        { id: 4, name: 'Sales' },
        { id: 5, name: 'Finance' },
        { id: 6, name: 'Operations' }
      ];
      setDepartments(fallbackDepartments);

      // Simulate loading skills
      const fallbackSkills = [
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'Python' },
        { id: 3, name: 'Java' },
        { id: 4, name: 'C++' },
        { id: 5, name: 'React' },
        { id: 6, name: 'Vue.js' },
        { id: 7, name: 'Docker' },
        { id: 8, name: 'Kubernetes' },
        { id: 9, name: 'AWS' },
        { id: 10, name: 'Azure' },
        { id: 11, name: 'Node.js' },
        { id: 12, name: 'SQL' },
        { id: 13, name: 'MongoDB' },
        { id: 14, name: 'Git' },
        { id: 15, name: 'Agile' }
      ];
      setSkills(fallbackSkills);
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading form data:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSkillToggle = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillName)
        ? prev.skills.filter(name => name !== skillName)
        : [...prev.skills, skillName]
    }));
  };

  const handleSkillAdd = (skillName) => {
    if (!formData.skills.includes(skillName)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillName]
      }));
    }
    setSkillSearchTerm('');
  };

  const handleSkillRemove = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(name => name !== skillName)
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }

    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.department_id) {
      setError('Department is required');
      return;
    }

    if (!formData.hire_date) {
      setError('Hire date is required');
      return;
    }

    // Prepare submission data
    const submissionData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      department_id: parseInt(formData.department_id),
      position: formData.position.trim() || null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      hire_date: formData.hire_date,
      status: formData.status,
      skills: formData.skills
    };

    console.log('Submitting form data:', submissionData);
    if (onSubmit) {
      onSubmit(submissionData);
    }
  };

  const getFilteredSkills = () => {
    return skills.filter(skill => 
      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
      !formData.skills.includes(skill.name)
    );
  };

  const getNewSkillSuggestion = () => {
    if (skillSearchTerm.trim().length > 0 && 
        !skills.some(skill => skill.name.toLowerCase() === skillSearchTerm.toLowerCase()) &&
        !formData.skills.includes(skillSearchTerm.trim())) {
      return skillSearchTerm.trim();
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: '#64748b',
          fontSize: '16px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e2e8f0',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading form options...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #f1f5f9',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        paddingBottom: '24px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0',
          letterSpacing: '-0.025em'
        }}>
          {initialData && initialData.id ? 'Edit Employee' : 'Add New Employee'}
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#64748b',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          {initialData && initialData.id ? 'Update employee information' : 'Enter employee details to add them to the system'}
        </p>
      </div>

      {error && (
        <div style={{
          color: '#dc2626',
          marginBottom: '24px',
          textAlign: 'center',
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          border: '1px solid #f1f5f9'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '4px',
              height: '20px',
              backgroundColor: '#3b82f6',
              borderRadius: '2px'
            }}></div>
            Personal Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                First Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Last Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Email <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
        </div>

        {/* Job Information Section */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          border: '1px solid #f1f5f9'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Job Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Department <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Enter job position"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary amount"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Hire Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ maxWidth: '300px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '14px'
              }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          border: '1px solid #f1f5f9'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Skills & Expertise
          </h3>
          
          {/* Skills Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search skills or type a new skill..."
              value={skillSearchTerm}
              onChange={(e) => setSkillSearchTerm(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            
 
            {skillSearchTerm && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                {/* Existing skills */}
                {getFilteredSkills().slice(0, 5).map(skill => (
                  <div
                    key={skill.id}
                    onClick={() => handleSkillAdd(skill.name)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: '14px',
                      transition: 'background-color 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {skill.name}
                  </div>
                ))}
                
                
                {getNewSkillSuggestion() && (
                  <div
                    onClick={() => handleSkillAdd(getNewSkillSuggestion())}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: '#ecfdf5',
                      fontWeight: '600',
                      color: '#059669',
                      fontSize: '14px',
                      transition: 'background-color 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#d1fae5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ecfdf5'}
                  >
                    + Add new skill: "{getNewSkillSuggestion()}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Skills */}
          {formData.skills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                Selected Skills ({formData.skills.length}):
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {formData.skills.map((skillName, index) => (
                  <div key={index} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {skillName}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skillName)}
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Grid */}
          {skills.length > 0 && (
            <>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                Or select from existing skills:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px',
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '2px solid #f3f4f6',
                maxHeight: '250px',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                {skills.map(skill => (
                  <label
                    key={skill.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      opacity: isSubmitting ? 0.6 : 1,
                      backgroundColor: formData.skills.includes(skill.name) ? '#dbeafe' : '#f9fafb',
                      border: formData.skills.includes(skill.name) ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      fontSize: '14px',
                      fontWeight: formData.skills.includes(skill.name) ? '600' : '400',
                      boxShadow: formData.skills.includes(skill.name) ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!formData.skills.includes(skill.name)) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.skills.includes(skill.name)) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill.name)}
                      onChange={() => handleSkillToggle(skill.name)}
                      disabled={isSubmitting}
                      style={{
                        accentColor: '#3b82f6',
                        transform: 'scale(1.1)',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      color: formData.skills.includes(skill.name) ? '#1e40af' : '#374151'
                    }}>
                      {skill.name}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '2px solid #f1f5f9'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: '600',
              border: '2px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#6b7280',
              borderRadius: '10px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              minWidth: '140px',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              backgroundColor: isSubmitting ? '#95a5a6' : '#3498db',
              color: 'white',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              minWidth: '120px'
            }}
          >
            {isSubmitting ? 'Submitting...' : (initialData.id ? 'Update Employee' : 'Add Employee')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;