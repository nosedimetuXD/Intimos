import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, Users, Search, Loader2 } from 'lucide-react'
import { Card, Avatar, Btn, Modal } from '../ui'
import { groupsApi, centralApi } from '../../api'

const PRESET_COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#f97316', '#06b6d4']

function GroupCard({ group, users, onEdit, onDelete, onAddMember, onRemoveMember }) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  // Members from group object or matched against users
  const memberIds = (group.members || []).map(m => m.id)
  const availableUsers = users.filter(u => u.active !== false && !memberIds.includes(u.id) && (
    !search || (u.full_name || u.name || '').toLowerCase().includes(search.toLowerCase())
  ))

  const groupColor = group.color || (group.description && group.description.startsWith('#') ? group.description : PRESET_COLORS[0])

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: groupColor }} />
          <h3 className="font-bold text-sm text-text-primary">{group.name}</h3>
          <span className="text-[11px] text-muted bg-card2 px-2 py-0.5 rounded-full border border-border">
            {(group.members || []).length} miembro{(group.members || []).length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(group)}
            title="Editar grupo"
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(group.id)}
            title="Eliminar grupo"
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-rose-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {group.leader_name && (
        <p className="text-xs text-muted">
          Líder: <span className="font-medium text-text-secondary">{group.leader_name}</span>
        </p>
      )}

      {/* Miembros actuales */}
      {(group.members || []).length > 0 && (
        <div className="space-y-1.5 pt-1">
          {group.members.map(u => (
            <div key={u.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-card2/80 border border-border/40">
              <Avatar src={u.avatar_url} name={u.full_name || u.name} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{u.full_name || u.name}</p>
                <p className="text-[10px] text-muted capitalize">{u.role || 'miembro'}</p>
              </div>
              <button
                onClick={() => onRemoveMember(group.id, u.id)}
                title="Remover del grupo"
                className="p-1 rounded-lg hover:bg-red-500/10 text-muted hover:text-rose-400 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Agregar Miembro */}
      {showAdd ? (
        <div className="pt-2 border-t border-border/40 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="pl-8 text-xs py-1.5"
              autoFocus
            />
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {availableUsers.length === 0 ? (
              <p className="text-xs text-muted text-center py-2">No hay miembros disponibles</p>
            ) : (
              availableUsers.slice(0, 10).map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    onAddMember(group.id, u.id)
                    setShowAdd(false)
                    setSearch('')
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-accent/15 transition-colors text-left"
                >
                  <Avatar src={u.avatar_url} name={u.full_name || u.name} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{u.full_name || u.name}</p>
                    <p className="text-[10px] text-muted capitalize">{u.role || 'miembro'}</p>
                  </div>
                  <Plus size={13} className="text-accent-light" />
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => { setShowAdd(false); setSearch('') }}
            className="w-full py-1.5 text-xs text-muted hover:text-text-primary transition-colors text-center"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-border text-xs text-muted hover:text-accent-light hover:border-accent/40 transition-colors"
        >
          <Plus size={13} />
          <span>Agregar miembro</span>
        </button>
      )}
    </Card>
  )
}

function GroupFormModal({ initial, users, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [color, setColor] = useState(() => {
    if (initial?.color) return initial.color
    if (initial?.description && initial.description.startsWith('#')) return initial.description
    return PRESET_COLORS[0]
  })
  const [leaderId, setLeaderId] = useState(initial?.leader_id || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        color,
        description: color,
        leader_id: leaderId || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={true} onClose={onClose} title={initial ? 'Editar Grupo' : 'Nuevo Grupo'}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">Nombre del grupo</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Jóvenes Universitarios"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">Líder asignado (opcional)</label>
          <select
            value={leaderId}
            onChange={e => setLeaderId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-card2 border border-border text-text-primary text-xs"
          >
            <option value="">Sin líder asignado</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.full_name || u.name} ({u.role || 'miembro'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-2">Color identificador</label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center shadow-sm"
                style={{ background: c }}
              >
                {color === c && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Btn type="button" variant="secondary" onClick={onClose} fullWidth disabled={saving}>
            Cancelar
          </Btn>
          <Btn type="submit" fullWidth disabled={!name.trim() || saving}>
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : (initial ? 'Guardar Cambios' : 'Crear Grupo')}
          </Btn>
        </div>
      </form>
    </Modal>
  )
}

export default function GroupsAdmin() {
  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [groupsRes, usersRes] = await Promise.all([
        groupsApi.list(),
        centralApi.getUsers(),
      ])
      setGroups(Array.isArray(groupsRes) ? groupsRes : [])
      setUsers(Array.isArray(usersRes) ? usersRes : [])
    } catch (err) {
      console.error('Error cargando grupos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (data) => {
    if (modal?.id) {
      await groupsApi.update(modal.id, data)
    } else {
      await groupsApi.create(data)
    }
    await loadData()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este grupo/célula? Esta acción removerá la agrupación.')) return
    try {
      await groupsApi.delete(id)
      await loadData()
    } catch (err) {
      alert('Error eliminando grupo: ' + err.message)
    }
  }

  const handleAddMember = async (groupId, userId) => {
    try {
      await groupsApi.addMember(groupId, userId)
      await loadData()
    } catch (err) {
      alert('Error agregando miembro: ' + err.message)
    }
  }

  const handleRemoveMember = async (groupId, userId) => {
    try {
      await groupsApi.removeMember(groupId, userId)
      await loadData()
    } catch (err) {
      alert('Error removiendo miembro: ' + err.message)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Grupos y Células</h1>
          <p className="text-xs text-muted">Organización y liderazgo de los equipos de la comunidad</p>
        </div>
        <Btn onClick={() => setModal({})}>
          <Plus size={16} />
          <span>Nuevo Grupo</span>
        </Btn>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin text-accent-light mb-2" />
          <p className="text-xs font-medium">Cargando grupos...</p>
        </div>
      ) : groups.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent-light flex items-center justify-center mx-auto">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">No hay grupos registrados</h3>
            <p className="text-xs text-muted mt-1">Crea el primer grupo para organizar a los integrantes de la comunidad.</p>
          </div>
          <Btn onClick={() => setModal({})} className="mx-auto mt-2">
            <Plus size={14} />
            <span>Crear primer grupo</span>
          </Btn>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              users={users}
              onEdit={g => setModal(g)}
              onDelete={handleDelete}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <GroupFormModal
          initial={modal.id ? modal : null}
          users={users}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
