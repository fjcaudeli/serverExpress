# Apunte de estudio - TP Integrador API RESTful

Este apunte corresponde a la version final del proyecto `serverExpress`.

La idea es que te sirva para estudiar y para explicar el proyecto si el profesor te pregunta:

- que hace cada endpoint;
- como estan separados los archivos;
- como funciona la autenticacion;
- que permisos tiene cada rol;
- como funcionan los middlewares;
- como se aplica auditoria y baja logica;
- como se usa MySQL desde Node.

## 1. Objetivo del proyecto

El trabajo practico pide desarrollar una API RESTful con Node.js y Express para gestionar:

- Usuarios.
- Alumnos.
- Materias.
- Inscripciones.

Tambien pide:

- control de acceso por roles;
- contrasenas encriptadas;
- JWT para login;
- base de datos MySQL;
- organizacion en capas;
- auditoria completa;
- baja logica.

En esta implementacion, los alumnos son usuarios con rol `Alumno`.

## 2. Tecnologias usadas

En `package.json` se usan estas dependencias:

```json
"dependencies": {
  "bcrypt": "^6.0.0",
  "dotenv": "^17.4.2",
  "express": "^4.22.1",
  "joi": "^18.2.1",
  "jsonwebtoken": "^9.0.3",
  "mysql2": "^3.22.3"
}
```

Explicacion simple:

- `express`: crea el servidor HTTP y define rutas.
- `mysql2`: permite consultar MySQL desde Node.
- `dotenv`: carga variables desde `.env`.
- `bcrypt`: hashea contrasenas y compara passwords.
- `jsonwebtoken`: genera y verifica tokens JWT.
- `joi`: valida datos de entrada.

## 3. Estructura del proyecto

```text
src/
  config/
    database.js
  controllers/
    alumno.controller.js
    auth.controller.js
    inscripcion.controller.js
    materia.controller.js
  db/
    connection.js
    schema.sql
    seed.js
  middlewares/
    authHandler.js
    errorHandler.js
    validatorHandler.js
  routes/
    alumno.router.js
    auth.router.js
    inscripcion.router.js
    materia.router.js
  schemas/
    alumno.schema.js
    auth.schema.js
    inscripcion.schema.js
    materia.schema.js
  services/
    alumno.service.js
    auth.service.js
    inscripcion.service.js
    materia.service.js
  utils/
    httpError.js
  index.js
```

Responsabilidad de cada carpeta:

- `routes`: define endpoints, metodos HTTP y middlewares.
- `controllers`: recibe `req`, llama al service y responde con `res`.
- `services`: contiene la logica y las consultas SQL.
- `schemas`: define validaciones con Joi.
- `middlewares`: autenticacion, autorizacion, validacion y errores.
- `db`: conexion, schema y seed.
- `config`: configuracion de DB.
- `utils`: helpers, por ejemplo crear errores HTTP.

## 4. Flujo general de una request

Ejemplo: crear alumno.

```text
POST /alumnos
  -> index.js
  -> alumno.router.js
  -> autenticar
  -> autorizarRoles('Administrador')
  -> validator(crearAlumnoSchema, 'body')
  -> alumno.controller.js
  -> alumno.service.js
  -> MySQL
  -> respuesta JSON
```

Idea para explicar:

> La ruta decide que middlewares se ejecutan. El controller coordina la request y response. El service hace la logica de negocio y consulta la base.

## 5. Archivo principal: `src/index.js`

Este archivo arranca la API.

Hace:

```js
app.use(express.json())
app.use('/', authRouter)
app.use('/alumnos', alumnoRouter)
app.use('/materias', materiaRouter)
app.use('/inscripciones', inscripcionRouter)
```

Explicacion:

- `express.json()` permite leer JSON del body.
- `/login` se monta desde `authRouter`.
- `/alumnos` se maneja en `alumno.router.js`.
- `/materias` se maneja en `materia.router.js`.
- `/inscripciones` se maneja en `inscripcion.router.js`.

Tambien al iniciar prueba la conexion:

```js
await testConnection()
```

## 6. Base de datos

El schema esta en:

```text
src/db/schema.sql
```

Tablas principales:

```text
roles
usuarios
carreras
materias
inscripciones
```

### Roles

