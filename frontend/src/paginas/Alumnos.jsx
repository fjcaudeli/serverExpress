import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Pencil,
  Archive,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api, { mensajeError } from '../services/api'
import { coincideBusqueda } from '../utils'
import Boton from '../Components/Boton'
import Mensaje from '../Components/Mensaje'
import Estado from '../Components/Estado'
import FormAlumno from '../Components/FormAlumno'

function Alumnos() { // Componente de la pagina de alumnos
  const esAdmin = useAuthStore(
    (estado) => estado.usuario.rol === 'Administrador',
  )
  const [alumnos, setAlumnos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [todos, setTodos] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [formulario, setFormulario] = useState(null)
  const [revision, setRevision] = useState(0)
  const [ocupado, setOcupado] = useState(false)

  // Estos mensajes permiten mostrar el ciclo de vida en DevTools.
  useEffect(() => {
    console.log('Alumnos: componente montado')
    return () => {
      console.log('Alumnos: componente desmontado')
    }
  }, [])

  useEffect(() => {  // Cargamos la lista de alumnos
    let activo = true
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const { data } = await api.get('/alumnos', { params: { todos } })
        if (activo) setAlumnos(data)
      } catch (error) {
        if (activo) setError(mensajeError(error))
      } finally {
        if (activo) setCargando(false)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [todos, revision])

  async function baja(alumno) {
    if (!window.confirm(`Dar de baja a ${alumno.nombre}?`)) return
    setOcupado(true)
    setError('')
    setMensaje('')
    try {
      const { data } = await api.delete(`/alumnos/${alumno.id}`)
      setMensaje(data.mensaje)
      setRevision(revision + 1)
    } catch (error) {
      setError(mensajeError(error))
    } finally {
      setOcupado(false)
    }
  }

  // filter busca sin modificar el array original; map crea las filas de la tabla.
  const filtrados = alumnos.filter((alumno) =>//
    coincideBusqueda(
      `${alumno.nombre} ${alumno.mail} ${alumno.usuario} ${alumno.id}`,
      busqueda,
    ),
  )

  return (
    <>
      <div className="cabecera-pagina">
        <div>
          <p className="etiqueta">GESTION ACADEMICA</p>
          <h1>
            Alumnos <span className="contador">{alumnos.length}</span>
          </h1>
          <p className="texto-suave">Directorio de alumnos y sus datos.</p>
        </div>
        {esAdmin && (
          <Boton icono={Plus} onClick={() => setFormulario({})}>
            Nuevo alumno
          </Boton>
        )}
      </div>
      <Mensaje>{error}</Mensaje>
      <Mensaje tipo="exito">{mensaje}</Mensaje>
      <div className="herramientas">
        <label className="buscador">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Buscar alumnos"
            placeholder="Buscar por nombre, usuario o mail..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={todos}
            onChange={(evento) => setTodos(evento.target.checked)}
          />
          Incluir bajas
        </label>
        <Boton
          icono={RefreshCw}
          variante="secundario"
          disabled={cargando || ocupado}
          onClick={() => setRevision(revision + 1)}
        >
          Actualizar
        </Boton>
      </div>
      {cargando ? (
        <p className="vacio" role="status">
          Cargando alumnos...
        </p>
      ) : error ? (
        <p className="vacio">
          No se pudo cargar el directorio. Podes reintentar con Actualizar.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Alumno</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th className="alinear-derecha">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((alumno) => (
                <tr key={alumno.id}>
                  <td className="texto-suave">#{alumno.id}</td>
                  <td>
                    <Link
                      className="nombre-enlace"
                      to={`/alumnos/${alumno.id}`}
                    >
                      <span className="avatar avatar-pequeno">
                        {alumno.nombre.slice(0, 1).toUpperCase()}
                      </span>
                      <span>
                        <strong>{alumno.nombre}</strong>
                        <small>{alumno.mail}</small>
                      </span>
                    </Link>
                  </td>
                  <td>{alumno.usuario}</td>
                  <td>
                    <Estado fechaBaja={alumno.fechaBaja} />
                  </td>
                  <td>
                    <div className="acciones-fila">
                      <Link
                        className="icono-boton"
                        title="Ver alumno"
                        aria-label={`Ver ${alumno.nombre}`}
                        to={`/alumnos/${alumno.id}`}
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                      {esAdmin && !alumno.fechaBaja && (
                        <>
                          <button
                            className="icono-boton"
                            title="Editar alumno"
                            aria-label={`Editar ${alumno.nombre}`}
                            onClick={() => setFormulario(alumno)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            className="icono-boton peligro"
                            title="Dar de baja"
                            aria-label={`Dar de baja a ${alumno.nombre}`}
                            disabled={ocupado}
                            onClick={() => baja(alumno)}
                          >
                            <Archive size={17} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div className="vacio">No hay alumnos para mostrar.</div>
          )}
          <div className="pie-tabla">
            {filtrados.length} de {alumnos.length} alumnos
            <span>{todos ? 'Activos y bajas' : 'Solo activos'}</span>
          </div>
        </div>
      )}
      {formulario && (
        <FormAlumno
          alumno={formulario.id ? formulario : null}
          cerrar={() => setFormulario(null)}
          guardado={() => {
            setFormulario(null)
            setMensaje('Alumno guardado correctamente.')
            setRevision(revision + 1)
          }}
        />
      )}
    </>
  )
}

export default Alumnos
