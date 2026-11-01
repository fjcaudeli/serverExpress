import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import Navbar from './Components/Navbar'
import Login from './paginas/Login'
import Alumnos from './paginas/Alumnos'
import AlumnoDetalle from './paginas/AlumnoDetalle'
import Materias from './paginas/Materias'
import MateriaDetalle from './paginas/MateriaDetalle'
import Inscripciones from './paginas/Inscripciones'

// Las rutas protegidas no se montan sin sesion. Los permisos reales los valida Express.
function RutaPrivada() {
  const token = useAuthStore((estado) => estado.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  const usuario = useAuthStore((estado) => estado.usuario)
  const inicio =
    usuario?.rol === 'Alumno' ? `/alumnos/${usuario.id}` : '/alumnos'

  return (
    <Routes>
      <Route
        path="/login"
        element={usuario ? <Navigate to={inicio} replace /> : <Login />}
      />
      <Route element={<RutaPrivada />}>
        <Route element={<Navbar />}>
          <Route index element={<Navigate to={inicio} replace />} />
          <Route
            path="alumnos"
            element={
              usuario?.rol === 'Alumno' ? (
                <Navigate to={inicio} replace />
              ) : (
                <Alumnos />
              )
            }
          />
          <Route path="alumnos/:id" element={<AlumnoDetalle />} />
          <Route path="materias" element={<Materias />} />
          <Route path="materias/:id" element={<MateriaDetalle />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route
            path="*"
            element={
              <div className="vacio">
                <h1>Pagina no encontrada</h1>
                <a href="/">Volver al inicio</a>
              </div>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
