# TP Integrador - API RESTful

API hecha con Node.js, Express y MySQL para gestionar alumnos, materias e inscripciones.

## Frontend React

El front esta en [`frontend/`](frontend/README.md). En una segunda terminal,
desde esa carpeta, ejecutar `npm install` y `npm run dev`. Requiere esta API
funcionando en el puerto 3000 y MySQL iniciado. El README del front explica los
temas de clase aplicados, los permisos y el recorrido de demostracion.

## Instalacion

### Alternativa: backend en Docker

La configuracion del contenedor esta en `Dockerfile` y `compose.yaml`.
Con Docker Desktop operativo y MySQL iniciado, el backend se arranca desde
esta carpeta con `docker compose up -d --build`, en lugar de `npm start`.
No ejecutar ambos sobre el puerto 3000. MySQL sigue en Windows y el front
no cambia. Ver requisitos, verificaciones y guion en
[`DOCKER_DEMO.md`](DOCKER_DEMO.md).

### Ejecucion directa con Node

1. Instalar dependencias:

```bash
npm install
```

2. Crear un archivo `.env` tomando como base `.env.example`.

3. Crear la base de datos ejecutando el script:

```sql
src/db/schema.sql
```

4. Crear usuarios de prueba:

```bash
npm run db:seed
```

5. Levantar el servidor:

```bash
npm start
```

## Usuarios de prueba

| Rol | Usuario | Password |
| --- | --- | --- |
| Administrador | admin | admin123 |
| Coordinador | coordinador | coord123 |
| Alumno | alumno | alumno123 |

## Autenticacion

Login:

```http
POST /login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "admin123"
}
```

Las rutas protegidas usan el token JWT en el header:

```http
Authorization: Bearer TOKEN
```

## Rutas principales

### Alumnos

- `GET /alumnos` - Lista alumnos activos. Admin y coordinador.
- `GET /alumnos?todos=true` - Lista activos y dados de baja. Admin y coordinador.
- `GET /alumnos/:id` - Admin, coordinador o el mismo alumno.
- `POST /alumnos` - Crea alumno. Solo administrador.
- `PUT /alumnos/:id` - Edita alumno. Administrador o el mismo alumno.
- `DELETE /alumnos/:id` - Baja logica. Solo administrador.
- `GET /alumnos/:id/materias` - Materias de un alumno. Admin, coordinador o el mismo alumno.

### Materias

- `GET /materias` - Lista materias activas.
- `GET /materias/:id` - Detalle de materia.
- `POST /materias` - Crea materia. Solo administrador.
- `PUT /materias/:id` - Edita materia. Solo administrador.
- `DELETE /materias/:id` - Baja logica. Solo administrador.
- `GET /materias/:id/alumnos` - Alumnos inscriptos. Admin o coordinador.

### Inscripciones

- `POST /inscripciones` - Inscribe un alumno en una materia. Alumno autenticado o administrador.
- `DELETE /inscripciones` - Baja logica de inscripcion. Alumno inscripto o administrador.

Ejemplo de alta:

```json
{
  "alumnoId": 3,
  "materiaId": 1
}
```

Si el usuario autenticado tiene rol `Alumno`, no hace falta enviar `alumnoId`: se usa el id del token.

Ejemplo de baja por id:

```json
{
  "id": 1
}
```

Ejemplo de baja por alumno y materia:

```json
{
  "alumnoId": 3,
  "materiaId": 1
}
```

## Auditoria y baja logica

Todas las tablas principales tienen:

- `fecha_alta`, `usuario_alta_id`
- `fecha_modificacion`, `usuario_modificacion_id`
- `fecha_baja`, `usuario_baja_id`

No se eliminan registros fisicamente. Una entidad esta activa cuando `fecha_baja IS NULL`.
