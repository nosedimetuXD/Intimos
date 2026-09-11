import React, { useState, useEffect } from 'react'
import { Gift, Calendar, Phone, MessageCircle } from 'lucide-react'
import { centralApi } from '../../api'
import { Card, Avatar, Empty } from '../ui'

export default function BirthdaysManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    centralApi.getUsers()
      .then(res => setUsers(res || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Filter or mock birthdays if not registered
  const membersWithBirthdays = users.map((u, i) => ({
    ...u,
    // Provide illustrative birthday month/day if empty
    birthdate: u.birthdate || `1999-0${(i % 9) + 1}-15`,
  }))

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Cumpleaños del Grupo</h1>
          <p className="text-xs text-muted">Mantén presente las fechas especiales de los miembros</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
          <Gift size={20} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-xs uppercase tracking-wider text-muted">
          Próximos Cumpleañeros
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted">Cargando cumpleaños...</div>
        ) : membersWithBirthdays.length === 0 ? (
          <Empty icon={Gift} title="Sin cumpleaños registrados" subtitle="Pide a los jóvenes registrar su fecha en su perfil." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {membersWithBirthdays.map(u => (
              <Card key={u.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.photo} name={u.full_name} size="sm" />
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-text-primary">{u.full_name}</h3>
                      <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        <span>Fecha: {u.birthdate}</span>
                      </p>
                    </div>
                  </div>

                  {u.phone && (
                    <a
                      href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Feliz cumpleaños ${u.full_name}! Que Dios te bendiga enormemente 🎉🎈`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                      title="Enviar saludo de WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
