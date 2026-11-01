import { AlertCircle, CheckCircle2 } from 'lucide-react'

function Mensaje({ children, tipo = 'error' }) {
  if (!children) return null
  const Icono = tipo === 'error' ? AlertCircle : CheckCircle2
  return (
    <div
      className={`mensaje mensaje-${tipo}`}
      role={tipo === 'error' ? 'alert' : 'status'}
    >
      <Icono size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export default Mensaje
