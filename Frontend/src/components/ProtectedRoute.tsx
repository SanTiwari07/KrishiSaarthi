import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
    const { user } = useApp();

    // If we are strictly checking roles from AuthContext
    if (!user) {
        // Check if we are trying to access public-facing dApp pages (Validator/Buyer)
        // These pages now handle their own "Connect Wallet" state, so we should arguably ALLOW them 
        // even if not "logged in" via traditional Auth, as long as the route is one of those.
        // However, the current Router setup wraps them in ProtectedRoute.

        // TEMPORARY FIX: If role is 'validator' or 'buyer', we might want to bypass this strict check 
        // IF the new design intends these to be dApps accessible via Wallet only.
        // But for now, let's assume the user MUST login via the Auth Page to get a role.

        // WAIT: The user said "Validator and Buyer cannot visible". 
        // If they are logging in as "Farmer", they can't see them? 
        // Or are they trying to access them without login?

        // If the goal is "Connect Wallet" -> "Use Validator Dashboard", then we must REMOVE 
        // ProtectedRoute from App.tsx for these routes, OR update ProtectedRoute to allow 
        // access if they are just visiting.

        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
