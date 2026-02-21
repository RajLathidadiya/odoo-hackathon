import { useState, useEffect } from 'react';
import { fuelAPI, vehiclesAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search } from 'lucide-react';
import Modal from '../components/Modal';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FuelPage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [f, v] = await Promise.all([fuelAPI.getAll(), vehiclesAPI.getAll()]);
      setRecords(f.data.data || f.data || []);
      setVehicles(v.data.data || v.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    const payload = { vehicle_id: Number(data.vehicle_id), liters: Number(data.liters), cost: Number(data.cost), odometer_reading: Number(data.odometer_reading), fuel_date: data.fuel_date };
    try {
      await fuelAPI.create(payload);
      toast.success('Fuel log added');
      setModalOpen(false); reset(); fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const veh = vehicles.find(v => v.id === r.vehicle_id);
    return veh?.vehicle_code?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <PageLoader />;

  return (
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(12px, 3vw, 18px)', flexWrap: 'wrap', gap: '10px' }}>
        <span className="badge badge-gray" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>{filtered.length} records</span>
        <button className="btn-primary" onClick={() => { reset({ vehicle_id: '', liters: '', cost: '', odometer_reading: '', fuel_date: '' }); setModalOpen(true); }} style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)', gap: '6px' }}><Plus size={14} /> Log Fuel</button>
      </div>
      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34, fontSize: 'clamp(12px, 2vw, 13px)' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}><th>Vehicle</th><th>Liters</th><th>Cost</th><th>Cost/L</th><th>Odometer</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 40px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No records</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{vehicles.find(v => v.id === r.vehicle_id)?.vehicle_code || `#${r.vehicle_id}`}</td>
                  <td>{r.liters || '—'} L</td>
                  <td style={{ fontWeight: 600 }}>₹{r.cost ? Number(r.cost).toLocaleString() : '—'}</td>
                  <td>{r.liters && r.cost ? `₹${(Number(r.cost) / Number(r.liters)).toFixed(2)}` : '—'}</td>
                  <td>{r.odometer_reading ? `${Number(r.odometer_reading).toLocaleString()} km` : '—'}</td>
                  <td>{r.fuel_date ? new Date(r.fuel_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Fuel">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(10px, 3vw, 14px)' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle *</label>
              <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)' }} {...register('vehicle_id', { required: 'Required' })}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} — {v.license_plate}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Liters *</label>
              <input className="ff-input" type="number" step="0.1" {...register('liters', { required: 'Required' })} placeholder="50" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Total Cost (₹) *</label>
              <input className="ff-input" type="number" {...register('cost', { required: 'Required' })} placeholder="4775" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Odometer (km) *</label>
              <input className="ff-input" type="number" {...register('odometer_reading', { required: 'Required' })} placeholder="45000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Date *</label>
              <input className="ff-input" type="date" {...register('fuel_date', { required: 'Required' })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'clamp(8px, 2vw, 10px)', marginTop: 'clamp(16px, 3vw, 22px)', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Log Fuel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
