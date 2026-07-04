import React from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RoleRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role;

    if (!token) {
        toast.error('Please login to access this page');
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
        toast.error('You do not have permission to access this page');
        return <Navigate to="/" />;
    }

    return children;
};

export default RoleRoute;