const statusMap = {
  Available: 'badge-green',
  Active: 'badge-green',
  Completed: 'badge-green',
  'On Trip': 'badge-blue',
  'In Transit': 'badge-blue',
  Dispatched: 'badge-blue',
  'In Progress': 'badge-blue',
  Assigned: 'badge-purple',
  'In Shop': 'badge-amber',
  Pending: 'badge-amber',
  'Out of Service': 'badge-red',
  Suspended: 'badge-red',
  Cancelled: 'badge-red',
  Draft: 'badge-gray',
};

export default function StatusBadge({ status }) {
  const cls = statusMap[status] || 'badge-gray';
  return (
    <span className={`badge ${cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />
      {status}
    </span>
  );
}
