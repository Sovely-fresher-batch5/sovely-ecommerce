import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

const RoleProtectedRoute = ({ element, allowedRoles = ['B2B', 'ADMIN'] }) => {
  const { user } = useContext(AuthContext);
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user role is not in allowed roles, redirect to home or show access denied
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

export default RoleProtectedRoute;