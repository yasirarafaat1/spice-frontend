import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from "../utils/navigation";

/**
 * Custom hook to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 * @param redirectTo Path to redirect to if not authenticated (default: '/log')
 */
export const useAuthProtection = (redirectTo: string = '/log') => {
    const { go } = useNavigation();

    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Save the current path to redirect back after login
            if (window.location.pathname !== redirectTo) {
                localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
            }
            go(redirectTo);
        }
    }, [isAuthenticated, isLoading, redirectTo]);

    return { isAuthenticated, isLoading };
};