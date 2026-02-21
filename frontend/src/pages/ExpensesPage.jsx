import { useState, useEffect } from 'react';
import { expensesAPI, vehiclesAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const expenseTypes = ['Maintenance', 'Fuel', 'Insurance', 'Toll', 'Parking', 'Fine', 'Other'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, vehRes] = await Promise.all([expensesAPI.getAll(), vehiclesAPI.getAll()]);
      setExpenses(expRes.data?.data || expRes.data || []);
      setVehicles(vehRes.data?.data || vehRes.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await expensesAPI.create({
        vehicle_id: parseInt(data.vehicle_id),
        description: data.description,
        amount: parseFloat(data.amount),
        expense_date: data.expense_date,
        expense_type: data.expense_type,
      });
      toast.success('Expense recorded');
      setShowModal(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally { setSubmitting(false); }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Expenses</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Total: ₹{totalExpense.toLocaleString()}</p>
        </div>
        <button onClick={() => { reset({ vehicle_id: '', description: '', amount: '', expense_date: '', expense_type: 'Maintenance' }); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl shadow-sm">
          <Plus size={18} /> Add Expense
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {expenses.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-surface-400">
                  <Receipt size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No expenses recorded</p>
                </td></tr>
              ) : expenses.map((e, i) => (
                <tr key={e.id || i} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{e.vehicle_code || `Vehicle #${e.vehicle_id}`}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium">{e.expense_type}</span>
                  </td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 max-w-xs truncate">{e.description}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 font-mono">₹{(e.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-surface-700 dark:text-surface-300 text-xs">{e.expense_date ? new Date(e.expense_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense">
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
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Expense Type</label>
              <select {...register('expense_type')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white">
                {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
            <input {...register('description')} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Amount (₹)</label>
              <input type="number" step="0.01" {...register('amount', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Date</label>
              <input type="date" {...register('expense_date', { required: 'Required' })} className="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              {errors.expense_date && <p className="text-xs text-red-500 mt-1">{errors.expense_date.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
              {submitting ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
