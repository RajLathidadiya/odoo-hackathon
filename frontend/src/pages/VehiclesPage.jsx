import { useState, useEffect } from 'react';
import { vehiclesAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const vehicleTypes = ['Truck', 'Van', 'Bike'];
const vehicleStatuses = ['Available', 'On Trip', 'In Shop', 'Out of Service'];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try { const r = await vehiclesAPI.getAll(); setVehicles(r.data.data || r.data || []); }
    catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    // Convert numeric strings to numbers
    const payload = {
      vehicle_code: data.vehicle_code,
      license_plate: data.license_plate,
      model: data.model,
      max_capacity_kg: Number(data.max_capacity_kg),
      acquisition_cost: Number(data.acquisition_cost),
      odometer_km: Number(data.odometer_km || 0),
      vehicle_type: data.vehicle_type,
      region: data.region,
    };
    try {
      if (editVehicle) {
        await vehiclesAPI.update(editVehicle.id, payload);
        toast.success('Vehicle updated');
      } else {
        await vehiclesAPI.create(payload);
        toast.success('Vehicle added');
      }
      closeModal(); fetchVehicles();
    } catch (e) { toast.error(e.response?.data?.message || e.response?.data?.details || 'Error'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await vehiclesAPI.delete(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); fetchVehicles(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const openAdd = () => {
    setEditVehicle(null);
    reset({ vehicle_code: '', license_plate: '', model: '', max_capacity_kg: '', acquisition_cost: '', odometer_km: '0', vehicle_type: 'Truck', region: '' });
    setModalOpen(true);
  };
  const openEdit = (v) => {
    setEditVehicle(v);
    reset({
      vehicle_code: v.vehicle_code, license_plate: v.license_plate, model: v.model,
      max_capacity_kg: v.max_capacity_kg, acquisition_cost: v.acquisition_cost,
      odometer_km: v.odometer_km, vehicle_type: v.vehicle_type, region: v.region,
    });
    setModalOpen(true); setActionMenu(null);
  };
  const closeModal = () => { setModalOpen(false); setEditVehicle(null); reset(); };

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchesSearch = !q || [v.vehicle_code, v.license_plate, v.model, v.vehicle_type].some(f => f?.toLowerCase().includes(q));
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(12px, 3vw, 18px)', flexWrap: 'wrap', gap: '10px' }}>
        <span className="badge badge-gray" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>{filtered.length} vehicles</span>
        <button className="btn-primary" onClick={openAdd} style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)', gap: '6px' }}><Plus size={14} /> Add Vehicle</button>
      </div>

      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34, fontSize: 'clamp(12px, 2vw, 13px)' }} placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ff-select" style={{ minWidth: 'clamp(140px, 30vw, 160px)', fontSize: 'clamp(12px, 2vw, 13px)' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {vehicleStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || statusFilter) && <button className="btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); }} style={{ fontSize: 'clamp(12px, 2vw, 13px)', padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)' }}>Clear</button>}
      </div>

      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}>
              <th>Vehicle</th><th>Plate</th><th>Type</th><th>Region</th><th>Capacity</th><th>Odometer</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No vehicles found</td></tr>
              ) : filtered.map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 10px)' }}>
                      <div style={{ width: 'clamp(28px, 6vw, 34px)', height: 'clamp(28px, 6vw, 34px)', borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(10px, 1.5vw, 12px)', fontWeight: 700, color: '#4f46e5', flexShrink: 0 }}>
                        {v.vehicle_code?.substring(0, 2) || 'V'}
                      </div>
                      <div>
                        <p style={{ fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 600, color: '#0f172a', margin: 0 }}>{v.vehicle_code}</p>
                        <p style={{ fontSize: 'clamp(10px, 1.8vw, 11px)', color: '#94a3b8', margin: '2px 0 0' }}>{v.model || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{v.license_plate}</td>
                  <td>{v.vehicle_type}</td>
                  <td>{v.region || '—'}</td>
                  <td>{v.max_capacity_kg ? `${v.max_capacity_kg} kg` : '—'}</td>
                  <td>{v.odometer_km ? `${Number(v.odometer_km).toLocaleString()} km` : '—'}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button onClick={() => setActionMenu(actionMenu === v.id ? null : v.id)}
                        style={{ width: 'clamp(28px, 5vw, 32px)', height: 'clamp(28px, 5vw, 32px)', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <MoreHorizontal size={14} />
                      </button>
                      {actionMenu === v.id && (
                        <div className="anim-scale-in" style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 140, zIndex: 10, overflow: 'hidden' }}>
                          <button onClick={() => openEdit(v)}
                            style={{ width: '100%', padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#334155', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Edit2 size={13} /> Edit
                          </button>
                          <button onClick={() => { setDeleteTarget(v); setActionMenu(null); }}
                            style={{ width: '100%', padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Trash2 size={13} /> Delete
                          </button>
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle Code *</label>
              <input className="ff-input" {...register('vehicle_code', { required: 'Required' })} placeholder="VH-001" />
              {errors.vehicle_code && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{errors.vehicle_code.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>License Plate *</label>
              <input className="ff-input" {...register('license_plate', { required: 'Required' })} placeholder="MH-12-AB-1234" />
              {errors.license_plate && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{errors.license_plate.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle Type *</label>
              <select className="ff-select" style={{ width: '100%' }} {...register('vehicle_type', { required: 'Required' })}>
                {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Model *</label>
              <input className="ff-input" {...register('model', { required: 'Required' })} placeholder="Tata Ace" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Max Capacity (kg) *</label>
              <input className="ff-input" type="number" {...register('max_capacity_kg', { required: 'Required' })} placeholder="5000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Acquisition Cost *</label>
              <input className="ff-input" type="number" {...register('acquisition_cost', { required: 'Required' })} placeholder="500000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Odometer (km) *</label>
              <input className="ff-input" type="number" {...register('odometer_km', { required: 'Required' })} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Region *</label>
              <input className="ff-input" {...register('region', { required: 'Required' })} placeholder="Mumbai" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary">{editVehicle ? 'Save Changes' : 'Add Vehicle'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Vehicle" message={`Delete "${deleteTarget?.vehicle_code}"? This cannot be undone.`} loading={deleting} />
    </div>
  );
}