La tabla `roles` tiene:

- `Administrador`
- `Coordinador`
- `Alumno`

### Usuarios

La tabla `usuarios` guarda:

- `id`
- `nombre`
- `mail`
- `usuario`
- `password`
- `rol_id`
- campos de auditoria

Los alumnos son registros de `usuarios` cuyo rol es `Alumno`.

### Carreras

La tabla `carreras` guarda las carreras disponibles.

### Materias

La tabla `materias` tiene:

- `id`
- `nombre`
- `carrera_id`
- auditoria

### Inscripciones

La tabla `inscripciones` relaciona:

- `alumno_id`
- `materia_id`

Tambien tiene auditoria y baja logica.

## 7. Auditoria

Todas las entidades principales tienen campos como:

```text
fecha_alta
usuario_alta_id
fecha_modificacion
usuario_modificacion_id
fecha_baja
usuario_baja_id
```

Sirven para saber:

- cuando se creo un registro;
- quien lo creo;
- cuando se modifico;
- quien lo modifico;
- cuando se dio de baja;
- quien lo dio de baja.

Ejemplo en `alumno.service.js` al crear:

```sql
INSERT INTO usuarios(nombre, mail, usuario, password, rol_id, usuario_alta_id)
VALUES(?, ?, ?, ?, ?, ?)
```

El `usuario_alta_id` sale del usuario autenticado:

```js
req.user.id
```

## 8. Baja logica

La consigna pide no eliminar fisicamente.

Entonces no se hace:

```sql
DELETE FROM usuarios
```

Se hace:

```sql
UPDATE usuarios
SET fecha_baja = NOW(),
    usuario_baja_id = ?
WHERE id = ?
```

Una entidad esta activa cuando:

```sql
fecha_baja IS NULL
```

Ejemplo en alumnos:

```js
async baja(id, usuarioBajaId) {
    await this.obtenerPorId(id)

    const sql = `
        UPDATE usuarios
        SET fecha_baja = NOW(),
            usuario_baja_id = ?
        WHERE id = ?
            AND fecha_baja IS NULL
    `
}
```

Explicacion para decir:

> La baja logica conserva el historial. Marco fecha y usuario de baja, y despues los listados normales filtran solo registros activos.

## 9. Login y JWT

Endpoint:

```text
POST /login
```

Body:

```json
{
  "usuario": "admin",
  "password": "admin123"
}
```

El login esta en:

```text
auth.router.js
auth.controller.js
auth.service.js
```

Flujo:

1. La request entra por `auth.router.js`.
2. Se valida con `loginSchema`.
3. El controller llama a `AuthService.login`.
4. El service busca el usuario en DB.
5. Compara password con bcrypt.
6. Si es correcto, genera JWT.
7. Devuelve token y datos del usuario.

Payload del token:

```js
{
  id: usuario.id,
  nombre: usuario.nombre,
  mail: usuario.mail,
  usuario: usuario.usuario,
  rol: usuario.rol
}
```

El token se usa asi:

```http
Authorization: Bearer TOKEN
```

## 10. bcrypt

`bcrypt` se usa para no guardar contrasenas en texto plano.

Cuando se crea un alumno:

```js
const passwordHash = await bcrypt.hash(alumno.password, SALT_ROUNDS)
```

Eso guarda un hash, no la password real.

Cuando se hace login:

```js
const passwordValido = await bcrypt.compare(credenciales.password, usuario.password)
```

Explicacion simple:

> bcrypt no desencripta contrasenas. Compara la contrasena enviada contra el hash guardado. Asi, si alguien ve la base, no ve las passwords reales.

## 11. Permisos por rol

### Administrador

Puede hacer todo lo implementado:

- listar alumnos;
- ver cualquier alumno;
- crear alumnos;
- editar cualquier alumno;
- dar de baja alumnos;
- listar/ver materias;
- crear, editar y dar de baja materias;
- inscribir cualquier alumno;
- ver materias de cualquier alumno;
- ver alumnos de cualquier materia;
- dar de baja cualquier inscripcion.

### Coordinador

Permisos de consulta:

- listar alumnos;
- ver cualquier alumno;
- ver materias de cualquier alumno;
- listar/ver materias;
- ver alumnos de una materia.

