import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminAuthContextType {
    isAdminLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    // Check localStorage for admin login state (no session, just state)
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
        const saved = localStorage.getItem('adminLoggedIn');
        return saved === 'true';
    });

    const login = () => {
        setIsAdminLoggedIn(true);
        localStorage.setItem('adminLoggedIn', 'true');
    };

    const logout = () => {
        setIsAdminLoggedIn(false);
        localStorage.removeItem('adminLoggedIn');
    };

    return (
        <AdminAuthContext.Provider
            value={{
                isAdminLoggedIn,
                login,
                logout,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}

