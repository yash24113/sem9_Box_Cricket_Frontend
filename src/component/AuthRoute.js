import React from 'react';
import { Navigate } from 'react-router-dom';
// Simulate an authentication check
const AuthRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); 
  return isAuthenticated ? children : <Navigate to="/Signin" />;
};
export default AuthRoute;
