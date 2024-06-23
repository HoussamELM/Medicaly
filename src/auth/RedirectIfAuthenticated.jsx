// src/auth/RedirectIfAuthenticated.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const RedirectIfAuthenticated = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (currentUser) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default RedirectIfAuthenticated;