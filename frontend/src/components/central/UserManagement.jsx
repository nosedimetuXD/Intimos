import React, { useState, useEffect } from 'react'
import { UserCog, Search, Shield, CheckCircle2, User, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Phone, Mail, Lock } from 'lucide-react'
import { centralApi } from '../../api'
import { Card, Avatar, Empty, Btn, Modal } from '../ui'

const ROLES = [
  { value: 'miembro', label: 'Miembro' },
  { value: 'apoyo', label: 'Apoyo Nivel 1' },
  { value: 'apoyo2', label: 'Apoyo Nivel 2' },
  { value: 'pastoral', label: 'Equipo Pastoral' },
  { value: 'superadmin', label: 'Super Admin' },
]

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [msg, setMsg] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'miembro',
    active: true,
  })

  const loadUsers = async () => {
    try {
      const data = await centralApi.getUsers()
      setUsers(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'miembro',
      active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (u) => {
    setEditingId(u.id)
    setForm({
      full_name: u.full_name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      role: u.role || 'miembro',
      active: u.active !== false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await centralApi.updateUser(editingId, {
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
          active: form.active,
        })
        setMsg('Usuario actualizado con éxito')
      } else {
        await centralApi.createUser({
          full_name: form.full_name,
          email: form.email,
          password: form.password || '123456',
          phone: form.phone,
          role: form.role,
        })
        setMsg('Usuario creado con éxito')
      }
      setShowModal(false)
      setTimeout(() => setMsg(''), 3000)
      loadUsers()
    } catch (err) {
      alert(err.message || 'Error al procesar usuario')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (u) => {
    if (!confirm(`¿Estás seguro de eliminar a ${u.full_name}? Esta acción borrará permanentemente la cuenta.`)) return
    try {
      await centralApi.deleteUser(u.id)
      setUsers(prev => prev.filter(x => x.id !== u.id))
      setMsg('Usuario eliminado')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert(err.message || 'Error al eliminar usuario')
    }
  }

  const handleToggleActive = async (u) => {
    try {
      const nextActive = !u.active
      await centralApi.updateUser(u.id, { active: nextActive, role: u.role })
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, active: nextActive } : x))
    } catch (err) {
      alert(err.message || 'Error al cambiar estado')
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = 
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Gestión de Cuentas y Roles</h1>
          <p className="text-xs text-muted">Asigna permisos de liderazgo y modera cuentas</p>
        </div>
        <Btn onClick={handleOpenAdd} size="sm">
          <Plus size={15} />
          <span>Nuevo Usuario</span>
        </Btn>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cuenta por nombre o correo..."
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[['all', 'Todos'], ['miembro', 'Miembros'], ['apoyo', 'Apoyo'], ['pastoral', 'Pastoral'], ['superadmin', 'Super Admin']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRoleFilter(val)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                roleFilter === val
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-muted border border-border hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando usuarios...</div>
      ) : filtered.length === 0 ? (
        <Empty icon={User} title="No se encontraron usuarios" subtitle="Verifica el término de búsqueda." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map(u => (
            <Card key={u.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={u.photo} name={u.full_name} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-text-primary text-xs sm:text-sm">{u.full_name}</h3>
                      <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase border ${
                        u.active !== false
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-card2 text-muted border-border'
                      }`}>
                        {u.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{u.email}</p>
                    {u.phone && <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5"><Phone size={10} /> {u.phone}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <span className="text-[10px] text-muted uppercase font-bold">Rol:</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-card2 border border-border text-text-primary capitalize">
                    {u.role || 'miembro'}
                  </span>

                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleActive(u)}
                    className="p-1.5 rounded-lg text-muted hover:text-text-primary transition-colors"
                    title={u.active !== false ? 'Desactivar cuenta' : 'Activar cuenta'}
                  >
                    {u.active !== false ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} className="text-muted" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 rounded-lg text-muted hover:text-text-primary transition-colors"
                    title="Editar cuenta"
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(u)}
                    className="p-1.5 rounded-lg text-muted hover:text-rose-400 transition-colors"
                    title="Eliminar cuenta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nuevo / Editar Usuario */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Nombre Completo</label>
            <input
              required
              placeholder="Ej. Andrés Morales"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Correo electrónico</label>
              <input
                type="email"
                required
                disabled={!!editingId}
                placeholder="andres@ejemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Teléfono WhatsApp</label>
              <input
                placeholder="Ej. 3001234567"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          {!editingId && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Contraseña inicial</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Rol asignado</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <Btn type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Usuario'}
            </Btn>
            <Btn type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
