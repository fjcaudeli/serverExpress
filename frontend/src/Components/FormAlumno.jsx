import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import api, { mensajeError } from '../services/api'
import { datosAlumno } from '../utils'
import Modal from './Modal'
import Boton from './Boton'
import Mensaje from './Mensaje'

function FormAlumno({ alumno, cerrar, guardado }) {
  const [formulario, setFormulario] = useState({
    nombre: alumno?.nombre || '',
    mail: alumno?.mail || '',
    usuario: alumno?.usuario || '',
    password: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Abrir y cerrar el formulario permite observar montaje y desmontaje.
  useEffect(() => {
    console.log('FormAlumno: componente montado')
    return () => {
      console.log('FormAlumno: componente desmontado')
    }
  }, [])

  function cambiar(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  async function guardar(evento) { // Función para enviar el formulario de alumno
    evento.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const respuesta = alumno
        ? await api.put(`/alumnos/${alumno.id}`, datosAlumno(formulario))
        : await api.post('/alumnos', datosAlumno(formulario))
      guardado(respuesta.data)
    } catch (error) {
      setError(mensajeError(error))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo={alumno ? 'Editar alumno' : 'Nuevo alumno'}
      cerrar={cerrar}
      ocupado={guardando}
    >
      <form onSubmit={guardar} className="formulario">
        <Mensaje>{error}</Mensaje>
        <label>
          Nombre
          <input
            autoFocus
            name="nombre"
            value={formulario.nombre}
            onChange={cambiar}
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <label>
          Mail
          <input
            type="email"
            name="mail"
            value={formulario.mail}
            onChange={cambiar}
            maxLength={150}
            required
          />
        </label>
        <label>
          Usuario
          <input
            name="usuario"
            value={formulario.usuario}
            onChange={cambiar}
            minLength={3}
            maxLength={50}
            pattern="[a-zA-Z0-9._\-]+"
            autoComplete="off"
            required
          />
        </label>
        <label>
          {alumno ? 'Nueva contrasena (opcional)' : 'Contrasena'}
          <input
            type="password"
            name="password"
            value={formulario.password}
            onChange={cambiar}
            minLength={6}
            maxLength={100}
            autoComplete="new-password"
            required={!alumno}
          />
        </label>
        <div className="acciones-formulario">
          <Boton variante="secundario" disabled={guardando} onClick={cerrar}>
            Cancelar
          </Boton>
          <Boton icono={Save} type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar alumno'}
          </Boton>
        </div>
      </form>
    </Modal>
  )
}

export default FormAlumno
