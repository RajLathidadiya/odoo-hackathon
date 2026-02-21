import { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const tripStatuses = ['Pending', 'Draft', 'Dispatched', 'In Progress', 'Completed', 'Cancelled'];

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const res = await tripsAPI.getAll();
      setTrips(res.data?.data || res.data || []);
    } catch { toast.error('Failed to load trips'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await tripsAPI.update(editing.id, data);
        toast.success('Trip updated');
      } else {
        await tripsAPI.create(data);
        toast.success('Trip created');
      }
      closeModal();
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await tripsAPI.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await tripsAPI.delete(deleteTarget.id);
      toast.success('Trip deleted');
      setDeleteTarget(null);
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setSubmitting(false); }
  };

  const openEdit = (trip) => {
    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      toast.error('Cannot edit completed or cancelled trips');
      return;
    }
    setEditing(trip);
    reset({ ...trip, trip_date: trip.trip_date?.split('T')[0] });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    reset({ origin: '', destination: '', trip_date: '', status: 'Pending', cargo_kg: '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); reset(); };

  const filtered = trips.filter((t) => {
    const matchSearch = !search || t.origin?.toLowerCase().includes(search.toLowerCase()) || t.destination?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Trips</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{trips.length} total trips</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl shadow-sm">
          <Plus size={18} /> Create Trip
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Search by origin or destination..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
            <option value="">All Statuses</option>
            {tripStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Route</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Cargo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Driver</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-surface-400">
                  <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No trips found</p>
                </td></tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{t.origin}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">→ {t.destination}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 text-xs">
                    {t.trip_date ? new Date(t.trip_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300">{t.cargo_kg ? `${t.cargo_kg} kg` : '-'}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 text-xs">{t.vehicle_code || t.vehicle_model || '-'}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 text-xs">{t.driver_name || (t.driver_first_name ? `${t.driver_first_name} ${t.driver_last_name || ''}` : '-')}</td>
                  <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        disabled={t.status === 'Completed' || t.status === 'Cancelled'}
                        className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Trip' : 'Create Trip'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Origin</label>
              <input {...register('origin', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Destination</label>
              <input {...register('destination', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Trip Date</label>
              <input type="date" {...register('trip_date')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cargo (kg)</label>
              <input type="number" {...register('cargo_kg')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create Trip'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Trip" message={`Delete trip from ${deleteTarget?.origin || ''} to ${deleteTarget?.destination || ''}?`} loading={submitting} />
    </div>
  );
}
