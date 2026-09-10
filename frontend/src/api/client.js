const API_BASE = import.meta.env.VITE_API_URL || 'https://wwuyitqy2lafj2xuywspyeut.147.5.103.87.sslip.io/api'

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('intimos_token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('intimos_token')
        localStorage.removeItem('intimos_user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      throw new Error(data.error || data.message || `Error del servidor (${res.status})`)
    }

    return data.data !== undefined ? data.data : data
  } catch (err) {
    throw err
  }
}
