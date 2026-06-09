# TP Integrador - API RESTful

Proyecto local para avanzar a la par de las clases, adaptando el ServerExpress del profesor al dominio del TP integrador.

## Tecnologias

- Node.js
- Express
- MySQL2
- Joi
- dotenv
- bcrypt
- jsonwebtoken

## Rutas disponibles

### Materias

- `GET /materias`
- `GET /materias/carrera/:carrera`
- `POST /materias`

### Carreras

- `GET /carreras`
- `POST /carreras`
- `PUT /carreras`
- `DELETE /carreras/:id`

### Usuarios

- `POST /usuarios`
- `POST /usuarios/login`

## Configuracion del entorno

Crear un archivo `.env` en la raiz del proyecto:

```env
PUERTO=3000

DB_HOST="localhost"
DB_PORT=3306
DB_DATABASE="tp_integrador"
DB_USER='xxxx'
DB_PASSWORD='xxxx'

JWT_SECRET='xxxx'
```

## Scripts SQL vistos en clase

### Crear tabla de usuarios

```sql
CREATE TABLE usuarios (
    usu_id INT AUTO_INCREMENT,
    usu_usuario VARCHAR(30) NOT NULL,
    usu_nombre VARCHAR(100) NOT NULL,
    usu_password VARCHAR(255) NOT NULL,
    usu_esadmin BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (usu_id)
);
```

### Agregar campos de auditoria a `materia`

```sql
ALTER TABLE materia
    ADD COLUMN mat_usualta INT,
    ADD COLUMN mat_fechaalta DATETIME,
    ADD COLUMN mat_usumodif INT,
    ADD COLUMN mat_fechamodif DATETIME,
    ADD COLUMN mat_usubaja INT,
    ADD COLUMN mat_fechabaja DATETIME,
    ADD CONSTRAINT fk_materia_usualta FOREIGN KEY (mat_usualta) REFERENCES usuarios(usu_id),
    ADD CONSTRAINT fk_materia_usumodif FOREIGN KEY (mat_usumodif) REFERENCES usuarios(usu_id),
    ADD CONSTRAINT fk_materia_usubaja FOREIGN KEY (mat_usubaja) REFERENCES usuarios(usu_id);
```

### Agregar campos de auditoria a `carrera`

```sql
ALTER TABLE carrera
    ADD COLUMN car_usualta INT,
    ADD COLUMN car_fechaalta DATETIME,
    ADD COLUMN car_usumodif INT,
    ADD COLUMN car_fechamodif DATETIME,
    ADD COLUMN car_usubaja INT,
    ADD COLUMN car_fechabaja DATETIME,
    ADD CONSTRAINT fk_carrera_usualta FOREIGN KEY (car_usualta) REFERENCES usuarios(usu_id),
    ADD CONSTRAINT fk_carrera_usumodif FOREIGN KEY (car_usumodif) REFERENCES usuarios(usu_id),
    ADD CONSTRAINT fk_carrera_usubaja FOREIGN KEY (car_usubaja) REFERENCES usuarios(usu_id);
```

## Cambios de la clase del 26/05 adaptados al TP

- `carreras` ahora consulta la base de datos.
- `POST /carreras` registra usuario y fecha de alta.
- `PUT /carreras` registra usuario y fecha de modificacion.
- `DELETE /carreras/:id` hace baja logica con usuario y fecha de baja.
- `POST /materias` registra usuario y fecha de alta.

## Pendiente para proximas iteraciones

- Alumnos
- Inscripciones
- Validaciones Joi para usuarios y login
