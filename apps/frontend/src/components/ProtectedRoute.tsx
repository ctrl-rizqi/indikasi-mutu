import { Navigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" search={{ redirect: window.location.pathname }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;