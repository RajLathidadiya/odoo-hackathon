import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Truck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (d) => {
    const ok = await login(d.email, d.password);
    if (ok) navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F6F8FB', padding: 20,
    }}>
      <div className="anim-fade-up" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
          }}>
            <Truck size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>FleetFlow</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Fleet & Logistics Management</p>
        </div>

        {/* Card */}
        <div className="ff-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                {...register('email', { required: 'Required' })}
                className="ff-input"
                placeholder="you@company.com"
              />
              {errors.email && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Required' })}
                  className="ff-input"
                  style={{ paddingRight: 42 }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                  }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0', borderRadius: 14, fontSize: 14 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
