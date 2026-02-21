import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lock, Unlock, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/UserManagement.css';

const API_BASE = 'http://localhost:3000/api';

export default function UserManagementPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: 1
  });

  const [editRoleData, setEditRoleData] = useState({
    user_id: null,
    role_id: 1
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data);
    } catch (err) {
      toast.error('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(data.data);
    } catch (err) {
      toast.error('Failed to fetch roles');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password || !formData.role_id) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('User created successfully!');
      setFormData({ full_name: '', email: '', password: '', role_id: 1 });
      setShowAddUserModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Update user role
  const handleUpdateRole = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/${editRoleData.user_id}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role_id: editRoleData.role_id })
      });

      if (!res.ok) throw new Error('Failed to update role');
      toast.success('Role updated successfully!');
      setShowEditRoleModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete user');
      toast.success('User deleted successfully!');
      setShowConfirmDelete(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getRoleName = (roleId) => {
    return roles.find(r => r.id === roleId)?.name || 'Unknown';
  };

  const isMobile = windowWidth < 640;

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: isMobile ? '0.75rem' : '1.75rem', minHeight: '100vh', background: '#F0F2F8' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '1rem' : '1.75rem',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', margin: 0 }}>
          User Management
        </h1>
        <button
          onClick={() => setShowAddUserModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: isMobile ? '0.5rem 0.75rem' : '0.625rem 1rem',
            fontSize: isMobile ? '0.875rem' : '1rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <Plus size={isMobile ? 18 : 20} />
          {!isMobile && 'Add User'}
        </button>
      </div>

      {/* Users Table/Cards */}
      {isMobile ? (
        // Mobile: Card View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map(user => (
            <div
              key={user.id}
              style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.25rem' }}>Name</p>
                <p style={{ fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>{user.full_name}</p>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.25rem' }}>Email</p>
                <p style={{ fontSize: '0.85rem', margin: 0, wordBreak: 'break-all' }}>{user.email}</p>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.25rem' }}>Role</p>
                <span style={{
                  display: 'inline-block',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {getRoleName(user.role_id)}
                </span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.25rem' }}>Status</p>
                <span style={{
                  display: 'inline-block',
                  background: user.is_active ? '#dcfce7' : '#fee2e2',
                  color: user.is_active ? '#166534' : '#991b1b',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setEditRoleData({ user_id: user.id, role_id: user.role_id });
                    setShowEditRoleModal(true);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(user.id, user.is_active)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: user.is_active ? '#fecaca' : '#bbf7d0',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}
                >
                  {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowConfirmDelete(true);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop: Table View
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{user.full_name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: '#e0e7ff',
                      color: '#4f46e5',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {getRoleName(user.role_id)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: user.is_active ? '#dcfce7' : '#fee2e2',
                      color: user.is_active ? '#166534' : '#991b1b',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setEditRoleData({ user_id: user.id, role_id: user.role_id });
                          setShowEditRoleModal(true);
                        }}
                        style={{
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit Role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        style={{
                          background: user.is_active ? '#fecaca' : '#bbf7d0',
                          border: 'none',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowConfirmDelete(true);
                        }}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Role
            </label>
            <select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowAddUserModal(false)}
              style={{
                padding: '0.625rem 1rem',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.625rem 1rem',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditRoleModal}
        onClose={() => setShowEditRoleModal(false)}
        title={`Edit Role for ${selectedUser?.full_name}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Select New Role
            </label>
            <select
              value={editRoleData.role_id}
              onChange={(e) => setEditRoleData({ ...editRoleData, role_id: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              onClick={() => setShowEditRoleModal(false)}
              style={{
                padding: '0.625rem 1rem',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              style={{
                padding: '0.625rem 1rem',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Update Role
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.full_name}? This action cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowConfirmDelete(false);
            setSelectedUser(null);
          }}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />
      )}
    </div>
  );
}
