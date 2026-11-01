import { useEffect, useState } from 'react'
import { BookOpen, ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import api, { mensajeError } from '../services/api'
import Boton from '../Components/Boton'
import Mensaje from '../Components/Mensaje'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [conexion, setConexion] = useState('Comprobando API...')
  const [intento, setIntento] = useState(0)
  const { iniciarSesion, aviso } = useAuthStore()
  const navigate = useNavigate()

  // Fetch, como en UsuariosConFetch: comprobamos la respuesta publica de Express.
  useEffect(() => {
    const controller = new AbortController()
    async function comprobar() {
      setConexion('Comprobando API...')
      try {
        const respuesta = await fetch('/api/', { signal: controller.signal })
        if (!respuesta.ok) throw new Error('API no disponible')
        const datos = await respuesta.json()
        setConexion(datos.mensaje ? 'API disponible' : 'API no disponible')
      } catch {
        if (!controller.signal.aborted) setConexion('API no disponible')
      }
    }
    comprobar()
    return () => controller.abort()
  }, [intento])

  async function ingresar(evento) {
    evento.preventDefault()
    setCargando(true)
    setError('')
    try {
      const { data } = await api.post('/login', {
        usuario: usuario.trim(),
        password,
      })
      iniciarSesion(data)
      navigate(
        data.usuario.rol === 'Alumno'
          ? `/alumnos/${data.usuario.id}`
          : '/alumnos',
        { replace: true },
      )
    } catch (error) {
      setError(mensajeError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login">
      <section className="login-imagen" aria-label="Biblioteca universitaria">
        <div className="marca marca-clara">
          <BookOpen size={30} />
          <div>
            <strong>Campus</strong>
            <span>TP Integrador</span>
          </div>
        </div>
        <div className="pie-imagen">
          <span>PORTAL ACADEMICO</span>
          <p>
            Un espacio para
            <br />
            seguir aprendiendo.
          </p>
        </div>
      </section>
      <main className="login-principal">
        <div className="login-formulario">
          <span className="etiqueta">BIENVENIDO A CAMPUS</span>
          <h1>Iniciar sesion</h1>
          <p className="texto-suave mb-8">Ingresa con tu cuenta.</p>
          <Mensaje>{error || aviso}</Mensaje>
          <form className="formulario" onSubmit={ingresar}>
            <label>
              Usuario
              <input
                value={usuario}
                onChange={(evento) => setUsuario(evento.target.value)}
                autoComplete="username"
                minLength={3}
                maxLength={50}
                placeholder="Tu usuario"
                required
              />
            </label>
            <label>
              Contrasena
              <div className="campo-password">
                <input
                  type={visible ? 'text' : 'password'}
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  autoComplete="current-password"
                  minLength={6}
                  maxLength={100}
                  placeholder="Tu contrasena"
                  required
                />
                <button
                  type="button"
                  title={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  aria-label={
                    visible ? 'Ocultar contrasena' : 'Mostrar contrasena'
                  }
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <Boton type="submit" icono={ArrowRight} disabled={cargando}>
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </Boton>
          </form>
          <div className="conexion" role="status">
            <span
              className={`punto ${conexion === 'API disponible' ? 'conectado' : ''}`}
            />
            {conexion}
            <button
              className="icono-boton"
              title="Comprobar conexion"
              aria-label="Comprobar conexion"
              onClick={() => setIntento(intento + 1)}
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <p className="login-pie">
            Gestion de alumnos, materias e inscripciones
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login
