export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 16, md: 28, lg: 40 };
  const s = sizes[size] || 28;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: s, height: s, borderRadius: '50%',
        border: `${s > 24 ? 3 : 2.5}px solid #e2e8f0`,
        borderTopColor: '#4f46e5',
        borderRightColor: '#818cf8',
        animation: 'spin 0.75s cubic-bezier(0.5, 0, 0.5, 1) infinite',
      }} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 300, flexDirection: 'column', gap: 16,
    }}>
      {/* Layered spinner */}
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid #eef2ff',
          borderTopColor: '#4f46e5',
          animation: 'spin 0.75s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          borderRadius: '50%',
          border: '2.5px solid #e0e7ff',
          borderBottomColor: '#818cf8',
          animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse',
        }} />
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 500, letterSpacing: '0.01em' }}>
        Loading...
      </p>
    </div>
  );
}
