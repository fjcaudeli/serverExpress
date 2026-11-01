import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Archive, RefreshCw } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api, { mensajeError } from '../services/api'
import { fecha } from '../utils'
import Boton from '../Components/Boton'
import Mensaje from '../Components/Mensaje'

function Inscripciones() {
  const usuario = useAuthStore((estado) => estado.usuario)
  const [parametros, setParametros] = useSearchParams()
  const esAlumno = usuario.rol === 'Alumno'
  const puedeModificar = usuario.rol !== 'Coordinador'
  // Para Alumno ignoramos cualquier alumnoId de la URL: solo opera sobre si mismo.
  const alumnoId = esAlumno
    ? String(usuario.id)
    : parametros.get('alumnoId') || ''
  const [materiaId, setMateriaId] = useState(parametros.get('materiaId') || '')
  const [alumnos, setAlumnos] = useState([])
  const [materias, setMaterias] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargandoLista, setCargandoLista] = useState(false)
  const [error, setError] = useState('')
  const [errorLista, setErrorLista] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [revision, setRevision] = useState(0)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const respuestaMaterias = await api.get('/materias')
        const respuestaAlumnos = esAlumno
          ? { data: [] }
          : await api.get('/alumnos')
        if (activo) {
          setMaterias(respuestaMaterias.data)
          setAlumnos(respuestaAlumnos.data)
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
  }, [esAlumno, intento])

  useEffect(() => {
    let activo = true
    async function cargarInscripciones() {
      setInscripciones([])
      setErrorLista('')
      setErrorAccion('')
      setMensaje('')
      setCargandoLista(Boolean(alumnoId))
      if (!alumnoId) return
      try {
        const { data } = await api.get(`/alumnos/${alumnoId}/materias`)
        if (activo) setInscripciones(data)
      } catch (error) {
        if (activo) setErrorLista(mensajeError(error))
      } finally {
        if (activo) setCargandoLista(false)
      }
    }
    cargarInscripciones()
    return () => {
      activo = false
    }
  }, [alumnoId, revision])

  async function inscribir(evento) {
    evento.preventDefault()
    setOcupado(true)
    setErrorAccion('')
    setMensaje('')
    try {
      const datos = { materiaId: Number(materiaId) }
      if (!esAlumno) datos.alumnoId = Number(alumnoId)
      const { data } = await api.post('/inscripciones', datos)
      const { data: lista } = await api.get(`/alumnos/${alumnoId}/materias`)
      setInscripciones(lista)
      setMateriaId('')
      setMensaje(`Inscripcion a ${data.materia} realizada correctamente.`)
    } catch (error) {
      setErrorAccion(mensajeError(error))
    } finally {
      setOcupado(false)
    }
  }

  async function baja(inscripcion) {
    if (!window.confirm(`Dar de baja la inscripcion a ${inscripcion.materia}?`))
      return
    setOcupado(true)
    setErrorAccion('')
    setMensaje('')
    try {
      const { data } = await api.delete('/inscripciones', {
        data: { id: inscripcion.inscripcionId },
      })
      // Quitamos de la vista la inscripcion dada de baja, sin modificar el array anterior.
      setInscripciones(
        inscripciones.filter(
          (item) => item.inscripcionId !== inscripcion.inscripcionId,
        ),
      )
      setMensaje(data.mensaje)
    } catch (error) {
      setErrorAccion(mensajeError(error))
    } finally {
      setOcupado(false)
    }
  }

  const disponibles = materias.filter(
    (materia) => !inscripciones.some((item) => item.materiaId === materia.id),
  )
  const alumnoSeleccionado = esAlumno
    ? usuario.nombre
    : alumnos.find((item) => String(item.id) === alumnoId)?.nombre

  return (
    <>
      <div className="cabecera-pagina">
        <div>
          <p className="etiqueta">TRAYECTO ACADEMICO</p>
          <h1>{esAlumno ? 'Mis inscripciones' : 'Inscripciones'}</h1>
          <p className="texto-suave">
            {esAlumno ? usuario.nombre : 'Consulta de materias por alumno.'}
          </p>
        </div>
        <Boton
          icono={RefreshCw}
          variante="secundario"
          disabled={cargando || cargandoLista || ocupado}
          onClick={() => {
            setIntento(intento + 1)
            setRevision(revision + 1)
          }}
        >
          Actualizar
        </Boton>
      </div>
      <Mensaje>{error || errorLista || errorAccion}</Mensaje>
      <Mensaje tipo="exito">{mensaje}</Mensaje>
      {cargando ? (
        <p className="vacio" role="status">
          Cargando datos...
        </p>
      ) : error ? (
        <p className="vacio">
          No se pudieron cargar los datos. Podes reintentar con Actualizar.
        </p>
      ) : (
        <>
          <form className="formulario-inscripcion seccion" onSubmit={inscribir}>
            {!esAlumno && (
              <label>
                Alumno
                <select
                  value={alumnoId}
                  disabled={ocupado}
                  onChange={(evento) =>
                    setParametros(
                      evento.target.value
                        ? { alumnoId: evento.target.value }
                        : {},
                    )
                  }
                  required
                >
                  <option value="">Seleccionar alumno</option>
                  {alumnos.map((alumno) => (
                    <option key={alumno.id} value={alumno.id}>
                      #{alumno.id} · {alumno.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {puedeModificar && (
              <>
                <label>
                  Materia
                  <select
                    value={materiaId}
                    onChange={(evento) => setMateriaId(evento.target.value)}
                    disabled={
                      !alumnoId ||
                      cargandoLista ||
                      ocupado ||
                      Boolean(errorLista)
                    }
                    required
                  >
                    <option value="">Seleccionar materia</option>
                    {disponibles.map((materia) => (
                      <option key={materia.id} value={materia.id}>
                        {materia.nombre} · {materia.carrera}
                      </option>
                    ))}
                  </select>
                </label>
                <Boton
                  type="submit"
                  icono={Plus}
                  disabled={
                    !alumnoId ||
                    !materiaId ||
                    cargandoLista ||
                    ocupado ||
                    Boolean(errorLista)
                  }
                >
                  {ocupado
                    ? 'Procesando...'
                    : esAlumno
                      ? 'Inscribirme'
                      : 'Inscribir alumno'}
                </Boton>
              </>
            )}
          </form>
          <div className="subcabecera">
            <h2>
              {alumnoSeleccionado
                ? `Materias de ${alumnoSeleccionado}`
                : 'Materias inscriptas'}{' '}
              <span className="contador">{inscripciones.length}</span>
            </h2>
          </div>
          {cargandoLista ? (
            <p className="vacio" role="status">
              Cargando inscripciones...
            </p>
          ) : errorLista ? (
            <p className="vacio">No se pudieron consultar las inscripciones.</p>
          ) : (
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>ID inscripcion</th>
                    <th>Materia</th>
                    <th>Carrera</th>
                    <th>Fecha</th>
                    {puedeModificar && (
                      <th className="alinear-derecha">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map((item) => (
                    <tr key={item.inscripcionId}>
                      <td className="texto-suave">#{item.inscripcionId}</td>
                      <td>
                        <Link
                          className="enlace"
                          to={`/materias/${item.materiaId}`}
                        >
                          {item.materia}
                        </Link>
                      </td>
                      <td>{item.carrera}</td>
                      <td>{fecha(item.fechaInscripcion)}</td>
                      {puedeModificar && (
                        <td>
                          <div className="acciones-fila">
                            <button
                              className="icono-boton peligro"
                              title="Dar de baja inscripcion"
                              aria-label={`Dar de baja inscripcion a ${item.materia}`}
                              disabled={ocupado}
                              onClick={() => baja(item)}
                            >
                              <Archive size={17} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {inscripciones.length === 0 && (
                <div className="vacio">
                  {alumnoId
                    ? 'Sin materias inscriptas.'
                    : 'Selecciona un alumno para consultar sus inscripciones.'}
                </div>
              )}
              <div className="pie-tabla">
                {inscripciones.length} inscripciones<span>Solo activas</span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default Inscripciones
