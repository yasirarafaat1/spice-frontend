import AdminLogin from './AdminLogin';
import { useAdminAuth } from '../../../context/AdminAuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isAdminLoggedIn, login } = useAdminAuth();

    // If admin is not logged in, show login page
    if (!isAdminLoggedIn) {
        return <AdminLogin onLoginSuccess={login} />;
    }

    // If admin is logged in, show admin panel
    return <>{children}</>;
}
