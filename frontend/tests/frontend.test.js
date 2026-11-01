import test from 'node:test'
import assert from 'node:assert/strict'
import { coincideBusqueda, datosAlumno, fecha } from '../src/utils.js'
import useAuthStore from '../src/store/useAuthStore.js'
import api, { mensajeError } from '../src/services/api.js'

test('la busqueda ignora mayusculas y espacios externos', () => {
  assert.equal(coincideBusqueda('Alumno Demo alumno@tp.com', '  DEMO '), true)
  assert.equal(coincideBusqueda('Alumno Demo', 'otro'), false)
  assert.equal(coincideBusqueda('Alumno Demo', ''), true)
})

test('editar un alumno no envia una contrasena vacia', () => {
  assert.deepEqual(
    datosAlumno({
      nombre: ' Ana ',
      mail: ' ana@tp.com ',
      usuario: ' ana ',
      password: '',
    }),
    {
      nombre: 'Ana',
      mail: 'ana@tp.com',
      usuario: 'ana',
    },
  )
})

test('crear un alumno conserva la contrasena sin recortarla', () => {
  assert.equal(
    datosAlumno({
      nombre: 'Ana',
      mail: 'ana@tp.com',
      usuario: 'ana',
      password: ' clave123 ',
    }).password,
    ' clave123 ',
  )
})

test('fechas nulas de auditoria se muestran sin inventar una fecha', () => {
  assert.equal(fecha(null), '-')
  assert.equal(fecha(undefined), '-')
  assert.ok(fecha('2026-10-30T10:00:00.000Z').includes('2026'))
})

test('Zustand reemplaza la sesion anterior y limpia token y usuario al salir', () => {
  const store = useAuthStore.getState
  store().iniciarSesion({
    token: 'token-admin-prueba',
    usuario: { id: 1, rol: 'Administrador' },
  })
  store().iniciarSesion({
    token: 'token-alumno-prueba',
    usuario: { id: 3, rol: 'Alumno' },
  })
  assert.equal(store().token, 'token-alumno-prueba')
  assert.equal(store().usuario.rol, 'Alumno')
  store().cerrarSesion('Sesion vencida')
  assert.equal(store().token, null)
  assert.equal(store().usuario, null)
  assert.equal(store().aviso, 'Sesion vencida')
  store().cerrarSesion()
})

test('Axios adjunta siempre el token de la sesion actual', async () => {
  const store = useAuthStore.getState
  const tokens = []
  const adapter = async (config) => {
    tokens.push(config.headers.Authorization)
    return { status: 200, data: [], headers: {}, config }
  }
  store().iniciarSesion({
    token: 'prueba-admin',
    usuario: { rol: 'Administrador' },
  })
  await api.get('/alumnos', { adapter })
  store().iniciarSesion({ token: 'prueba-alumno', usuario: { rol: 'Alumno' } })
  await api.get('/materias', { adapter })
  assert.deepEqual(tokens, ['Bearer prueba-admin', 'Bearer prueba-alumno'])
  store().cerrarSesion()
})

test('un 403 conserva la sesion; un 401 privado la cierra', async () => {
  const store = useAuthStore.getState
  store().iniciarSesion({ token: 'prueba', usuario: { rol: 'Alumno' } })
  const adapterConError = (status) => async (config) => {
    throw { config, response: { status, data: { message: 'Error de prueba' } } }
  }
  await assert.rejects(api.get('/alumnos', { adapter: adapterConError(403) }))
  assert.equal(store().token, 'prueba')
  await assert.rejects(api.get('/materias', { adapter: adapterConError(401) }))
  assert.equal(store().token, null)
  assert.ok(store().aviso.includes('vencio'))
  store().cerrarSesion()
})

test('los errores muestran el mensaje de Express o un aviso de conexion', () => {
  assert.equal(
    mensajeError({ response: { data: { message: 'No tiene permisos' } } }),
    'No tiene permisos',
  )
  assert.ok(mensajeError({}).includes('conectar'))
})
