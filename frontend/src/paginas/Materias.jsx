import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Pencil,
  Archive,
  ArrowUpRight,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api, { mensajeError } from '../services/api'
import { coincideBusqueda } from '../utils'
import Boton from '../Components/Boton'
import Mensaje from '../Components/Mensaje'
import Estado from '../Components/Estado'
import FormMateria from '../Components/FormMateria'

function Materias() {
  const rol = useAuthStore((estado) => estado.usuario.rol)
  const [materias, setMaterias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [todos, setTodos] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [formulario, setFormulario] = useState(null)
  const [revision, setRevision] = useState(0)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    let activo = true
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const { data } = await api.get('/materias', { params: { todos } })
        if (activo) setMaterias(data)
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

  async function baja(materia) {
    if (!window.confirm(`Dar de baja la materia ${materia.nombre}?`)) return
    setOcupado(true)
    setError('')
    setMensaje('')
    try {
      const { data } = await api.delete(`/materias/${materia.id}`)
      setMensaje(data.mensaje)
      setRevision(revision + 1)
    } catch (error) {
      setError(mensajeError(error))
    } finally {
      setOcupado(false)
    }
  }

  const filtradas = materias.filter((materia) =>
    coincideBusqueda(
      `${materia.nombre} ${materia.carrera} ${materia.id}`,
      busqueda,
    ),
  )

  return (
    <>
      <div className="cabecera-pagina">
        <div>
          <p className="etiqueta">OFERTA ACADEMICA</p>
          <h1>
            Materias <span className="contador">{materias.length}</span>
          </h1>
          <p className="texto-suave">Materias y carreras disponibles.</p>
        </div>
        {rol === 'Administrador' && (
          <Boton icono={Plus} onClick={() => setFormulario({})}>
            Nueva materia
          </Boton>
        )}
      </div>
      <Mensaje>{error}</Mensaje>
      <Mensaje tipo="exito">{mensaje}</Mensaje>
      <div className="herramientas">
        <label className="buscador">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Buscar materias"
            placeholder="Buscar materia o carrera..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </label>
        {rol !== 'Alumno' && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={todos}
              onChange={(evento) => setTodos(evento.target.checked)}
            />
            Incluir bajas
          </label>
        )}
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
          Cargando materias...
        </p>
      ) : error ? (
        <p className="vacio">
          No se pudo cargar el listado. Podes reintentar con Actualizar.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Materia</th>
                <th>Carrera</th>
                <th>Estado</th>
                <th className="alinear-derecha">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((materia) => (
                <tr key={materia.id}>
                  <td className="texto-suave">#{materia.id}</td>
                  <td>
                    <Link
                      className="nombre-enlace"
                      to={`/materias/${materia.id}`}
                    >
                      <span className="materia-icono">
                        <BookOpen size={18} />
                      </span>
                      <strong>{materia.nombre}</strong>
                    </Link>
                  </td>
                  <td>{materia.carrera}</td>
                  <td>
                    <Estado fechaBaja={materia.fechaBaja} />
                  </td>
                  <td>
                    <div className="acciones-fila">
                      <Link
                        className="icono-boton"
                        title="Ver materia"
                        aria-label={`Ver ${materia.nombre}`}
                        to={`/materias/${materia.id}`}
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                      {rol === 'Administrador' && !materia.fechaBaja && (
                        <>
                          <button
                            className="icono-boton"
                            title="Editar materia"
                            aria-label={`Editar ${materia.nombre}`}
                            onClick={() => setFormulario(materia)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            className="icono-boton peligro"
                            title="Dar de baja"
                            aria-label={`Dar de baja ${materia.nombre}`}
                            disabled={ocupado}
                            onClick={() => baja(materia)}
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
          {filtradas.length === 0 && (
            <div className="vacio">No hay materias para mostrar.</div>
          )}
          <div className="pie-tabla">
            {filtradas.length} de {materias.length} materias
            <span>{todos ? 'Activas y bajas' : 'Solo activas'}</span>
          </div>
        </div>
      )}
      {formulario && (
        <FormMateria
          materia={formulario.id ? formulario : null}
          materias={materias}
          cerrar={() => setFormulario(null)}
          guardado={() => {
            setFormulario(null)
            setMensaje('Materia guardada correctamente.')
            setRevision(revision + 1)
          }}
        />
      )}
    </>
  )
}

export default Materias
