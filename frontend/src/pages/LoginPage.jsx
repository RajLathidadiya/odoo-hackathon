import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Truck, Eye, EyeOff, ArrowRight, Shield, BarChart3, MapPin } from 'lucide-react';

const features = [
  { icon: Truck, text: 'Fleet lifecycle management' },
  { icon: MapPin, text: 'Real-time trip dispatching' },
  { icon: Shield, text: 'Driver safety & compliance' },
  { icon: BarChart3, text: 'Financial analytics & ROI' },
];

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
      minHeight: '100vh',
      display: 'flex',
      background: '#F0F2F8',
    }}>
      {/* Left side — branding panel (hidden on mobile) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: '0 0 44%',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #1a1b4b 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(79,70,229,0.12)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(129,140,248,0.08)',
        }} />
        <div style={{
          position: 'absolute', top: '45%', left: '55%',
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(79,70,229,0.06)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
          }}>
            <Truck size={22} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>FleetFlow</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fleet Management</p>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 16px',
          lineHeight: 1.2, letterSpacing: '-0.03em',
        }}>
          Manage your fleet<br />
          <span style={{ color: '#818cf8' }}>smarter & faster</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 48px', lineHeight: 1.6 }}>
          The all-in-one platform for fleet operations, driver compliance, and financial analytics.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {features.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(129,140,248,0.15)',
                border: '1px solid rgba(129,140,248,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={14} color="#818cf8" />
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side — form */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 48px)',
      }}>
        <div className="anim-fade-up" style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 15,
              background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
            }}>
              <Truck size={22} color="#fff" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>FleetFlow</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Fleet & Logistics Management</p>
          </div>

          {/* Form card */}
          <div style={{
            background: '#fff',
            borderRadius: 22,
            padding: 'clamp(24px, 5vw, 36px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid rgba(226,232,240,0.6)',
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 800, color: '#0f172a',
              margin: '0 0 6px', letterSpacing: '-0.02em',
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 28px', fontWeight: 500 }}>
              Sign in to your account to continue
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block', fontSize: 12.5, fontWeight: 600,
                  color: '#334155', marginBottom: 7, letterSpacing: '0.01em',
                }}>
                  Email address
                </label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="ff-input"
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p style={{ fontSize: 12, color: '#dc2626', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    ⚠ {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: 'block', fontSize: 12.5, fontWeight: 600,
                  color: '#334155', marginBottom: 7, letterSpacing: '0.01em',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    className="ff-input"
                    style={{ paddingRight: 44 }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                      padding: 0, transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: 12, color: '#dc2626', margin: '5px 0 0' }}>
                    ⚠ {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 0',
                  borderRadius: 13,
                  fontSize: 14,
                  letterSpacing: '0.01em',
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      animation: 'spin 0.75s linear infinite',
                      flexShrink: 0,
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            <p style={{
              textAlign: 'center', fontSize: 13, color: '#94a3b8',
              marginTop: 22, fontWeight: 500,
            }}>
              No account?{' '}
              <Link
                to="/register"
                style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
