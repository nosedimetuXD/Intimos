import React, { useState, useEffect } from 'react'
import { Users, Search, Phone, Mail, Calendar, Shield, ExternalLink } from 'lucide-react'
import { centralApi } from '../../api'
import { Card, Avatar, Empty } from '../ui'

export default function Directory() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    centralApi.getUsers()
      .then(res => setUsers(res || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = 
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Directorio de Miembros</h1>
          <p className="text-xs text-muted">Base de datos de contactos y jóvenes del grupo</p>
        </div>
        <span className="text-xs font-bold text-accent-light bg-accent/15 px-3 py-1 rounded-full border border-accent/25">
          {users.length} miembros
        </span>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[['all', 'Todos'], ['miembro', 'Miembros'], ['apoyo', 'Apoyo'], ['pastoral', 'Pastoral']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRoleFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
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

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando directorio...</div>
      ) : filtered.length === 0 ? (
        <Empty icon={Users} title="Sin resultados" subtitle="No se encontraron miembros con ese criterio de búsqueda." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(u => (
            <Card key={u.id} className="space-y-2.5">
              <div className="flex items-start gap-3">
                <Avatar src={u.photo} name={u.full_name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-text-primary text-xs sm:text-sm truncate">{u.full_name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent-light capitalize flex-shrink-0">
                      {u.role}
                    </span>
                  </div>

                  <p className="text-xs text-muted flex items-center gap-1.5 mt-1 truncate">
                    <Mail size={12} />
                    <span>{u.email}</span>
                  </p>

                  {u.phone ? (
                    <a 
                      href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone size={12} />
                      <span>{u.phone}</span>
                    </a>
                  ) : (
                    <p className="text-[11px] text-muted/60 mt-0.5">Sin teléfono registrado</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
