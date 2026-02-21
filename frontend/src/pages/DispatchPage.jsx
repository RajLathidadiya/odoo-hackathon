import { useState, useEffect } from 'react';
import { dispatchAPI, tripsAPI, vehiclesAPI, driversAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
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
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      {/* Assign Form */}
      <div className="ff-card" style={{ marginBottom: 'clamp(14px, 3vw, 20px)' }}>
        <h3 style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 700, color: '#0f172a', margin: '0 0 clamp(10px, 2.5vw, 14px)' }}>Assign Trip</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 40vw, 180px), 1fr))', gap: 'clamp(10px, 2.5vw, 14px)', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Trip (Draft)</label>
            <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)' }} value={form.trip_id} onChange={e => setForm({ ...form, trip_id: e.target.value })}>
              <option value="">Select trip</option>
              {draftTrips.map(t => <option key={t.id} value={t.id}>{t.trip_code} — {t.origin} → {t.destination}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle (Available)</label>
            <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)' }} value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">Select vehicle</option>
              {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} ({v.max_capacity_kg}kg)</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Driver (Available)</label>
            <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)' }} value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
              <option value="">Select driver</option>
              {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={handleAssign} disabled={submitting} style={{ whiteSpace: 'nowrap', fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>
            {submitting ? 'Assigning...' : 'Dispatch'}
          </button>
        </div>
      </div>

      {/* Active Dispatches */}
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'clamp(12px, 3vw, 18px)', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 700, color: '#0f172a', margin: 0 }}>Active Dispatches <span className="badge badge-blue" style={{ marginLeft: 8, fontSize: 'clamp(10px, 2vw, 11px)' }}>{activeDispatches.length}</span></h3>
        </div>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}><th>Trip</th><th>Route</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {activeDispatches.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 40px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No active dispatches</td></tr>
              ) : activeDispatches.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.trip_code}</td>
                  <td>{t.origin} → {t.destination}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'clamp(6px, 1.5vw, 8px)', justifyContent: 'flex-end', flexWrap: 'wrap', rowGap: '4px' }}>
                      <button className="btn-primary" style={{ fontSize: 'clamp(10px, 2vw, 12px)', padding: 'clamp(5px, 1.5vw, 8px) clamp(8px, 2vw, 12px)' }} onClick={() => handleComplete(t.id)}>Complete</button>
                      <button className="btn-secondary" style={{ fontSize: 'clamp(10px, 2vw, 12px)', padding: 'clamp(5px, 1.5vw, 8px) clamp(8px, 2vw, 12px)', color: '#dc2626' }} onClick={() => handleCancel(t.id)}>Cancel</button>
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
