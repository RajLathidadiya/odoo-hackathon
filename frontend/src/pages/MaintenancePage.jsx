import { useState, useEffect } from 'react';
import { maintenanceAPI, vehiclesAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [mainRes, vehRes] = await Promise.all([maintenanceAPI.getAll(), vehiclesAPI.getAll()]);
      setRecords(mainRes.data?.data || mainRes.data || []);
      setVehicles(vehRes.data?.data || vehRes.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await maintenanceAPI.create({
        ...data,
        vehicle_id: parseInt(data.vehicle_id),
        cost: parseFloat(data.cost),
      });
      toast.success('Maintenance record added. Vehicle status set to In Shop.');
      setShowModal(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    } finally { setSubmitting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Maintenance</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{records.length} maintenance records</p>
        </div>
        <button onClick={() => { reset({ vehicle_id: '', description: '', cost: '', maintenance_date: '', maintenance_type: 'Routine' }); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl shadow-sm">
          <Plus size={18} /> Log Maintenance
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Cost</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {records.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-surface-400">
                  <Wrench size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No maintenance records</p>
                </td></tr>
              ) : records.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{r.vehicle_code || r.vehicle_model || `Vehicle #${r.vehicle_id}`}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">{r.maintenance_type || 'General'}</span>
                  </td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 max-w-xs truncate">{r.description}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 font-mono">₹{(r.cost || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 text-xs">{r.maintenance_date ? new Date(r.maintenance_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Maintenance">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vehicle</label>
            <select {...register('vehicle_id', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code} — {v.model}</option>)}
            </select>
            {errors.vehicle_id && <p className="text-xs text-red-500 mt-1">{errors.vehicle_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Maintenance Type</label>
            <select {...register('maintenance_type')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
              <option value="Routine">Routine</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
            <textarea {...register('description', { required: 'Required' })} rows={3} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cost (₹)</label>
              <input type="number" step="0.01" {...register('cost', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Date</label>
              <input type="date" {...register('maintenance_date', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.maintenance_date && <p className="text-xs text-red-500 mt-1">{errors.maintenance_date.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
              {submitting ? 'Saving...' : 'Log Maintenance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
