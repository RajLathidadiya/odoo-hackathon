import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

/**
 * ProtectedRoute Component
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['Fleet Manager', 'Super Admin']}>
 *   <VehiclesPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, user, hasAnyRole } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access check
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F0F2F8',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '28rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <AlertCircle
            size={3}
            style={{
              margin: '0 auto 1rem',
              color: '#ef4444',
              width: '3rem',
              height: '3rem',
            }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Access Denied
          </h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Your current role (<strong>{user?.role_name}</strong>) does not have permission to
            access this page.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#999' }}>
            Required roles: {allowedRoles.join(', ')}
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#4F46E5',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#4338CA')}
            onMouseLeave={(e) => (e.target.style.background = '#4F46E5')}
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * RoleGate Component
 * 
 * Conditionally render content based on user role
 * Usage:
 * <RoleGate allowedRoles={['Fleet Manager']}>
 *   <button>Create Vehicle</button>
 * </RoleGate>
 */
export function RoleGate({ children, allowedRoles = [] }) {
  const { hasAnyRole } = useAuth();

  if (!hasAnyRole(allowedRoles)) {
    return null;
  }

  return children;
}

/**
 * RoleAware Component
 * 
 * Show different content based on role
 * Usage:
 * <RoleAware
 *   permitted={<AdminPanel />}
 *   fallback={<RestrictedMessage />}
 *   allowedRoles={['Super Admin']}
 * />
 */
export function RoleAware({ permitted, fallback = null, allowedRoles = [] }) {
  const { hasAnyRole } = useAuth();

  return hasAnyRole(allowedRoles) ? permitted : fallback;
}
