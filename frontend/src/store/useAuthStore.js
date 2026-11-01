import { create } from 'zustand'

// Igual que el contador de clase, compartimos estado y funciones con Zustand.
// La sesion vive en memoria: al recargar hay que volver a iniciar sesion.
const useAuthStore = create((set) => ({
  token: null,
  usuario: null,
  aviso: '',
  iniciarSesion: ({ token, usuario }) => set({ token, usuario, aviso: '' }),
  cerrarSesion: (aviso = '') => set({ token: null, usuario: null, aviso }),
}))

export default useAuthStore
