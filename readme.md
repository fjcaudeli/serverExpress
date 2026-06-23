# TP Integrador - API RESTful

API hecha con Node.js, Express y MySQL para gestionar alumnos, materias e inscripciones.

## Instalacion

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
