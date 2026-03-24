import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { ROUTES } from '../utils/routes';

const ResellerRoute = () => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // Show nothing while checking auth state to prevent flashing
    if (loading) return null;

    // If not logged in, boot to login
    if (!user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // FIXED: Changed 'USER' to 'CUSTOMER' to match your backend Mongoose schema!
    const hasAccess = user.role === 'ADMIN' || user.role === 'RESELLER' || user.role === 'CUSTOMER';

    if (!hasAccess) {
        // If they somehow have a restricted role, send them to the homepage
        return <Navigate to={ROUTES.HOME} replace />;
    }

    // CRITICAL FIX: Use Outlet to render the nested child routes (MyAccount, Settings, etc.)
    return <Outlet />;
};

export default ResellerRoute;
