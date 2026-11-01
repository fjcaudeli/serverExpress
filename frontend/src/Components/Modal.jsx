import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

function Modal({ titulo, cerrar, ocupado = false, children }) {
  const dialogo = useRef(null)

  // El dialog nativo maneja el foco y evita navegar por el fondo con Tab.
  useEffect(() => {
    const elemento = dialogo.current
    elemento.showModal()
    return () => elemento.close()
  }, [])

  return (
    <dialog
      ref={dialogo}
      className="modal"
      aria-labelledby="titulo-modal"
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) cerrar()
      }}
    >
      <div className="modal-cabecera">
        <h2 id="titulo-modal">{titulo}</h2>
        <button
          type="button"
          className="icono-boton"
          title="Cerrar"
          aria-label="Cerrar"
          disabled={ocupado}
          onClick={cerrar}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

export default Modal
