import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../api/auth';

export const ProtectedRoute: React.FC = () => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
