import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, UserPlus, Mail, Lock, User, Phone } from 'lucide-react'
import { Btn } from '../components/ui'

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, phone })
      } else {
        await login(email, password)
      }
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Error al autenticar. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 py-10 bg-bg relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand Logo & Slogan */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-5 w-fit">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl accent-gradient opacity-40 blur-2xl scale-125 pointer-events-none" />
            <div className="relative w-24 h-24 rounded-3xl accent-gradient flex flex-col items-center justify-center shadow-2xl shadow-accent/50 gap-1 border border-blue-400/30">
              <span className="text-white/70 text-[11px] tracking-[0.3em] uppercase font-semibold leading-none">grupo</span>
              <span className="text-white font-black text-2xl tracking-tight leading-none">Íntimos</span>
              <div className="flex gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span className="w-3.5 h-1.5 rounded-full bg-white/80" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-1">De Cerca</h1>
          <p className="text-xs text-muted italic leading-relaxed">
            "De conocer sobre Jesús,<br />a conocer a Jesús."
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          {/* Tab Selector */}
          <div className="flex bg-card2 p-1 rounded-2xl mb-5 border border-border">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                !isRegister 
                  ? 'bg-accent text-white shadow-md shadow-accent/30' 
                  : 'text-muted hover:text-text-primary'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                isRegister 
                  ? 'bg-accent text-white shadow-md shadow-accent/30' 
                  : 'text-muted hover:text-text-primary'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 mb-4 font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Nombre Completo</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Daniel Martínez"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Contraseña</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary p-1"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Btn
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
              className="mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
                  <span>{isRegister ? 'Registrarse (+50 pts)' : 'Ingresar'}</span>
                </span>
              )}
            </Btn>
          </form>
        </div>
      </div>
    </div>
  )
}
