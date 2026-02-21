import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Truck, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (d) => {
    const ok = await registerUser({ username: d.username, email: d.email, password: d.password, role_id: 2 });
    if (ok) navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F6F8FB', padding: 'clamp(12px, 4vw, 24px)',
    }}>
      <div className="anim-fade-up" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 5vw, 32px)' }}>
          <div style={{
            width: 'clamp(40px, 12vw, 52px)', height: 'clamp(40px, 12vw, 52px)', borderRadius: 'clamp(12px, 3vw, 16px)',
            background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: `0 auto clamp(10px, 2vw, 14px)`,
            boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
          }}>
            <Truck size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Create account</h1>
          <p style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#94a3b8', margin: 0 }}>Join FleetFlow management</p>
        </div>

        {/* Card */}
        <div className="ff-card" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: 'clamp(14px, 3vw, 18px)' }}>
              <label style={{ display: 'block', fontSize: 'clamp(12px, 2.5vw, 13px)', fontWeight: 500, color: '#334155', marginBottom: 6 }}>Username</label>
              <input type="text" {...register('username', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })}
                className="ff-input" placeholder="johndoe" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }} />
              {errors.username && <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#dc2626', margin: '4px 0 0' }}>{errors.username.message}</p>}
            </div>

            <div style={{ marginBottom: 'clamp(14px, 3vw, 18px)' }}>
              <label style={{ display: 'block', fontSize: 'clamp(12px, 2.5vw, 13px)', fontWeight: 500, color: '#334155', marginBottom: 6 }}>Email</label>
              <input type="email" {...register('email', { required: 'Required' })}
                className="ff-input" placeholder="you@company.com" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }} />
              {errors.email && <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#dc2626', margin: '4px 0 0' }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 'clamp(18px, 4vw, 24px)' }}>
              <label style={{ display: 'block', fontSize: 'clamp(12px, 2.5vw, 13px)', fontWeight: 500, color: '#334155', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                  className="ff-input" style={{ paddingRight: 42, fontSize: 'clamp(12px, 2vw, 13px)' }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                  }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#dc2626', margin: '4px 0 0' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 'clamp(10px, 2.5vw, 12px) 0', borderRadius: 14, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#94a3b8', marginTop: 'clamp(16px, 4vw, 20px)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
