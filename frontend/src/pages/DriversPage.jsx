import { useState, useEffect } from 'react';
import { driversAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const driverStatuses = ['Available', 'On Trip', 'Suspended'];

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try {
      const res = await driversAPI.getAll();
      setDrivers(res.data?.data || res.data || []);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  const isLicenseExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays < 30 && diffDays > 0;
  };

  const isLicenseExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await driversAPI.update(editing.id, data);
        toast.success('Driver updated');
      } else {
        await driversAPI.create(data);
        toast.success('Driver added');
      }
      closeModal();
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await driversAPI.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await driversAPI.delete(deleteTarget.id);
      toast.success('Driver deleted');
      setDeleteTarget(null);
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setSubmitting(false); }
  };

  const openEdit = (driver) => {
    setEditing(driver);
    reset({ ...driver, license_expiry: driver.license_expiry?.split('T')[0] });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    reset({ first_name: '', last_name: '', license_number: '', phone: '', email: '', license_expiry: '', region: '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); reset(); };

  const filtered = drivers.filter((d) => {
    const name = `${d.first_name || ''} ${d.last_name || ''}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || d.license_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Drivers</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{drivers.length} registered drivers</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl shadow-sm">
          <Plus size={18} /> Add Driver
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Search by name or license..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
            <option value="">All Statuses</option>
            {driverStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Driver</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">License</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">License Expiry</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-surface-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No drivers found</p>
                </td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(d.first_name?.[0] || '')}{(d.last_name?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{d.first_name} {d.last_name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{d.region || 'No region'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 font-mono text-xs">{d.license_number}</td>
                  <td className="px-6 py-4">
                    <p className="text-surface-700 dark:text-surface-300">{d.phone}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{d.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select value={d.status} onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        className="appearance-none bg-transparent text-xs font-medium cursor-pointer focus:outline-none sr-only">
                        {driverStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <StatusBadge status={d.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-surface-700 dark:text-surface-300 text-xs">
                        {d.license_expiry ? new Date(d.license_expiry).toLocaleDateString() : 'N/A'}
                      </span>
                      {isLicenseExpired(d.license_expiry) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                          <AlertTriangle size={12} /> Expired
                        </span>
                      )}
                      {isLicenseExpiringSoon(d.license_expiry) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                          <AlertTriangle size={12} /> Expiring
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-primary-600"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteTarget(d)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">First Name</label>
              <input {...register('first_name', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Last Name</label>
              <input {...register('last_name', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">License Number</label>
              <input {...register('license_number', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.license_number && <p className="text-xs text-red-500 mt-1">{errors.license_number.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">License Expiry</label>
              <input type="date" {...register('license_expiry')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
              <input {...register('phone')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Region</label>
            <input {...register('region')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Add Driver'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Driver"
        message={`Are you sure you want to delete ${deleteTarget?.first_name || ''} ${deleteTarget?.last_name || ''}?`}
        loading={submitting}
      />
    </div>
  );
}
