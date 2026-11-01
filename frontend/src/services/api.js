import axios from 'axios'
import useAuthStore from '../store/useAuthStore.js'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

// Todas las peticiones usan el token del ultimo login, sin copiarlo a mano.
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/login') {
      useAuthStore
        .getState()
        .cerrarSesion('La sesion vencio. Ingresa nuevamente.')
    }
    return Promise.reject(error)
  },
)

export function mensajeError(error) {
  return (
    error.response?.data?.message ||
    'No se pudo conectar con la API. Verifica que Express y MySQL esten funcionando.'
  )
}

export default api
