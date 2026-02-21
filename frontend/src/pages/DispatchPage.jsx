import { useState, useEffect } from 'react';
import { dispatchAPI, tripsAPI, vehiclesAPI, driversAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { Zap, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DispatchPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ trip_id: '', vehicle_id: '', driver_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [t, v, d] = await Promise.all([tripsAPI.getAll(), vehiclesAPI.getAll(), driversAPI.getAll()]);
      setTrips(t.data.data || t.data || []);
      setVehicles(v.data.data || v.data || []);
      setDrivers(d.data.data || d.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const draftTrips = trips.filter(t => t.status === 'Draft');
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');
  const activeDispatches = trips.filter(t => t.status === 'Dispatched');

  const handleAssign = async () => {
    if (!form.trip_id || !form.vehicle_id || !form.driver_id) { toast.error('Select all fields'); return; }
    setSubmitting(true);
    try {
      await dispatchAPI.assign({ trip_id: Number(form.trip_id), vehicle_id: Number(form.vehicle_id), driver_id: Number(form.driver_id) });
      toast.success('Trip dispatched!');
      setForm({ trip_id: '', vehicle_id: '', driver_id: '' }); fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleComplete = async (tripId) => {
    try { await dispatchAPI.complete({ trip_id: tripId }); toast.success('Trip completed'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleCancel = async (tripId) => {
    try { await dispatchAPI.cancel({ trip_id: tripId }); toast.success('Trip cancelled'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(20px, 5vw, 32px)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: 'clamp(20px, 5vw, 28px)' }}>
        <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
          <div style={{ width: 'clamp(36px, 8vw, 44px)', height: 'clamp(36px, 8vw, 44px)', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#fff" />
          </div>
          Dispatch Management
        </h1>
        <p style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#64748b', margin: 'clamp(6px, 2vw, 8px) 0 0' }}>Assign trips to vehicles and drivers</p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 35vw, 180px), 1fr))', gap: 'clamp(10px, 2vw, 14px)', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
        <div className="ff-card" style={{ padding: 'clamp(12px, 3vw, 16px)', background: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)', borderLeft: '4px solid #7c3aed' }}>
          <p style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: '#64748b', margin: 0, fontWeight: 500 }}>Draft Trips</p>
          <p style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 800, color: '#7c3aed', margin: 'clamp(4px, 1vw, 6px) 0 0' }}>{draftTrips.length}</p>
        </div>
        <div className="ff-card" style={{ padding: 'clamp(12px, 3vw, 16px)', background: 'linear-gradient(135deg, #eef2ff 0%, #f5f9ff 100%)', borderLeft: '4px solid #4f46e5' }}>
          <p style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: '#64748b', margin: 0, fontWeight: 500 }}>Available Vehicles</p>
          <p style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 800, color: '#4f46e5', margin: 'clamp(4px, 1vw, 6px) 0 0' }}>{availableVehicles.length}</p>
        </div>
        <div className="ff-card" style={{ padding: 'clamp(12px, 3vw, 16px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%)', borderLeft: '4px solid #16a34a' }}>
          <p style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: '#64748b', margin: 0, fontWeight: 500 }}>Available Drivers</p>
          <p style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 800, color: '#16a34a', margin: 'clamp(4px, 1vw, 6px) 0 0' }}>{availableDrivers.length}</p>
        </div>
      </div>

      {/* Assign Form */}
      <div className="ff-card" style={{ marginBottom: 'clamp(16px, 4vw, 24px)', padding: 'clamp(14px, 3.5vw, 20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 10px)', marginBottom: 'clamp(14px, 3vw, 18px)' }}>
          <div style={{ width: 'clamp(28px, 6vw, 32px)', height: 'clamp(28px, 6vw, 32px)', borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#4f46e5" />
          </div>
          <h3 style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700, color: '#0f172a', margin: 0 }}>Assign New Trip</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 40vw, 180px), 1fr))', gap: 'clamp(10px, 2.5vw, 14px)', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 600, color: '#334155', marginBottom: 6 }}>Trip (Draft)</label>
            <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)', borderRadius: 10 }} value={form.trip_id} onChange={e => setForm({ ...form, trip_id: e.target.value })}>
              <option value="">Select trip</option>
              {draftTrips.map(t => <option key={t.id} value={t.id}>{t.trip_code} — {t.origin} → {t.destination}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 600, color: '#334155', marginBottom: 6 }}>Vehicle (Available)</label>
            <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)', borderRadius: 10 }} value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">Select vehicle</option>
              {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} ({v.max_capacity_kg}kg)</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 600, color: '#334155', marginBottom: 6 }}>Driver (Available)</label>
            <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)', borderRadius: 10 }} value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
              <option value="">Select driver</option>
              {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={handleAssign} disabled={submitting} style={{ whiteSpace: 'nowrap', fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(10px, 2.5vw, 12px) clamp(14px, 3vw, 18px)', borderRadius: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 1vw, 8px)', minHeight: 'clamp(36px, 8vw, 42px)' }}>
            <Zap size={16} />
            {submitting ? 'Assigning...' : 'Dispatch'}
          </button>
        </div>
      </div>

      {/* Active Dispatches */}
      <div className="ff-card" style={{ padding: 'clamp(14px, 3.5vw, 20px)', overflow: 'hidden' }}>
        <div style={{ padding: 'clamp(14px, 3vw, 18px)', marginBottom: 'clamp(12px, 2.5vw, 16px)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 12px)', flexWrap: 'wrap' }}>
          <div style={{ width: 'clamp(28px, 6vw, 32px)', height: 'clamp(28px, 6vw, 32px)', borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={16} color="#0284c7" />
          </div>
          <h3 style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700, color: '#0f172a', margin: 0 }}>Active Dispatches</h3>
          <span className="badge badge-blue" style={{ marginLeft: 'auto', fontSize: 'clamp(10px, 2vw, 11px)' }}>{activeDispatches.length}</span>
        </div>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)', padding: 'clamp(12px, 2.5vw, 16px) 0' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', background: '#f8fafb' }}><th>Trip</th><th>Route</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {activeDispatches.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'clamp(28px, 6vw, 44px)', color: '#cbd5e1', fontSize: 'clamp(12px, 2vw, 13px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vw, 10px)', flexDirection: 'column' }}>
                    <div style={{ width: 'clamp(44px, 10vw, 52px)', height: 'clamp(44px, 10vw, 52px)', borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={24} color="#94a3b8" />
                    </div>
                    <span>No active dispatches yet</span>
                  </div>
                </td></tr>
              ) : activeDispatches.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.trip_code}</td>
                  <td>{t.origin} → {t.destination}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'clamp(6px, 1.5vw, 8px)', justifyContent: 'flex-end', flexWrap: 'wrap', rowGap: '4px' }}>
                      <button className="btn-primary" style={{ fontSize: 'clamp(10px, 2vw, 12px)', padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleComplete(t.id)}>
                        <CheckCircle size={13} />
                        Complete
                      </button>
                      <button className="btn-secondary" style={{ fontSize: 'clamp(10px, 2vw, 12px)', padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px)', borderRadius: 8, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleCancel(t.id)}>
                        <XCircle size={13} />
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
