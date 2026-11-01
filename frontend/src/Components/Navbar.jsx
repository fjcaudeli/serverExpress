import { BookOpen, Users, ClipboardList, LogOut, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

function Navbar() {
  const { usuario, cerrarSesion } = useAuthStore()
  const esAlumno = usuario.rol === 'Alumno'
  const enlaces = [
    {
      ruta: esAlumno ? `/alumnos/${usuario.id}` : '/alumnos',
      nombre: esAlumno ? 'Mi perfil' : 'Alumnos',
      Icono: esAlumno ? UserRound : Users,
    },
    { ruta: '/materias', nombre: 'Materias', Icono: BookOpen },
    {
      ruta: '/inscripciones',
      nombre: esAlumno ? 'Mis inscripciones' : 'Inscripciones',
      Icono: ClipboardList,
    },
  ]

  return (
    <div className="aplicacion">
      <a href="#contenido" className="saltar">
        Ir al contenido
      </a>
      <aside className="sidebar">
        <div className="marca">
          <span className="marca-icono">
            <BookOpen size={23} />
          </span>
          <div>
            <strong>Campus</strong>
            <span>TP Integrador</span>
          </div>
        </div>
        <p className="etiqueta-nav">GESTION ACADEMICA</p>
        <nav aria-label="Navegacion principal">
          {enlaces.map(({ ruta, nombre, Icono }) => (
            <NavLink
              key={ruta}
              to={ruta}
              className={({ isActive }) =>
                `nav-enlace ${isActive ? 'nav-activo' : ''}`
              }
            >
              <Icono size={19} aria-hidden="true" />
              {nombre}
            </NavLink>
          ))}
        </nav>
        <div className="sesion">
          <div className="usuario-sesion">
            <span className="avatar">
              {usuario.nombre.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{usuario.nombre}</strong>
              <span>{usuario.rol}</span>
            </div>
          </div>
          <button className="salir" onClick={() => cerrarSesion()}>
            <LogOut size={17} aria-hidden="true" />
            Cerrar sesion
          </button>
        </div>
      </aside>
      <div className="zona-principal">
        <header className="barra-superior">
          <span>Portal academico</span>
          <span className="rol">{usuario.rol}</span>
        </header>
        <main id="contenido">
          <Outlet />
        </main>
        <footer>
          Campus <span>Alumnos · Materias · Inscripciones</span>
        </footer>
      </div>
    </div>
  )
}

export default Navbar
