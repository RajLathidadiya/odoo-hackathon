import { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const tripStatuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try { const r = await tripsAPI.getAll(); setTrips(r.data.data || r.data || []); }
    catch { toast.error('Failed to load trips'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    const payload = {
      trip_code: data.trip_code,
      origin: data.origin,
      destination: data.destination,
      cargo_weight_kg: Number(data.cargo_weight_kg),
      revenue: Number(data.revenue),
    };
    try {
      if (editTrip) {
        await tripsAPI.update(editTrip.id, payload);
        toast.success('Trip updated');
      } else {
        await tripsAPI.create(payload);
        toast.success('Trip created');
      }
      closeModal(); fetchTrips();
    } catch (e) { toast.error(e.response?.data?.message || e.response?.data?.details || 'Error'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await tripsAPI.delete(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); fetchTrips(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  const openAdd = () => { setEditTrip(null); reset({ trip_code: '', origin: '', destination: '', cargo_weight_kg: '', revenue: '' }); setModalOpen(true); };
  const openEdit = (t) => { setEditTrip(t); reset({ trip_code: t.trip_code, origin: t.origin, destination: t.destination, cargo_weight_kg: t.cargo_weight_kg, revenue: t.revenue }); setModalOpen(true); setActionMenu(null); };
  const closeModal = () => { setModalOpen(false); setEditTrip(null); reset(); };

  const filtered = trips.filter(t => {
    const q = search.toLowerCase();
    const m = !q || [t.origin, t.destination, t.trip_code].some(f => f?.toLowerCase().includes(q));
    return m && (!statusFilter || t.status === statusFilter);
  });

  if (loading) return <PageLoader />;

  return (
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(12px, 3vw, 18px)', flexWrap: 'wrap', gap: '10px' }}>
        <span className="badge badge-gray" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>{filtered.length} trips</span>
        <button className="btn-primary" onClick={openAdd} style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)', gap: '6px' }}><Plus size={14} /> Create Trip</button>
      </div>

      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34, fontSize: 'clamp(12px, 2vw, 13px)' }} placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ff-select" style={{ minWidth: 'clamp(120px, 30vw, 160px)', fontSize: 'clamp(12px, 2vw, 13px)' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {tripStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || statusFilter) && <button className="btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); }} style={{ fontSize: 'clamp(11px, 2vw, 12px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Clear</button>}
      </div>

      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}>
              <th>Trip Code</th><th>Route</th><th>Cargo (kg)</th><th>Revenue</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 40px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No trips found</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.trip_code}</td>
                  <td>
                    <span>{t.origin || '—'}</span>
                    <span style={{ color: '#cbd5e1', margin: '0 clamp(3px, 1vw, 6px)' }}>→</span>
                    <span>{t.destination || '—'}</span>
                  </td>
                  <td>{t.cargo_weight_kg ? `${Number(t.cargo_weight_kg).toLocaleString()} kg` : '—'}</td>
                  <td style={{ fontWeight: 600 }}>₹{t.revenue ? Number(t.revenue).toLocaleString() : '0'}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button onClick={() => setActionMenu(actionMenu === t.id ? null : t.id)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <MoreHorizontal size={14} />
                      </button>
                      {actionMenu === t.id && (
                        <div className="anim-scale-in" style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 140, zIndex: 10, overflow: 'hidden' }}>
                          <button onClick={() => openEdit(t)} style={{ width: '100%', padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)', fontSize: 'clamp(11px, 2vw, 12px)', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#334155' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Edit2 size={13} /> Edit</button>
                          <button onClick={() => { setDeleteTarget(t); setActionMenu(null); }} style={{ width: '100%', padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)', fontSize: 'clamp(11px, 2vw, 12px)', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Trash2 size={13} /> Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editTrip ? 'Edit Trip' : 'Create Trip'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(10px, 3vw, 14px)' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Trip Code *</label>
              <input className="ff-input" {...register('trip_code', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} placeholder="TR-001" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }} />
              {errors.trip_code && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.trip_code.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Origin *</label>
              <input className="ff-input" {...register('origin', { required: 'Required' })} placeholder="Mumbai" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Destination *</label>
              <input className="ff-input" {...register('destination', { required: 'Required' })} placeholder="Pune" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Cargo Weight (kg) *</label>
              <input className="ff-input" type="number" {...register('cargo_weight_kg', { required: 'Required' })} placeholder="1000" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Revenue (₹) *</label>
              <input className="ff-input" type="number" {...register('revenue', { required: 'Required' })} placeholder="15000" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'clamp(8px, 2vw, 10px)', marginTop: 'clamp(16px, 3vw, 22px)', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={closeModal} style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>{editTrip ? 'Save Changes' : 'Create Trip'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Trip" message={`Delete trip "${deleteTarget?.trip_code}"? Only Draft trips can be deleted.`} loading={deleting} />
    </div>
  );
}
