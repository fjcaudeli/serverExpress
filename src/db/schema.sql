CREATE DATABASE IF NOT EXISTS tp_integrador;
USE tp_integrador;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_alta_id INT NULL,
    fecha_modificacion DATETIME NULL,
    usuario_modificacion_id INT NULL,
    fecha_baja DATETIME NULL,
    usuario_baja_id INT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    mail VARCHAR(150) NOT NULL UNIQUE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_alta_id INT NULL,
    fecha_modificacion DATETIME NULL,
    usuario_modificacion_id INT NULL,
    fecha_baja DATETIME NULL,
    usuario_baja_id INT NULL,
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES roles(id),
    CONSTRAINT fk_usuarios_alta FOREIGN KEY (usuario_alta_id) REFERENCES usuarios(id),
    CONSTRAINT fk_usuarios_modificacion FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id),
    CONSTRAINT fk_usuarios_baja FOREIGN KEY (usuario_baja_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_alta_id INT NULL,
    fecha_modificacion DATETIME NULL,
    usuario_modificacion_id INT NULL,
    fecha_baja DATETIME NULL,
    usuario_baja_id INT NULL,
    CONSTRAINT fk_carreras_alta FOREIGN KEY (usuario_alta_id) REFERENCES usuarios(id),
    CONSTRAINT fk_carreras_modificacion FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id),
    CONSTRAINT fk_carreras_baja FOREIGN KEY (usuario_baja_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    carrera_id INT NOT NULL,
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_alta_id INT NULL,
    fecha_modificacion DATETIME NULL,
    usuario_modificacion_id INT NULL,
    fecha_baja DATETIME NULL,
    usuario_baja_id INT NULL,
    CONSTRAINT uq_materias_nombre_carrera UNIQUE (nombre, carrera_id),
    CONSTRAINT fk_materias_carreras FOREIGN KEY (carrera_id) REFERENCES carreras(id),
    CONSTRAINT fk_materias_alta FOREIGN KEY (usuario_alta_id) REFERENCES usuarios(id),
    CONSTRAINT fk_materias_modificacion FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id),
    CONSTRAINT fk_materias_baja FOREIGN KEY (usuario_baja_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    materia_id INT NOT NULL,
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_alta_id INT NULL,
    fecha_modificacion DATETIME NULL,
    usuario_modificacion_id INT NULL,
    fecha_baja DATETIME NULL,
    usuario_baja_id INT NULL,
    CONSTRAINT fk_inscripciones_alumnos FOREIGN KEY (alumno_id) REFERENCES usuarios(id),
    CONSTRAINT fk_inscripciones_materias FOREIGN KEY (materia_id) REFERENCES materias(id),
    CONSTRAINT fk_inscripciones_alta FOREIGN KEY (usuario_alta_id) REFERENCES usuarios(id),
    CONSTRAINT fk_inscripciones_modificacion FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id),
    CONSTRAINT fk_inscripciones_baja FOREIGN KEY (usuario_baja_id) REFERENCES usuarios(id)
);

INSERT IGNORE INTO roles(nombre) VALUES
    ('Administrador'),
    ('Coordinador'),
    ('Alumno');

INSERT IGNORE INTO carreras(nombre) VALUES
    ('Tecnicatura en Programacion'),
    ('Analista de Sistemas'),
    ('Desarrollo de Software');

INSERT IGNORE INTO materias(nombre, carrera_id)
SELECT 'Programacion I', id FROM carreras WHERE nombre = 'Tecnicatura en Programacion';

INSERT IGNORE INTO materias(nombre, carrera_id)
SELECT 'Base de Datos I', id FROM carreras WHERE nombre = 'Tecnicatura en Programacion';

INSERT IGNORE INTO materias(nombre, carrera_id)
SELECT 'Ingles Tecnico', id FROM carreras WHERE nombre = 'Desarrollo de Software';