No puede:

- crear, editar o dar de baja alumnos;
- crear, editar o dar de baja materias;
- crear o dar de baja inscripciones.

### Alumno

Puede operar sobre si mismo:

- ver sus propios datos;
- editar sus propios datos;
- ver sus propias materias;
- listar/ver materias;
- inscribirse a una materia;
- dar de baja su propia inscripcion.

No puede:

- listar todos los alumnos;
- ver otros alumnos;
- crear alumnos;
- dar de baja alumnos;
- crear, editar o dar de baja materias;
- ver alumnos de una materia;
- inscribir a otro alumno.

## 12. Middlewares

Un middleware es una funcion que se ejecuta en el medio del flujo de Express.

Forma general:

```js
function middleware(req, res, next) {
    // hace algo
    next()
}
```

Puede:

- dejar pasar con `next()`;
- cortar con un error;
- agregar datos a `req`;
- validar permisos;
- validar datos.

## 13. `authHandler.js`

Archivo:

```text
src/middlewares/authHandler.js
```

Tiene estas funciones:

```js
autenticar
autorizarRoles
permitirAdminCoordinadorOMismoAlumno
permitirAdminOMismoAlumno
```

### `autenticar`

Verifica que exista un token JWT valido.

Busca:

```http
Authorization: Bearer TOKEN
```

Si el token es valido:

```js
req.user = jwt.verify(token, ...)
```

Entonces deja disponible el usuario autenticado para los siguientes middlewares/controllers.

Si no hay token o es invalido:

- devuelve error `401`.

### `autorizarRoles(...rolesPermitidos)`

Verifica si el rol del usuario esta permitido.

Ejemplo:

```js
autorizarRoles('Administrador', 'Coordinador')
```

Esto significa:

> Solo pasan usuarios con rol Administrador o Coordinador.

Si el usuario tiene otro rol:

- devuelve error `403`.

### `permitirAdminCoordinadorOMismoAlumno`

Permite:

- Administrador;
- Coordinador;
- Alumno si el `id` de la URL coincide con su propio id.

Se usa en:

```text
GET /alumnos/:id
GET /alumnos/:id/materias
```

Ejemplo:

- Alumno id `3` puede pedir `/alumnos/3`.
- Alumno id `3` no puede pedir `/alumnos/8`.

### `permitirAdminOMismoAlumno`

Permite:

- Administrador;
- Alumno si el `id` de la URL coincide con su propio id.

Se usa en:

```text
PUT /alumnos/:id
```

Entonces:

- admin puede editar cualquier alumno;
- alumno solo puede editarse a si mismo.

Resumen:

```text
autenticar
  verifica token y carga req.user

autorizarRoles
  restringe por rol

permitirAdminCoordinadorOMismoAlumno
  admin, coordinador o alumno dueño del recurso

permitirAdminOMismoAlumno
  admin o alumno dueño del recurso
```

## 14. Middleware de validacion

Archivo:

```text
src/middlewares/validatorHandler.js
```

Funcion:

```js
function validator(schema, property) {
    return (req, res, next) => {
        const data = req[property]
        const result = schema.validate(data)
        ...
    }
}
```

Se usa asi:

```js
validator(crearAlumnoSchema, 'body')
```

o:

```js
validator(idParamSchema, 'params')
```

Explicacion:

> El middleware recibe un schema Joi y decide que parte de la request validar: body, params o query.

## 15. Que es Joi?

Joi es una libreria para validar datos de entrada.

Sirve para definir reglas.

Ejemplo en `alumno.schema.js`:

```js
const crearAlumnoSchema = joi.object({
    nombre: nombre.required(),
    mail: mail.required(),
    usuario: usuario.required(),
    password: password.required()
})
```

Eso significa:

- `nombre` es obligatorio;
- `mail` es obligatorio y debe tener formato email;
- `usuario` es obligatorio;
- `password` es obligatorio.

Ejemplo en una ruta:

```js
router.post('/',
    autenticar,
    autorizarRoles('Administrador'),
    validator(crearAlumnoSchema, 'body'),
    postAlumno
)
```

Explicacion:

> Joi evita que lleguen datos incompletos o con formato incorrecto al controller y al service.

## 16. Middlewares de error

Archivo:

