import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Users, Shield, Stethoscope } from 'lucide-react';

const emptyForm = {
  email: '', password: '', first_name: '', last_name: '',
  role: 'PROFESIONAL', specialty: '', license_number: '',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      specialty: user.specialty || '',
      license_number: user.license_number || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('Usuario actualizado');
      } else {
        await api.post('/users', payload);
        toast.success('Usuario creado');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Desactivar este usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Usuario desactivado');
      fetchUsers();
    } catch {
      toast.error('Error al desactivar usuario');
    }
  };

  const inputClass = 'w-full px-3.5 py-2.5 text-sm outline-none transition-all';
  const inputStyle = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--color-text)',
    transitionDuration: 'var(--duration-fast)',
  };
  const focusHandlers = {
    onFocus: (e) => {
      e.target.style.borderColor = 'var(--color-border-focus)';
      e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.1)';
    },
    onBlur: (e) => {
      e.target.style.borderColor = 'var(--color-border)';
      e.target.style.boxShadow = 'none';
    },
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: 'var(--color-primary-50)' }}
          >
            <Users className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Gestion de Usuarios
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm transition-all"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-button)',
            transitionDuration: 'var(--duration-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
        >
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="h-10 w-10 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
          />
        </div>
      ) : (
        <div
          className="overflow-x-auto animate-fade-in-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-hover)' }}>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Especialidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`animate-fade-in-up stagger-${Math.min(idx + 1, 6)} transition-colors`}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: u.role === 'ADMIN' ? '#7C3AED' : 'var(--color-primary)' }}
                      >
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {u.first_name} {u.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: u.role === 'ADMIN' ? '#F5F3FF' : 'var(--color-primary-50)',
                        color: u.role === 'ADMIN' ? '#6D28D9' : 'var(--color-primary-dark)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {u.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <Stethoscope className="h-3 w-3" />}
                      {u.role === 'ADMIN' ? 'Admin' : 'Profesional'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>{u.specialty || '-'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-primary)', transitionDuration: 'var(--duration-fast)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-error)', transitionDuration: 'var(--duration-fast)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF1F2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(15,23,42,0.4)',
          }}
        >
          <div
            className="w-full max-w-lg animate-fade-in-up"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-modal)',
              boxShadow: 'var(--shadow-xl)',
              padding: '1.5rem',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)', transitionDuration: 'var(--duration-fast)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nombre</label>
                  <input
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    required
                    className={inputClass}
                    style={inputStyle}
                    {...focusHandlers}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Apellido</label>
                  <input
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    required
                    className={inputClass}
                    style={inputStyle}
                    {...focusHandlers}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className={inputClass}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Contrasena {editingUser && '(dejar vacio para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                  className={inputClass}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  {...focusHandlers}
                >
                  <option value="PROFESIONAL">Profesional</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {form.role === 'PROFESIONAL' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Especialidad</label>
                    <input
                      value={form.specialty}
                      onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      {...focusHandlers}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Registro Medico</label>
                    <input
                      value={form.license_number}
                      onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      {...focusHandlers}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-white font-medium text-sm disabled:opacity-50 transition-all"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: 'var(--radius-button)',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-sm font-medium transition-all"
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-button)',
                    color: 'var(--color-text-secondary)',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
