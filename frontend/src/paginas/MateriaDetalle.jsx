import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList, RefreshCw } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api, { mensajeError } from '../services/api'
import { fecha } from '../utils'
import Mensaje from '../Components/Mensaje'
import Boton from '../Components/Boton'
import Estado from '../Components/Estado'
import Auditoria from '../Components/Auditoria'

function MateriaDetalle() {
  const { id } = useParams()
  const rol = useAuthStore((estado) => estado.usuario.rol)
  const [materia, setMateria] = useState(null)
  const [alumnos, setAlumnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let activo = true
    async function cargar() {
      setCargando(true)
      setError('')
      setMateria(null)
      setAlumnos([])
      try {
        const { data } = await api.get(`/materias/${id}`, {
          params: { todos: rol !== 'Alumno' },
        })
        const respuesta =
          rol !== 'Alumno' && !data.fechaBaja
            ? await api.get(`/materias/${id}/alumnos`)
            : { data: [] }
        if (activo) {
          setMateria(data)
          setAlumnos(respuesta.data)
        }
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
  }, [id, rol, revision])

  if (cargando)
    return (
      <p className="vacio" role="status">
        Cargando materia...
      </p>
    )
  if (error)
    return (
      <>
        <Mensaje>{error}</Mensaje>
        <Boton
          icono={RefreshCw}
          variante="secundario"
          onClick={() => setRevision(revision + 1)}
        >
          Reintentar
        </Boton>
      </>
    )
  if (!materia) return null

  return (
    <>
      <Link className="volver" to="/materias">
        <ArrowLeft size={16} />
        Materias
      </Link>
      <div className="cabecera-pagina">
        <div>
          <p className="etiqueta">MATERIA #{materia.id}</p>
          <h1>{materia.nombre}</h1>
          <p className="texto-suave">{materia.carrera}</p>
        </div>
        {rol !== 'Coordinador' && !materia.fechaBaja && (
          <Link
            className="boton boton-principal"
            to={`/inscripciones?materiaId=${materia.id}`}
          >
            <ClipboardList size={17} />
            {rol === 'Alumno' ? 'Inscribirme' : 'Gestionar inscripciones'}
          </Link>
        )}
      </div>
      <dl className="datos seccion">
        <div>
          <dt>ID de materia</dt>
          <dd>#{materia.id}</dd>
        </div>
        <div>
          <dt>Carrera</dt>
          <dd>{materia.carrera}</dd>
        </div>
        <div>
          <dt>ID de carrera</dt>
          <dd>#{materia.carreraId}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <Estado fechaBaja={materia.fechaBaja} />
          </dd>
        </div>
      </dl>
      {rol !== 'Alumno' && (
        <>
          <div className="subcabecera">
            <h2>
              Alumnos inscriptos{' '}
              <span className="contador">{alumnos.length}</span>
            </h2>
          </div>
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>ID alumno</th>
                  <th>Alumno</th>
                  <th>Mail</th>
                  <th>Inscripcion</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((item) => (
                  <tr key={item.inscripcionId}>
                    <td>#{item.alumnoId}</td>
                    <td>
                      <Link className="enlace" to={`/alumnos/${item.alumnoId}`}>
                        {item.alumno}
                      </Link>
                    </td>
                    <td>{item.mail}</td>
                    <td>{fecha(item.fechaInscripcion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {alumnos.length === 0 && (
              <div className="vacio">
                {materia.fechaBaja
                  ? 'Materia dada de baja.'
                  : 'Sin alumnos inscriptos.'}
              </div>
            )}
          </div>
        </>
      )}
      <Auditoria datos={materia} />
    </>
  )
}

export default MateriaDetalle
