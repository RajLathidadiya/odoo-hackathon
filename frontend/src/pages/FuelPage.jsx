import { useState, useEffect } from 'react';
import { fuelAPI, vehiclesAPI, tripsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Fuel } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FuelPage() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [fuelRes, vehRes, tripRes] = await Promise.all([fuelAPI.getAll(), vehiclesAPI.getAll(), tripsAPI.getAll()]);
      setLogs(fuelRes.data?.data || fuelRes.data || []);
      setVehicles(vehRes.data?.data || vehRes.data || []);
      setTrips(tripRes.data?.data || tripRes.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await fuelAPI.create({
        vehicle_id: parseInt(data.vehicle_id),
        trip_id: data.trip_id ? parseInt(data.trip_id) : null,
        liters: parseFloat(data.liters),
        cost: parseFloat(data.cost),
        odometer_reading: parseFloat(data.odometer_reading),
        fuel_date: data.fuel_date,
      });
      toast.success('Fuel log added');
      setShowModal(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add fuel log');
    } finally { setSubmitting(false); }
  };

  const totalLiters = logs.reduce((sum, l) => sum + (l.liters || 0), 0);
  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const avgEfficiency = logs.length > 0 ? (logs.reduce((sum, l) => sum + (l.odometer_reading || 0), 0) / totalLiters).toFixed(1) : 0;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Fuel Logs</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{logs.length} fuel entries</p>
        </div>
        <button onClick={() => { reset({ vehicle_id: '', trip_id: '', liters: '', cost: '', odometer_reading: '', fuel_date: '' }); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl shadow-sm">
          <Plus size={18} /> Add Fuel Log
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-surface-500 dark:text-surface-400">Total Liters</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{totalLiters.toLocaleString()} L</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-surface-500 dark:text-surface-400">Total Fuel Cost</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">₹{totalCost.toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-surface-500 dark:text-surface-400">Avg Efficiency</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{avgEfficiency} km/L</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Trip</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Liters</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Cost</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Odometer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {logs.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-surface-400">
                  <Fuel size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No fuel logs</p>
                </td></tr>
              ) : logs.map((l, i) => (
                <tr key={l.id || i} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{l.vehicle_code || `Vehicle #${l.vehicle_id}`}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300">{l.trip_id ? `Trip #${l.trip_id}` : '-'}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300">{l.liters} L</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 font-mono">₹{(l.cost || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300">{(l.odometer_reading || 0).toLocaleString()} km</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 text-xs">{l.fuel_date ? new Date(l.fuel_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Fuel Log">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vehicle</label>
              <select {...register('vehicle_id', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} — {v.model}</option>)}
              </select>
              {errors.vehicle_id && <p className="text-xs text-red-500 mt-1">{errors.vehicle_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Trip (Optional)</label>
              <select {...register('trip_id')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
                <option value="">No trip</option>
                {trips.map(t => <option key={t.id} value={t.id}>#{t.id} — {t.origin} → {t.destination}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Liters</label>
              <input type="number" step="0.1" {...register('liters', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.liters && <p className="text-xs text-red-500 mt-1">{errors.liters.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cost (₹)</label>
              <input type="number" step="0.01" {...register('cost', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Odometer</label>
              <input type="number" {...register('odometer_reading', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.odometer_reading && <p className="text-xs text-red-500 mt-1">{errors.odometer_reading.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Date</label>
            <input type="date" {...register('fuel_date', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            {errors.fuel_date && <p className="text-xs text-red-500 mt-1">{errors.fuel_date.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
              {submitting ? 'Saving...' : 'Add Fuel Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
