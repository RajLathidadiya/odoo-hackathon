import { useState, useEffect } from 'react';
import { expensesAPI, vehiclesAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search } from 'lucide-react';
import Modal from '../components/Modal';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const expenseTypes = ['Fuel', 'Maintenance', 'Toll', 'Insurance', 'Salary', 'Other'];

export default function ExpensesPage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [e, v] = await Promise.all([expensesAPI.getAll(), vehiclesAPI.getAll()]);
      setRecords(e.data.data || e.data || []);
      setVehicles(v.data.data || v.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    const payload = {
      vehicle_id: Number(data.vehicle_id),
      amount: Number(data.amount),
      expense_date: data.expense_date,
      expense_type: data.expense_type,
    };
    try {
      await expensesAPI.create(payload);
      toast.success('Expense added');
      setModalOpen(false); reset(); fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.expense_type].some(f => f?.toLowerCase().includes(q));
  });

  if (loading) return <PageLoader />;

  const total = filtered.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div className="anim-fade-up" style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-gray">{filtered.length} records</span>
          <span className="badge badge-purple">Total: ₹{total.toLocaleString()}</span>
        </div>
        <button className="btn-primary" onClick={() => { reset({ vehicle_id: '', expense_type: 'Fuel', amount: '', expense_date: '' }); setModalOpen(true); }}><Plus size={15} /> Add Expense</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-table">
            <thead><tr><th>Vehicle</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No expenses</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{vehicles.find(v => v.id === r.vehicle_id)?.vehicle_code || `#${r.vehicle_id}`}</td>
                  <td><span className="badge badge-blue">{r.expense_type}</span></td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{Number(r.amount || 0).toLocaleString()}</td>
                  <td>{r.expense_date ? new Date(r.expense_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle *</label>
              <select className="ff-select" style={{ width: '100%' }} {...register('vehicle_id', { required: 'Required' })}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Type *</label>
              <select className="ff-select" style={{ width: '100%' }} {...register('expense_type', { required: true })}>
                {expenseTypes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Amount (₹) *</label>
              <input className="ff-input" type="number" {...register('amount', { required: 'Required' })} placeholder="5000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Date *</label>
              <input className="ff-input" type="date" {...register('expense_date', { required: 'Required' })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
