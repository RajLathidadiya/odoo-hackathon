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
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(12px, 3vw, 18px)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap' }}>
          <span className="badge badge-gray" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>{filtered.length} records</span>
          <span className="badge badge-purple" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>Total: ₹{total.toLocaleString()}</span>
        </div>
        <button className="btn-primary" onClick={() => { reset({ vehicle_id: '', expense_type: 'Fuel', amount: '', expense_date: '' }); setModalOpen(true); }} style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)', gap: '6px' }}><Plus size={14} /> Add Expense</button>
      </div>
      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="ff-input" style={{ paddingLeft: 34, fontSize: 'clamp(12px, 2vw, 13px)' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
            <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}><th>Vehicle</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 40px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No expenses</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{vehicles.find(v => v.id === r.vehicle_id)?.vehicle_code || `#${r.vehicle_id}`}</td>
                  <td><span className="badge badge-blue" style={{ fontSize: 'clamp(10px, 1.8vw, 11px)' }}>{r.expense_type}</span></td>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(10px, 3vw, 14px)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Vehicle *</label>
              <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)' }} {...register('vehicle_id', { required: 'Required' })}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_code}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Type *</label>
              <select className="ff-select" style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 13px)' }} {...register('expense_type', { required: true })}>
                {expenseTypes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Amount (₹) *</label>
              <input className="ff-input" type="number" min="0" {...register('amount', { required: 'Required', min: { value: 0, message: 'Must be 0 or positive' } })} placeholder="5000" />
              {errors.amount && <p style={{ color: '#dc2626', fontSize: 'clamp(10px, 1.5vw, 11px)', margin: '4px 0 0' }}>{errors.amount.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Date *</label>
              <input className="ff-input" type="date" {...register('expense_date', { required: 'Required' })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'clamp(8px, 2vw, 10px)', marginTop: 'clamp(16px, 3vw, 22px)', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)' }}>Add Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
