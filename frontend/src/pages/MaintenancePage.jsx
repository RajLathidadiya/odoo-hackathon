import { useState, useEffect } from 'react';
import { maintenanceAPI, vehiclesAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search } from 'lucide-react';
import Modal from '../components/Modal';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [m, v] = await Promise.all([maintenanceAPI.getAll(), vehiclesAPI.getAll()]);
      setRecords(m.data.data || m.data || []);
      setVehicles(v.data.data || v.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    const payload = {
      vehicle_id: Number(data.vehicle_id),
      service_type: data.service_type,
      cost: Number(data.cost),
      service_date: data.service_date,
    };
    try {
      await maintenanceAPI.create(payload);
      toast.success('Maintenance logged');
      setModalOpen(false); reset(); fetchData();
    } catch (e) { toast.error(e.response?.data?.message || e.response?.data?.details || 'Error'); }
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !q || [r.service_type].some(f => f?.toLowerCase().includes(q));
  });

  if (loading) return <PageLoader />;

  return (
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(12px, 3vw, 18px)', flexWrap: 'wrap', gap: '10px' }}>
        <span className="badge badge-gray" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>{filtered.length} records</span>
        <button className="btn-primary" onClick={() => { reset({ vehicle_id: '', service_type: '', cost: '', service_date: '' }); setModalOpen(true); }} style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)', gap: '6px' }}><Plus size={14} /> Log Maintenance</button>
      </div>

      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34, fontSize: 'clamp(12px, 2vw, 13px)' }} placeholder="Search maintenance..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}>
              <th>Vehicle</th><th>Service Type</th><th>Cost</th><th>Date</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 40px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No records</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{vehicles.find(v => v.id === r.vehicle_id)?.vehicle_code || `Vehicle #${r.vehicle_id}`}</td>
                  <td>{r.service_type || '—'}</td>
                  <td style={{ fontWeight: 600 }}>₹{r.cost ? Number(r.cost).toLocaleString() : '—'}</td>
                  <td>{r.service_date ? new Date(r.service_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Maintenance">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(10px, 3vw, 14px)' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle *</label>
              <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)' }} {...register('vehicle_id', { required: 'Required' })}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} — {v.license_plate}</option>)}
              </select>
              {errors.vehicle_id && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.vehicle_id.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Service Type *</label>
              <input className="ff-input" {...register('service_type', { required: 'Required' })} placeholder="Oil Change, Tire Rotation..." />
              {errors.service_type && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.service_type.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Cost (₹) *</label>
              <input className="ff-input" type="number" min="0" {...register('cost', { required: 'Required', min: { value: 0, message: 'Must be 0 or positive' } })} placeholder="5000" />
              {errors.cost && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.cost.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Service Date *</label>
              <input className="ff-input" type="date" {...register('service_date', { required: 'Required' })} />
              {errors.service_date && <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#dc2626', marginTop: 2 }}>{errors.service_date.message}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'clamp(8px, 2vw, 10px)', marginTop: 'clamp(16px, 3vw, 22px)', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Log Maintenance</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
