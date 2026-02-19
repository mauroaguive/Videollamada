import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video } from 'lucide-react';

export default function PrivateRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-5"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="relative">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ backgroundColor: 'var(--color-primary-50)' }}
          >
            <Video className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div
            className="absolute -inset-3 rounded-3xl animate-spin"
            style={{
              border: '2px solid transparent',
              borderTopColor: 'var(--color-primary)',
              borderRightColor: 'var(--color-primary-light)',
            }}
          />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Cargando...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
