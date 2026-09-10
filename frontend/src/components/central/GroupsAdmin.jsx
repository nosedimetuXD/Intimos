import React, { useState, useEffect } from 'react'
import { UsersRound, Plus, Trash2, User } from 'lucide-react'
import { Card, Btn, Modal } from '../ui'

const INITIAL_GROUPS = [
  { id: '1', name: 'Célula Norte - Conquistadores', leader: 'Daniel Martínez', membersCount: 8 },
  { id: '2', name: 'Célula Centro - Generación de Fe', leader: 'Liderazgo Íntimos', membersCount: 12 },
  { id: '3', name: 'Célula Sur - Luz y Verdad', leader: 'Equipo Pastoral', membersCount: 6 },
]

export default function GroupsAdmin() {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [leader, setLeader] = useState('')

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_groups') || '[]')
      if (stored.length > 0) setGroups(stored)
      else setGroups(INITIAL_GROUPS)
    } catch {
      setGroups(INITIAL_GROUPS)
    }
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const newG = {
      id: String(Date.now()),
      name: name.trim(),
      leader: leader.trim() || 'Por asignar',
      membersCount: 0,
    }

    const updated = [...groups, newG]
    setGroups(updated)
    localStorage.setItem('intimos_groups', JSON.stringify(updated))
    setName('')
    setLeader('')
    setShowModal(false)
  }

  const handleDelete = (id) => {
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
        <Btn onClick={() => setShowModal(true)}>
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
              <button
                onClick={() => handleDelete(g.id)}
                className="p-1.5 rounded-lg text-muted hover:text-rose-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>Integrantes:</span>
              <span className="font-bold text-accent-light">{g.membersCount} miembros</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Nuevo Grupo */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Crear Nuevo Grupo">
        <form onSubmit={handleAdd} className="p-4 space-y-3">
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

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={!name.trim()}>
              Crear Grupo
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