```text
src/middlewares/errorHandler.js
```

Tiene:

```js
errorLog
errorHandler
```

`errorLog` imprime el error.

`errorHandler` responde al cliente:

```js
res.status(statusCode).send({
    message: err.message
})
```

En `index.js` estan al final:

```js
app.use(errorLog)
app.use(errorHandler)
```

Por que al final:

> Porque si una ruta llama `next(error)`, Express salta hasta los middlewares de error.

## 17. Endpoints principales

### Auth

```text
POST /login
```

Devuelve JWT.

### Alumnos

```text
GET /alumnos
GET /alumnos?todos=true
GET /alumnos/:id
POST /alumnos
PUT /alumnos/:id
DELETE /alumnos/:id
GET /alumnos/:id/materias
```

### Materias

```text
GET /materias
GET /materias?todos=true
GET /materias/:id
POST /materias
PUT /materias/:id
DELETE /materias/:id
GET /materias/:id/alumnos
```

### Inscripciones

```text
POST /inscripciones
DELETE /inscripciones
```

## 18. Alumnos

Los alumnos se guardan en `usuarios` con rol `Alumno`.

### Listar alumnos

Ruta:

```text
GET /alumnos
```

Permisos:

- Administrador.
- Coordinador.

Por defecto lista activos.

Para incluir bajas:

```text
GET /alumnos?todos=true
```

### Ver alumno

Ruta:

```text
GET /alumnos/:id
```

Permisos:

- admin;
- coordinador;
- el mismo alumno.

### Crear alumno

Ruta:

```text
POST /alumnos
```

Permisos:

- solo administrador.

Body:

```json
{
  "nombre": "Alumno Demo",
  "mail": "alumno@tp.com",
  "usuario": "alumno_demo",
  "password": "alumno123"
}
```

### Editar alumno

Ruta:

```text
PUT /alumnos/:id
```

Permisos:

- administrador;
- el mismo alumno.

### Baja alumno

Ruta:

```text
DELETE /alumnos/:id
```

Permisos:

- solo administrador.

Hace baja logica.

## 19. Materias

### Listar materias

Ruta:

```text
GET /materias
```

Requiere login.

### Ver materia

Ruta:

```text
GET /materias/:id
```

Requiere login.

### Crear materia

Ruta:

```text
POST /materias
```

Permisos:

- solo administrador.

Body:

```json
{
  "nombre": "Programacion II",
  "carreraId": 1
}
```

### Editar materia

Ruta:

```text
PUT /materias/:id
```

Permisos:

- solo administrador.

### Baja materia

Ruta:

```text
DELETE /materias/:id
```

Permisos:

- solo administrador.

### Alumnos de una materia

Ruta:

```text
GET /materias/:id/alumnos
```

Permisos:

- administrador;
- coordinador.

## 20. Inscripciones

### Crear inscripcion

Ruta:

```text
POST /inscripciones
```

Permisos:

- administrador;
- alumno.

Si es administrador, puede enviar:

```json
{
  "alumnoId": 3,
  "materiaId": 1
}
```

Si es alumno, puede enviar solo:

```json
{
  "materiaId": 1
}
```

En ese caso se usa el id del token.

### Dar de baja una inscripcion

Ruta:

```text
DELETE /inscripciones
```

Permisos:

- administrador;
- el alumno dueño de la inscripcion.

Puede darse de baja por id:

```json
{
  "id": 1
}
```

O por alumno y materia:

```json
{
  "alumnoId": 3,
  "materiaId": 1
}
```

## 21. Async y await

Muchas operaciones tardan:

- consultar MySQL;
- hashear password con bcrypt;
- comparar password;
- firmar o verificar datos.

Por eso el proyecto usa funciones asincronicas.

Ejemplo en un controller:

```js
async function getAlumnos(req, res, next) {
    try {
        const incluirBajas = req.query.todos === 'true'
        const alumnos = await serviceAlumno.listar(incluirBajas)
        res.json(alumnos)
    } catch (error) {
        next(error)
    }
}
```

`async` permite usar `await`.

`await` espera el resultado de una promesa.

Ejemplo en un service:

```js
const [rows] = await pool.query(sql)
return rows
```

Explicacion:

