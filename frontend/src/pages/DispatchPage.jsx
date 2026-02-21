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
    <div className="anim-fade-up" style={{ maxWidth: 1200 }}>
      {/* Assign Form */}
      <div className="ff-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Assign Trip</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Trip (Draft)</label>
            <select className="ff-select" style={{ width: '100%' }} value={form.trip_id} onChange={e => setForm({ ...form, trip_id: e.target.value })}>
              <option value="">Select trip</option>
              {draftTrips.map(t => <option key={t.id} value={t.id}>{t.trip_code} — {t.origin} → {t.destination}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle (Available)</label>
            <select className="ff-select" style={{ width: '100%' }} value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">Select vehicle</option>
              {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} ({v.max_capacity_kg}kg)</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Driver (Available)</label>
            <select className="ff-select" style={{ width: '100%' }} value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
              <option value="">Select driver</option>
              {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={handleAssign} disabled={submitting} style={{ whiteSpace: 'nowrap' }}>
            {submitting ? 'Assigning...' : 'Dispatch'}
          </button>
        </div>
      </div>

      {/* Active Dispatches */}
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Active Dispatches <span className="badge badge-blue" style={{ marginLeft: 8 }}>{activeDispatches.length}</span></h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-table">
            <thead><tr><th>Trip</th><th>Route</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {activeDispatches.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No active dispatches</td></tr>
              ) : activeDispatches.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.trip_code}</td>
                  <td>{t.origin} → {t.destination}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => handleComplete(t.id)}>Complete</button>
                      <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', color: '#dc2626' }} onClick={() => handleCancel(t.id)}>Cancel</button>
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
