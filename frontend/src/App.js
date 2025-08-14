import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; 

import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import AddEmployee from './components/AddEmployee';
import EditEmployee from './components/EditEmployee';
import Reports from './pages/Reports'; 
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// ProtectedRoute component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuth();
   
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
 
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }
 
  return children;
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
                     
       
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            

            <Route path="/old-dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
 
            <Route path="/employees" element={
              <ProtectedRoute roles={['HR', 'Manager']}>
                <EmployeeList />
              </ProtectedRoute>
            } />

            <Route path="/employees/add" element={
              <ProtectedRoute roles={['HR']}>
                <AddEmployee />
              </ProtectedRoute>
            } />
            
            <Route path="/add-employee" element={
              <ProtectedRoute roles={['HR']}>
                <AddEmployee />
              </ProtectedRoute>
            } />
    
            <Route path="/employees/edit/:id" element={
              <ProtectedRoute roles={['HR']}>
                <EditEmployee />
              </ProtectedRoute>
            } />
            
            <Route path="/edit/:id" element={
              <ProtectedRoute roles={['HR']}>
                <EditEmployee />
              </ProtectedRoute>
            } />

            
            <Route path="/reports" element={  
              <ProtectedRoute roles={['HR', 'Manager']}>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute roles={['HR']}>
                <div>Settings Page - Coming Soon</div>
              </ProtectedRoute>
            } />
                     
   
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