> Uso `async/await` porque las consultas a MySQL no son instantaneas. `await` espera el resultado sin bloquear todo el servidor.

## 22. Services y SQL

Los services son los archivos que hablan con MySQL.

### `auth.service.js`

- Busca usuario por nombre de usuario.
- Verifica que no este dado de baja.
- Compara password con bcrypt.
- Genera JWT.

### `alumno.service.js`

- Lista alumnos.
- Obtiene alumno por id.
- Crea alumno.
- Edita alumno.
- Baja logica de alumno.

### `materia.service.js`

- Lista materias.
- Obtiene materia por id.
- Crea materia.
- Edita materia.
- Baja logica de materia.
- Valida carrera activa.

### `inscripcion.service.js`

- Crea inscripcion.
- Lista materias de un alumno.
- Lista alumnos de una materia.
- Baja logica de inscripcion.
- Valida alumno activo.
- Valida materia activa.
- Evita inscripcion duplicada.

## 23. Ejemplo de explicacion completa

Si te piden explicar `POST /inscripciones`:

> La ruta primero autentica el token y valida que el rol sea Administrador o Alumno. Despues valida el body con Joi. En el controller, si el usuario autenticado es Alumno, se fuerza `alumnoId` al id del token, asi un alumno no puede inscribir a otro. Luego el service valida que el alumno exista y este activo, que la materia exista y este activa, y que no haya una inscripcion duplicada. Finalmente inserta la inscripcion con `usuario_alta_id` para auditoria.

## 24. Postman

Hay dos collections:

```text
postman/TP_Integrador.postman_collection.json
postman/TP_Integrador_simple.postman_collection.json
```

Orden recomendado para demo:

1. Login Admin.
2. Login Coordinador.
3. Login Alumno.
4. Listar alumnos.
5. Crear alumno.
6. Editar alumno.
7. Listar materias.
8. Crear materia.
9. Inscribir alumno.
10. Ver materias del alumno.
11. Ver alumnos de una materia.
12. Baja inscripcion.
13. Baja alumno o materia.

Usuarios de prueba:

```text
admin / admin123
coordinador / coord123
alumno / alumno123
```

## 25. Como levantar el proyecto

Si la base ya esta creada:

```powershell
npm start
```

Si hay que preparar desde cero:

```powershell
npm install
```

Ejecutar el SQL:

```text
src/db/schema.sql
```

Crear usuarios de prueba:

```powershell
npm run db:seed
```

Levantar server:

```powershell
npm start
```

## 26. Preguntas tipicas y respuestas cortas

### Que es una API REST?

Una API que expone recursos mediante URLs y metodos HTTP como GET, POST, PUT y DELETE.

### Que es un middleware?

Una funcion intermedia que se ejecuta antes del controller. Puede autenticar, autorizar, validar o manejar errores.

### Por que uso JWT?

Para que el usuario haga login una vez y luego envie un token en cada request protegida.

### Por que uso bcrypt?

Para guardar contrasenas hasheadas, no texto plano.

### Que es baja logica?

No borrar el registro. Se completa `fecha_baja` y `usuario_baja_id`.

### Como se sabe si algo esta activo?

Si `fecha_baja IS NULL`.

### Donde esta la logica de permisos?

En `authHandler.js` y en algunas validaciones de services, por ejemplo al dar de baja una inscripcion.

### Donde estan las consultas SQL?

En los services.

### Donde estan las validaciones de entrada?

En `schemas/` con Joi y en `validatorHandler.js`.

### Donde se crea la estructura de la DB?

En `src/db/schema.sql`.

### Donde se crean usuarios demo?

En `src/db/seed.js`.

## 27. Resumen mental rapido

```text
Request
  -> Route
  -> Middlewares
      autenticar
      autorizarRoles
      validator
  -> Controller
  -> Service
  -> MySQL
  -> Response
```

Autenticacion:

```text
POST /login
  -> bcrypt.compare
  -> jwt.sign
  -> token
```

Ruta protegida:

```text
Authorization: Bearer TOKEN
  -> autenticar
  -> req.user
  -> autorizarRoles
```

Baja logica:

```text
DELETE
  -> UPDATE fecha_baja, usuario_baja_id
  -> filtros con fecha_baja IS NULL
```
