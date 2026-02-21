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
    <div className="anim-fade-up" style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span className="badge badge-gray">{filtered.length} records</span>
        <button className="btn-primary" onClick={() => { reset({ vehicle_id: '', service_type: '', cost: '', service_date: '' }); setModalOpen(true); }}><Plus size={15} /> Log Maintenance</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34 }} placeholder="Search maintenance..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-table">
            <thead><tr>
              <th>Vehicle</th><th>Service Type</th><th>Cost</th><th>Date</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No records</td></tr>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle *</label>
              <select className="ff-select" style={{ width: '100%' }} {...register('vehicle_id', { required: 'Required' })}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} — {v.license_plate}</option>)}
              </select>
              {errors.vehicle_id && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{errors.vehicle_id.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Service Type *</label>
              <input className="ff-input" {...register('service_type', { required: 'Required' })} placeholder="Oil Change, Tire Rotation..." />
              {errors.service_type && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{errors.service_type.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Cost (₹) *</label>
              <input className="ff-input" type="number" {...register('cost', { required: 'Required' })} placeholder="5000" />
              {errors.cost && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{errors.cost.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Service Date *</label>
              <input className="ff-input" type="date" {...register('service_date', { required: 'Required' })} />
              {errors.service_date && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{errors.service_date.message}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Log Maintenance</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
