// src/pages/EmployeeSearch.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function EmployeeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      api.get(`/employees/search?q=${query}`)
        .then(res => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div style={{ padding: '1rem' }}>
      <input
        type="search"
        placeholder="Search employees by name, department, skills, projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      />

      {loading && <p>Searching...</p>}

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {results.map(emp => (
          <li key={emp.id} style={{ padding: '10px 0', borderBottom: '1px solid #ddd' }}>
            <strong>{emp.name}</strong> — {emp.department_name || emp.department} — {emp.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
