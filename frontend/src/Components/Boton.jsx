function Boton({
  children,
  icono: Icono,
  variante = 'principal',
  type = 'button',
  ...props
}) {
  return (
    <button type={type} className={`boton boton-${variante}`} {...props}>
      {Icono && <Icono size={17} aria-hidden="true" />}
      {children}
    </button>
  )
}

export default Boton
