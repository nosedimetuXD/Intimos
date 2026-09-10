import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.removeItem('intimos_token')
      localStorage.removeItem('intimos_user')
    } catch {}
    window.location.href = '/login'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-base font-bold">Algo no cargó correctamente</h1>
            <p className="text-xs text-muted leading-relaxed">
              Ocurrió un problema temporal al renderizar este componente.
            </p>
            {this.state.error?.message && (
              <pre className="p-3 rounded-xl bg-black/40 border border-border text-[11px] text-rose-300 overflow-x-auto text-left whitespace-pre-wrap max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-light transition-colors"
              >
                Recargar página
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2 rounded-xl bg-card2 border border-border text-muted hover:text-text-primary text-xs font-semibold transition-colors"
              >
                Reiniciar sesión
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
