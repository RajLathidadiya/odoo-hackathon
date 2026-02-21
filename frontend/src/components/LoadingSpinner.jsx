export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 16, md: 28, lg: 40 };
  const s = sizes[size] || 28;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: s, height: s, borderRadius: '50%',
        border: `3px solid #e2e8f0`,
        borderTopColor: '#4f46e5',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="lg" />
        <p style={{ marginTop: 14, fontSize: 13, color: '#94a3b8' }}>Loading...</p>
      </div>
    </div>
  );
}
