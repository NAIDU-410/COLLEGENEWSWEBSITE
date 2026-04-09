import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>; // Placeholder for now

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location, message: "Please login to access this page" }} replace />;
    }

    if (user?.role !== 'student' && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
