import React, { useState, useEffect } from 'react'
import { UsersRound, Plus, Trash2, User, Pencil } from 'lucide-react'
import { Card, Btn, Modal } from '../ui'

const INITIAL_GROUPS = [
  { id: '1', name: 'Célula Norte - Conquistadores', leader: 'Daniel Martínez', membersCount: 8 },
  { id: '2', name: 'Célula Centro - Generación de Fe', leader: 'Liderazgo Íntimos', membersCount: 12 },
  { id: '3', name: 'Célula Sur - Luz y Verdad', leader: 'Equipo Pastoral', membersCount: 6 },
]

export default function GroupsAdmin() {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [name, setName] = useState('')
  const [leader, setLeader] = useState('')
  const [membersCount, setMembersCount] = useState(0)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_groups') || '[]')
      if (stored.length > 0) setGroups(stored)
      else setGroups(INITIAL_GROUPS)
    } catch {
      setGroups(INITIAL_GROUPS)
    }
  }, [])

  const handleOpenCreate = () => {
    setEditingGroup(null)
    setName('')
    setLeader('')
    setMembersCount(0)
    setShowModal(true)
  }

  const handleOpenEdit = (group) => {
    setEditingGroup(group)
    setName(group.name || '')
    setLeader(group.leader || '')
    setMembersCount(group.membersCount || 0)
    setShowModal(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    let updated = []
    if (editingGroup) {
      updated = groups.map(g => g.id === editingGroup.id ? {
        ...g,
        name: name.trim(),
        leader: leader.trim() || 'Por asignar',
        membersCount: parseInt(membersCount) || 0
      } : g)
    } else {
      const newG = {
        id: String(Date.now()),
        name: name.trim(),
        leader: leader.trim() || 'Por asignar',
        membersCount: parseInt(membersCount) || 0,
      }
      updated = [...groups, newG]
    }

    setGroups(updated)
    localStorage.setItem('intimos_groups', JSON.stringify(updated))
    setName('')
    setLeader('')
    setMembersCount(0)
    setEditingGroup(null)
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar este grupo/célula?')) return
    const updated = groups.filter(g => g.id !== id)
    setGroups(updated)
    localStorage.setItem('intimos_groups', JSON.stringify(updated))
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Grupos y Células</h1>
          <p className="text-xs text-muted">Organización y liderazgo de grupos pequeños</p>
        </div>
        <Btn onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Nuevo Grupo</span>
        </Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {groups.map(g => (
          <Card key={g.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-text-primary">{g.name}</h3>
                <p className="text-xs text-muted flex items-center gap-1.5 mt-1">
                  <User size={12} className="text-accent-light" />
                  <span>Líder: {g.leader}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(g)}
                  title="Editar grupo"
                  className="p-1.5 rounded-lg text-muted hover:text-accent-light hover:bg-card2 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(g.id)}
                  title="Eliminar grupo"
                  className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-card2 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>Integrantes:</span>
              <span className="font-bold text-accent-light">{g.membersCount} miembros</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Crear / Editar Grupo */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingGroup ? 'Editar Grupo / Célula' : 'Crear Nuevo Grupo'}>
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Nombre del grupo / célula</label>
            <input
              required
              placeholder="Ej. Célula Jóvenes Universitarios"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Líder asignado</label>
            <input
              placeholder="Nombre del líder encargado"
              value={leader}
              onChange={e => setLeader(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Cantidad de integrantes / miembros</label>
            <input
              type="number"
              min="0"
              placeholder="Número de miembros"
              value={membersCount}
              onChange={e => setMembersCount(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Btn type="button" variant="secondary" onClick={() => setShowModal(false)} fullWidth>
              Cancelar
            </Btn>
            <Btn type="submit" fullWidth disabled={!name.trim()}>
              {editingGroup ? 'Guardar Cambios' : 'Crear Grupo'}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}

