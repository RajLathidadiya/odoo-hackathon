import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={onClose} className="anim-fade-in"
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} />

      <div className="anim-scale-in" style={{
        position: 'relative', width: '100%', maxWidth: 380,
        background: '#fff', borderRadius: 20, padding: 28,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: '#fef2f2', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={22} color="#dc2626" />
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 22px', lineHeight: 1.5 }}>{message}</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
            onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }}
            onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
