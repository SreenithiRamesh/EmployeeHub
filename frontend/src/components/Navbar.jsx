// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '1rem', backgroundColor: '#1976D2', color: '#fff' }}>
      <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#ffeb3b' : '#fff', fontWeight: 'bold' })} end>
        Employees
      </NavLink>
      <NavLink to="/add" style={({ isActive }) => ({ color: isActive ? '#ffeb3b' : '#fff' })}>
        Add Employee
      </NavLink>
      <NavLink to="/search" style={({ isActive }) => ({ color: isActive ? '#ffeb3b' : '#fff' })}>
        Search
      </NavLink>
      <NavLink to="/dashboard" style={({ isActive }) => ({ color: isActive ? '#ffeb3b' : '#fff' })}>
        Dashboard
      </NavLink>
    </nav>
  );
}
