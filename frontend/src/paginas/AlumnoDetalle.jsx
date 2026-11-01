import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, ClipboardList, RefreshCw } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api, { mensajeError } from '../services/api'
import { fecha } from '../utils'
import Boton from '../Components/Boton'
import Mensaje from '../Components/Mensaje'
import Estado from '../Components/Estado'
import FormAlumno from '../Components/FormAlumno'
import Auditoria from '../Components/Auditoria'

function AlumnoDetalle() {
  const { id } = useParams()
  const usuario = useAuthStore((estado) => estado.usuario)
  const [alumno, setAlumno] = useState(null)
  const [materias, setMaterias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [editando, setEditando] = useState(false)
  const [revision, setRevision] = useState(0)
  const permitido = usuario.rol !== 'Alumno' || usuario.id === Number(id)

  // useParams obtiene el ID de la URL, como /contador/:valor en la clase.
  useEffect(() => {
    let activo = true
    setEditando(false)
    async function cargar() {
      setCargando(true)
      setError('')
      setAlumno(null)
      setMaterias([])
      if (!permitido) {
        setCargando(false)
        return
      }
      try {
        const { data } = await api.get(`/alumnos/${id}`, {
          params: { todos: usuario.rol !== 'Alumno' },
        })
        const respuesta = data.fechaBaja
          ? { data: [] }
          : await api.get(`/alumnos/${id}/materias`)
        if (activo) {
          setAlumno(data)
          setMaterias(respuesta.data)
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
  }, [id, revision, permitido, usuario.rol])

  if (!permitido)
    return <Mensaje>No tenes permisos para ver a otro alumno.</Mensaje>
  if (cargando)
    return (
      <p className="vacio" role="status">
        Cargando alumno...
      </p>
    )
  if (error)
    return (
      <>
        <Mensaje>{error}</Mensaje>
        <Boton
          variante="secundario"
          icono={RefreshCw}
          onClick={() => setRevision(revision + 1)}
        >
          Reintentar
        </Boton>
      </>
    )
  if (!alumno) return null
  const puedeEditar =
    !alumno.fechaBaja &&
    (usuario.rol === 'Administrador' || usuario.id === alumno.id)

  return (
    <>
      {usuario.rol !== 'Alumno' && (
        <Link className="volver" to="/alumnos">
          <ArrowLeft size={16} />
          Alumnos
        </Link>
      )}
      <div className="cabecera-pagina">
        <div>
          <p className="etiqueta">
            {usuario.rol === 'Alumno' ? 'MI CUENTA' : `ALUMNO #${alumno.id}`}
          </p>
          <h1>{alumno.nombre}</h1>
          <p className="texto-suave">{alumno.mail}</p>
        </div>
        {puedeEditar && (
          <Boton
            icono={Pencil}
            variante="secundario"
            onClick={() => setEditando(true)}
          >
            Editar datos
          </Boton>
        )}
      </div>
      <Mensaje tipo="exito">{mensaje}</Mensaje>
      <dl className="datos seccion">
        <div>
          <dt>Usuario</dt>
          <dd>{alumno.usuario}</dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd>{alumno.rol}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <Estado fechaBaja={alumno.fechaBaja} />
          </dd>
        </div>
        <div>
          <dt>ID de alumno</dt>
          <dd>#{alumno.id}</dd>
        </div>
      </dl>
      <div className="subcabecera">
        <h2>
          Materias inscriptas{' '}
          <span className="contador">{materias.length}</span>
        </h2>
        {!alumno.fechaBaja && (
          <Link
            className="boton boton-secundario"
            to={`/inscripciones?alumnoId=${alumno.id}`}
          >
            <ClipboardList size={17} />
            {usuario.rol === 'Coordinador'
              ? 'Consultar inscripciones'
              : 'Gestionar inscripciones'}
          </Link>
        )}
      </div>
      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Materia</th>
              <th>Carrera</th>
              <th>Fecha de inscripcion</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((item) => (
              <tr key={item.inscripcionId}>
                <td>
                  <Link className="enlace" to={`/materias/${item.materiaId}`}>
                    {item.materia}
                  </Link>
                </td>
                <td>{item.carrera}</td>
                <td>{fecha(item.fechaInscripcion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {materias.length === 0 && (
          <div className="vacio">
            {alumno.fechaBaja
              ? 'Alumno dado de baja.'
              : 'Sin materias inscriptas.'}
          </div>
        )}
      </div>
      <Auditoria datos={alumno} />
      {editando && (
        <FormAlumno
          alumno={alumno}
          cerrar={() => setEditando(false)}
          guardado={() => {
            setEditando(false)
            setMensaje('Datos guardados correctamente.')
            setRevision(revision + 1)
          }}
        />
      )}
    </>
  )
}

export default AlumnoDetalle
