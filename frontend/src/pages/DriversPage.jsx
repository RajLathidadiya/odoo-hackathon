import { useState, useEffect } from 'react';
import { driversAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const driverStatuses = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try { const r = await driversAPI.getAll(); setDrivers(r.data.data || r.data || []); }
    catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    const payload = {
      full_name: data.full_name,
      license_number: data.license_number,
      license_category: data.license_category,
      license_expiry: data.license_expiry,
      safety_score: data.safety_score ? Number(data.safety_score) : 0,
    };
    try {
      if (editDriver) {
        await driversAPI.update(editDriver.id, payload);
        toast.success('Driver updated');
      } else {
        await driversAPI.create(payload);
        toast.success('Driver added');
      }
      closeModal(); fetchDrivers();
    } catch (e) { toast.error(e.response?.data?.message || e.response?.data?.details || 'Error'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await driversAPI.delete(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); fetchDrivers(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const openAdd = () => {
    setEditDriver(null);
    reset({ full_name: '', license_number: '', license_category: '', license_expiry: '', safety_score: '0' });
    setModalOpen(true);
  };
  const openEdit = (d) => {
    setEditDriver(d);
    reset({
      full_name: d.full_name, license_number: d.license_number,
      license_category: d.license_category, license_expiry: d.license_expiry?.split('T')[0] || '',
      safety_score: d.safety_score || 0,
    });
    setModalOpen(true); setActionMenu(null);
  };
  const closeModal = () => { setModalOpen(false); setEditDriver(null); reset(); };

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    const match = !q || [d.full_name, d.license_number, d.license_category].some(f => f?.toLowerCase().includes(q));
    const statusMatch = !statusFilter || d.status === statusFilter;
    return match && statusMatch;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(12px, 3vw, 18px)', flexWrap: 'wrap', gap: '10px' }}>
        <span className="badge badge-gray" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>{filtered.length} drivers</span>
        <button className="btn-primary" onClick={openAdd} style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)', gap: '6px' }}><Plus size={14} /> Add Driver</button>
      </div>

      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34, fontSize: 'clamp(12px, 2vw, 13px)' }} placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ff-select" style={{ minWidth: 'clamp(140px, 30vw, 160px)', fontSize: 'clamp(12px, 2vw, 13px)' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {driverStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || statusFilter) && <button className="btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); }} style={{ fontSize: 'clamp(12px, 2vw, 13px)', padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)' }}>Clear</button>}
      </div>

      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}>
              <th>Driver</th><th>License #</th><th>Category</th><th>Expiry</th><th>Safety</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 40px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No drivers found</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 10px)' }}>
                      <div style={{ width: 'clamp(28px, 6vw, 34px)', height: 'clamp(28px, 6vw, 34px)', borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>
                        {d.full_name?.charAt(0) || 'D'}
                      </div>
                      <p style={{ fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 600, color: '#0f172a', margin: 0 }}>{d.full_name}</p>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 'clamp(10px, 1.8vw, 12px)' }}>{d.license_number || '—'}</td>
                  <td>{d.license_category || '—'}</td>
                  <td>{d.license_expiry ? new Date(d.license_expiry).toLocaleDateString() : '—'}</td>
                  <td>{d.safety_score ?? '—'}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button onClick={() => setActionMenu(actionMenu === d.id ? null : d.id)}
                        style={{ width: 'clamp(28px, 5vw, 32px)', height: 'clamp(28px, 5vw, 32px)', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <MoreHorizontal size={14} />
                      </button>
                      {actionMenu === d.id && (
                        <div className="anim-scale-in" style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 10, border: '1px solid #f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 130, zIndex: 10, overflow: 'hidden' }}>
                          <button onClick={() => openEdit(d)} style={{ width: '100%', padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)', fontSize: 'clamp(11px, 2vw, 13px)', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#334155' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Edit2 size={12} /> Edit</button>
                          <button onClick={() => { setDeleteTarget(d); setActionMenu(null); }} style={{ width: '100%', padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)', fontSize: 'clamp(11px, 2vw, 13px)', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Trash2 size={12} /> Delete</button>
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editDriver ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(10px, 3vw, 14px)' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Full Name *</label>
              <input className="ff-input" {...register('full_name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} placeholder="John Doe" />
              {errors.full_name && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.full_name.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>License Number *</label>
              <input className="ff-input" {...register('license_number', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} placeholder="DL-1234567890" />
              {errors.license_number && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.license_number.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>License Category *</label>
              <input className="ff-input" {...register('license_category', { required: 'Required' })} placeholder="LMV / HMV" />
              {errors.license_category && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.license_category.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>License Expiry *</label>
              <input className="ff-input" type="date" {...register('license_expiry', { required: 'Required' })} />
              {errors.license_expiry && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.license_expiry.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Safety Score (0-100)</label>
              <input className="ff-input" type="number" min="0" max="100" {...register('safety_score')} placeholder="85" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'clamp(8px, 2vw, 10px)', marginTop: 'clamp(16px, 3vw, 22px)', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={closeModal} style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>{editDriver ? 'Save Changes' : 'Add Driver'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Driver" message={`Delete "${deleteTarget?.full_name}"? This cannot be undone.`} loading={deleting} />
    </div>
  );
}
