const STATUS_CONFIG = {
  Available: { cls: 'badge-green', dot: '#10b981' },
  Active: { cls: 'badge-green', dot: '#10b981' },
  Completed: { cls: 'badge-green', dot: '#10b981' },
  'On Trip': { cls: 'badge-blue', dot: '#3b82f6' },
  'In Transit': { cls: 'badge-blue', dot: '#3b82f6' },
  Dispatched: { cls: 'badge-blue', dot: '#3b82f6' },
  'In Progress': { cls: 'badge-blue', dot: '#3b82f6' },
  Assigned: { cls: 'badge-purple', dot: '#7c3aed' },
  'In Shop': { cls: 'badge-amber', dot: '#d97706' },
  Scheduled: { cls: 'badge-amber', dot: '#d97706' },
  Pending: { cls: 'badge-amber', dot: '#d97706' },
  'Out of Service': { cls: 'badge-red', dot: '#ef4444' },
  Suspended: { cls: 'badge-red', dot: '#ef4444' },
  Cancelled: { cls: 'badge-red', dot: '#ef4444' },
  'Off Duty': { cls: 'badge-gray', dot: '#94a3b8' },
  Draft: { cls: 'badge-gray', dot: '#94a3b8' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { cls: 'badge-gray', dot: '#94a3b8' };
  return (
    <span className={`badge ${config.cls}`} style={{ gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: config.dot,
        flexShrink: 0,
        boxShadow: `0 0 0 2px ${config.dot}30`,
      }} />
      {status}
    </span>
  );
}
