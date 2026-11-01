import { useState } from 'react'
import { Save } from 'lucide-react'
import api, { mensajeError } from '../services/api'
import Modal from './Modal'
import Boton from './Boton'
import Mensaje from './Mensaje'

function FormMateria({ materia, materias, cerrar, guardado }) {
  const [nombre, setNombre] = useState(materia?.nombre || '')
  const [carreraId, setCarreraId] = useState(materia?.carreraId || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // No existe GET /carreras. Sugerimos los IDs que ya vienen en las materias.
  // Tambien se puede ingresar otro ID existente, que sera validado por la API.
  const carreras = materias.filter(
    (item, indice, lista) =>
      lista.findIndex((otra) => otra.carreraId === item.carreraId) === indice,
  )

  async function guardar(evento) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const datos = { nombre: nombre.trim(), carreraId: Number(carreraId) }
      const respuesta = materia
        ? await api.put(`/materias/${materia.id}`, datos)
        : await api.post('/materias', datos)
      guardado(respuesta.data)
    } catch (error) {
      setError(mensajeError(error))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo={materia ? 'Editar materia' : 'Nueva materia'}
      cerrar={cerrar}
      ocupado={guardando}
    >
      <form onSubmit={guardar} className="formulario">
        <Mensaje>{error}</Mensaje>
        <label>
          Nombre
          <input
            autoFocus
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            minLength={3}
            maxLength={100}
            required
          />
        </label>
        <label>
          ID de carrera
          <input
            type="number"
            min="1"
            step="1"
            list="carreras"
            value={carreraId}
            onChange={(evento) => setCarreraId(evento.target.value)}
            required
          />
        </label>
        <datalist id="carreras">
          {carreras.map((item) => (
            <option key={item.carreraId} value={item.carreraId}>
              {item.carrera}
            </option>
          ))}
        </datalist>
        <div className="referencias">
          {carreras.map((item) => (
            <span key={item.carreraId}>
              {item.carreraId} · {item.carrera}
            </span>
          ))}
        </div>
        <div className="acciones-formulario">
          <Boton variante="secundario" disabled={guardando} onClick={cerrar}>
            Cancelar
          </Boton>
          <Boton icono={Save} type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar materia'}
          </Boton>
        </div>
      </form>
    </Modal>
  )
}

export default FormMateria
