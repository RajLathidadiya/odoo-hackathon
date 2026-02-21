import { useState, useEffect } from 'react';
import { dispatchAPI, tripsAPI, vehiclesAPI, driversAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DispatchPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        tripsAPI.getAll(), vehiclesAPI.getAll(), driversAPI.getAll()
      ]);
      const allTrips = tripsRes.data?.data || tripsRes.data || [];
      const allVehicles = vehiclesRes.data?.data || vehiclesRes.data || [];
      const allDrivers = driversRes.data?.data || driversRes.data || [];

      setTrips(allTrips.filter(t => t.status === 'Pending' || t.status === 'Draft'));
      setVehicles(allVehicles.filter(v => v.status === 'Available'));
      setDrivers(allDrivers.filter(d => d.status === 'Available' || d.status === 'Active'));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTrip || !selectedVehicle || !selectedDriver) {
      toast.error('Please select trip, vehicle, and driver');
      return;
    }
    setSubmitting(true);
    try {
      await dispatchAPI.assign({
        trip_id: parseInt(selectedTrip),
        vehicle_id: parseInt(selectedVehicle),
        driver_id: parseInt(selectedDriver),
      });
      toast.success('Trip dispatched successfully!');
      setSelectedTrip(''); setSelectedVehicle(''); setSelectedDriver('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dispatch failed');
    } finally { setSubmitting(false); }
  };

  const canSubmit = selectedTrip && selectedVehicle && selectedDriver && !submitting;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dispatch</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Assign vehicles and drivers to trips</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Availability Cards */}
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{trips.length}</div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Pending Trips</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{vehicles.length}</div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Available Vehicles</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{drivers.length}</div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Available Drivers</p>
        </div>
      </div>

      {/* Dispatch Form */}
      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
          <Send size={20} className="text-primary-600" />
          Dispatch Assignment
        </h2>

        {(trips.length === 0 || vehicles.length === 0 || drivers.length === 0) && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              {trips.length === 0 && <p>No pending trips available for dispatch.</p>}
              {vehicles.length === 0 && <p>No vehicles currently available.</p>}
              {drivers.length === 0 && <p>No drivers currently available.</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleAssign} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Select Trip</label>
            <select value={selectedTrip} onChange={(e) => setSelectedTrip(e.target.value)} disabled={trips.length === 0}
              className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50">
              <option value="">Choose a trip...</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  #{t.id} — {t.origin} → {t.destination} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Select Vehicle</label>
            <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} disabled={vehicles.length === 0}
              className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50">
              <option value="">Choose a vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_code} — {v.model} ({v.license_plate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Select Driver</label>
            <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} disabled={drivers.length === 0}
              className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50">
              <option value="">Choose a driver...</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.first_name} {d.last_name} — {d.license_number}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={!canSubmit}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Dispatching...</>
            ) : (
              <><CheckCircle2 size={18} /> Dispatch Trip</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
