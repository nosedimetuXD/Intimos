import React, { useState, useEffect } from 'react'
import { UserCog, Search, Shield, CheckCircle2 } from 'lucide-react'
import { centralApi } from '../../api'
import { Card, Avatar, Empty } from '../ui'

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
  const [msg, setMsg] = useState('')

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await centralApi.updateUser(userId, { role: newRole })
      setMsg('Rol actualizado exitosamente')
      setTimeout(() => setMsg(''), 3000)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.message || 'Error al actualizar rol')
    }
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Gestión de Cuentas y Roles</h1>
          <p className="text-xs text-muted">Asigna permisos de liderazgo y modera cuentas</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
          <UserCog size={20} />
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          {msg}
        </div>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cuenta por nombre o correo..."
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando usuarios...</div>
      ) : filtered.length === 0 ? (
        <Empty icon="👤" title="No se encontraron usuarios" subtitle="Verifica el término de búsqueda." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map(u => (
            <Card key={u.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={u.photo} name={u.full_name} size="md" />
                  <div>
                    <h3 className="font-bold text-text-primary text-xs sm:text-sm">{u.full_name}</h3>
                    <p className="text-xs text-muted mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] text-muted font-medium">Rol:</span>
                  <select
                    value={u.role || 'miembro'}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="text-xs font-bold py-1.5 px-3 rounded-xl"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
