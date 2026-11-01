function Estado({ fechaBaja }) {
  return (
    <span className={`estado ${fechaBaja ? 'estado-baja' : 'estado-activo'}`}>
      <span />
      {fechaBaja ? 'Baja' : 'Activo'}
    </span>
  )
}

export default Estado
