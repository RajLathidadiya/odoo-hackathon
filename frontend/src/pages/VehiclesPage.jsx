import { useState, useEffect } from 'react';
import { vehiclesAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Filter, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const vehicleStatuses = ['Available', 'On Trip', 'In Shop', 'Out of Service'];
const vehicleTypes = ['Van', 'Truck', 'Bus', 'Sedan', 'SUV'];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehiclesAPI.getAll();
      setVehicles(res.data?.data || res.data || []);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await vehiclesAPI.update(editing.id, data);
        toast.success('Vehicle updated');
      } else {
        await vehiclesAPI.create(data);
        toast.success('Vehicle added');
      }
      closeModal();
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await vehiclesAPI.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await vehiclesAPI.delete(deleteTarget.id);
      toast.success('Vehicle deleted');
      setDeleteTarget(null);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setSubmitting(false); }
  };

  const openEdit = (vehicle) => {
    setEditing(vehicle);
    reset(vehicle);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    reset({ vehicle_code: '', license_plate: '', model: '', max_capacity_kg: '', acquisition_cost: '', odometer_km: 0, vehicle_type: 'Van', region: '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); reset(); };

  const filtered = vehicles.filter((v) => {
    const matchSearch = !search || v.model?.toLowerCase().includes(search.toLowerCase()) || v.license_plate?.toLowerCase().includes(search.toLowerCase()) || v.vehicle_code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || v.status === statusFilter;
    const matchType = !typeFilter || v.vehicle_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Vehicles</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{vehicles.length} vehicles in fleet</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl shadow-sm">
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text" placeholder="Search by code, plate, or model..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
            <option value="">All Statuses</option>
            {vehicleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
            <option value="">All Types</option>
            {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Plate</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Odometer</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-surface-400">
                  <Truck size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No vehicles found</p>
                </td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{v.model}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">{v.vehicle_code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300">{v.license_plate}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300">{v.vehicle_type}</td>
                  <td className="px-6 py-4">
                    <select
                      value={v.status} onChange={(e) => handleStatusChange(v.id, e.target.value)}
                      className="appearance-none bg-transparent text-xs font-medium cursor-pointer focus:outline-none"
                    >
                      {vehicleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300">{(v.odometer_km || 0).toLocaleString()} km</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-primary-600"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteTarget(v)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vehicle Code</label>
              <input {...register('vehicle_code', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.vehicle_code && <p className="text-xs text-red-500 mt-1">{errors.vehicle_code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">License Plate</label>
              <input {...register('license_plate', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.license_plate && <p className="text-xs text-red-500 mt-1">{errors.license_plate.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Model</label>
            <input {...register('model', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Type</label>
              <select {...register('vehicle_type')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
                {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Region</label>
              <input {...register('region')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Capacity (kg)</label>
              <input type="number" {...register('max_capacity_kg')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cost</label>
              <input type="number" {...register('acquisition_cost')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Odometer</label>
              <input type="number" {...register('odometer_km')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${deleteTarget?.model || 'this vehicle'}? This action cannot be undone.`}
        loading={submitting}
      />
    </div>
  );
}
