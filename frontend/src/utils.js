export function fecha(valor) {
  if (!valor) return '-'
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valor))
}

export function coincideBusqueda(texto, busqueda) {
  return texto.toLowerCase().includes(busqueda.trim().toLowerCase())
}

// El formulario no manda una contrasena vacia al editar: conserva la actual.
export function datosAlumno(formulario) {
  const datos = {
    nombre: formulario.nombre.trim(),
    mail: formulario.mail.trim(),
    usuario: formulario.usuario.trim(),
  }
  if (formulario.password) datos.password = formulario.password
  return datos
}
