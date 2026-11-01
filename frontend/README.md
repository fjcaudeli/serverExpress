# Frontend del TP Integrador

React para la API de alumnos, materias e inscripciones. El ejemplo de la materia
`app-react-estado-global` se conserva sin cambios. No se modifico el backend.

## Ejecutar

MySQL debe estar iniciado y la API debe tener configurado su `.env` habitual.
No hace falta reconstruir la base ni volver a ejecutar el seed si ya tiene datos.

Terminal 1, desde `ServerExpress`, para ejecutar el backend en Docker:

```powershell
docker compose up -d --build
docker compose logs --tail 20 api
```

Requiere Docker Desktop operativo. MySQL sigue en Windows, con la base existente.
Ver [`DOCKER_DEMO.md`](../DOCKER_DEMO.md) para la configuracion y la demostracion
del contenedor. Como alternativa se puede usar `npm start` en la raiz para Node
directo, pero no ejecutar ambos sobre el puerto 3000.

Terminal 2, desde `ServerExpress/frontend`:

```powershell
npm install
npm run dev
```

Abrir la direccion que informa Vite (normalmente http://127.0.0.1:5173).
Si el puerto esta ocupado, Vite usa el siguiente disponible.

Vite reenvia `/api` a `http://127.0.0.1:3000`. Si Express usa otro puerto,
crear `frontend/.env` tomando como referencia `.env.example` y reiniciar Vite.
`API_URL` es solo la direccion del backend, nunca un secreto.

Usuarios del seed original, si no fueron modificados:

| Rol           | Usuario     | Contrasena de demostracion |
| ------------- | ----------- | -------------------------- |
| Administrador | admin       | admin123                   |
| Coordinador   | coordinador | coord123                   |
| Alumno        | alumno      | alumno123                  |

Son cuentas de prueba locales, no credenciales para publicar una aplicacion.

## Lo aplicado de la clase

| Tema del ejemplo                             | Aplicacion en este front                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Componentes y props, como `Boton` y `Saludo` | `Boton`, `Mensaje`, `Estado`, formularios y auditoria                                 |
| `useState`                                   | Formularios controlados, busquedas, errores, carga y modales                          |
| `useEffect` y desmontaje                     | Consultas al entrar o cambiar filtros; se ignoran respuestas de pantallas desmontadas |
| `BrowserRouter`, `Routes`, `Route`           | Login y pantallas dentro de `App.jsx`                                                 |
| `Link` y `NavLink`                           | Navegacion sin recargar y seccion activa en `Navbar`                                  |
| `useParams`, como `/contador/:valor`         | ID de alumno o materia en las pantallas de detalle                                    |
| `useNavigate`                                | Ir a la pantalla correspondiente despues del login                                    |
| Zustand, como `useContadorStore`             | `useAuthStore` comparte token, usuario y cierre de sesion                             |
| Fetch                                        | Comprobar la disponibilidad HTTP de Express desde el login                            |
| Axios, async/await y try/catch               | Login y todas las operaciones sobre la API                                            |
| `map` y `filter`                             | Filas, opciones, busqueda y quitar de la vista una inscripcion dada de baja           |
| Renderizado condicional                      | Acciones por rol, modales, carga, errores y listas vacias                             |
| Tailwind                                     | Importado con el plugin de Vite; utilidades de espaciado junto con CSS comun          |

La unica biblioteca de presentacion adicional es `lucide-react`, para iconos.
No hay Redux, TypeScript, servidor nuevo ni base de datos adicional.

## Flujo y archivos

1. `main.jsx` monta React y `BrowserRouter`.
2. `paginas/Login.jsx` envia usuario y contrasena a `POST /login`.
3. `store/useAuthStore.js` guarda la respuesta en memoria.
4. `services/api.js` agrega `Authorization: Bearer ...` a cada peticion Axios.
5. `App.jsx` permite entrar a las rutas privadas y `Navbar` muestra el menu.
6. Cada pagina consulta la API en `useEffect`, guarda resultados con `useState`
   y los representa con `map`. Los formularios envian POST o PUT.
7. Las bajas siguen usando HTTP DELETE, pero la API hace baja logica en MySQL.

`Components/` contiene las piezas reutilizadas; `paginas/` las seis pantallas;
`index.css` la apariencia responsive; `utils.js` funciones pequenas sin React;
`tests/` las pruebas basicas. `vite.config.js` configura el proxy local.

La sesion NO se guarda en localStorage: recargar la pagina cierra la sesion.
Un 401 en una peticion privada tambien cierra la sesion y vuelve al login.
Un 403 muestra el error sin cerrar la sesion.
La disponibilidad indicada en login comprueba HTTP, no garantiza acceso a MySQL.

## Alcance y permisos

- Administrador: alta, consulta, edicion y baja de alumnos y materias;
  consulta y gestion de inscripciones de alumnos activos.
- Coordinador: consulta de alumnos, materias y ambas relaciones; puede incluir
  bajas, pero no tiene botones de creacion, edicion o baja.
- Alumno: consulta y edicion de sus datos; consulta de materias activas;
  inscripcion propia y baja de sus inscripciones. Nunca elige otro alumno.

Ocultar un boton NO es seguridad: Express sigue validando token, rol y propiedad.
Las fechas y usuarios de auditoria se consultan en el detalle del registro.
No se implemento restauracion porque la API no la ofrece.

No existe `GET /carreras`: el formulario de materia pide el ID de una carrera
existente y sugiere las que aparecen en las materias recibidas. No se inventa
un catalogo ni se agregan endpoints. La API valida que la carrera exista y este activa.

La API tampoco ofrece un listado global de inscripciones: se consultan por
alumno, y los alumnos de una materia se ven desde el detalle de esa materia.

## Probar frente al profesor

1. Entrar como administrador. Buscar un alumno y abrir su detalle y auditoria.
2. Crear un alumno de prueba, editarlo y comprobar los cambios.
3. Crear una materia con un ID de carrera existente y editarla.
4. En Inscripciones seleccionar al alumno, inscribirlo y comprobar la relacion
   tanto en su ficha como en el detalle de la materia.
5. Dar de baja la inscripcion. Dar de baja alumno y materia de prueba;
   activar `Incluir bajas` y comprobar que los registros siguen existiendo.
6. Cerrar sesion y entrar como coordinador: no aparecen acciones de escritura.
7. Entrar como alumno: solo aparece su perfil y no hay selector de otro alumno.
   Inscribirse a una materia disponible y dar de baja esa inscripcion.
8. Probar credenciales incorrectas, busqueda sin resultados, Escape para cerrar
   formularios y la interfaz en una ventana angosta.

## Verificaciones

```powershell
npm test
npm run build
npm run preview
```

`npm test` usa el runner incluido en Node, sin dependencias de pruebas adicionales.
No toca la base de datos. `build` genera `dist/`; `preview` permite probarlo
localmente con el mismo proxy. Ese proxy pertenece a Vite: un despliegue real
requeriria configurar el servidor que publique el front, fuera de este alcance.

La prueba de integracion es optativa: con Express, MySQL y Vite iniciados,
ejecutar en PowerShell:

```powershell
$env:TEST_API_URL = 'http://127.0.0.1:5173/api'
npm test
Remove-Item Env:TEST_API_URL
```

Usa admin y coordinador del seed original; crea dos alumnos, una materia y sus
inscripciones, todos identificados como `Prueba Front`. Al terminar los da de
baja logicamente, sin modificar registros anteriores. Se pueden ver con
`Incluir bajas`. Verifica tambien 401, 403, duplicados y campos de auditoria.

Foto de biblioteca: Unsplash, guardada en `public/biblioteca.jpg`.
Fuente: https://images.unsplash.com/photo-1507842217343-583bb7270b66
