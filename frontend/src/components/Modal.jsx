import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 420, md: 540, lg: 700, xl: 880 };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(16px, 4vw, 24px)',
    }}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="anim-fade-in"
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Panel */}
      <div
        className="anim-scale-in"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: widths[size] || 540,
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 22,
          boxShadow: '0 32px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255,255,255,0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
          background: 'linear-gradient(90deg, #fafbff, #fff)',
        }}>
          <h2 style={{
            fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 9,
              border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#94a3b8',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(18px, 4vw, 24px)', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
