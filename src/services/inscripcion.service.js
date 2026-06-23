const { pool } = require('../db/connection')
const crearError = require('../utils/httpError')

class InscripcionService {
    async crear(datos, usuarioAltaId) {
        await this.validarAlumnoActivo(datos.alumnoId)
        await this.validarMateriaActiva(datos.materiaId)
        await this.validarInscripcionNoDuplicada(datos.alumnoId, datos.materiaId)

        const sql = `
            INSERT INTO inscripciones(alumno_id, materia_id, usuario_alta_id)
            VALUES(?, ?, ?)
        `

        const [result] = await pool.query(sql, [
            datos.alumnoId,
            datos.materiaId,
            usuarioAltaId
        ])

        return await this.obtenerPorId(result.insertId)
    }

    async obtenerPorId(id) {
        const sql = `
            SELECT i.id,
                   i.alumno_id alumnoId,
                   alumno.nombre alumno,
                   i.materia_id materiaId,
                   materia.nombre materia,
                   carrera.id carreraId,
                   carrera.nombre carrera,
                   i.fecha_alta fechaAlta,
                   i.usuario_alta_id usuarioAltaId,
                   usuarioAlta.usuario usuarioAlta,
                   i.fecha_modificacion fechaModificacion,
                   i.usuario_modificacion_id usuarioModificacionId,
                   usuarioModificacion.usuario usuarioModificacion,
                   i.fecha_baja fechaBaja,
                   i.usuario_baja_id usuarioBajaId,
                   usuarioBaja.usuario usuarioBaja
            FROM inscripciones i
                INNER JOIN usuarios alumno ON alumno.id = i.alumno_id
                INNER JOIN materias materia ON materia.id = i.materia_id
                INNER JOIN carreras carrera ON carrera.id = materia.carrera_id
                LEFT JOIN usuarios usuarioAlta ON usuarioAlta.id = i.usuario_alta_id
                LEFT JOIN usuarios usuarioModificacion ON usuarioModificacion.id = i.usuario_modificacion_id
                LEFT JOIN usuarios usuarioBaja ON usuarioBaja.id = i.usuario_baja_id
            WHERE i.id = ?
        `

        const [rows] = await pool.query(sql, [id])

        if (rows.length === 0) {
            throw crearError(404, `No existe una inscripcion con id ${id}`)
        }

        return rows[0]
    }

    async listarMateriasDeAlumno(alumnoId) {
        await this.validarAlumnoActivo(alumnoId)

        const sql = `
            SELECT i.id inscripcionId,
                   m.id materiaId,
                   m.nombre materia,
                   c.id carreraId,
                   c.nombre carrera,
                   i.fecha_alta fechaInscripcion
            FROM inscripciones i
                INNER JOIN materias m ON m.id = i.materia_id
                INNER JOIN carreras c ON c.id = m.carrera_id
            WHERE i.alumno_id = ?
                AND i.fecha_baja IS NULL
                AND m.fecha_baja IS NULL
                AND c.fecha_baja IS NULL
            ORDER BY m.nombre
        `

        const [rows] = await pool.query(sql, [alumnoId])
        return rows
    }

    async listarAlumnosDeMateria(materiaId) {
        await this.validarMateriaActiva(materiaId)

        const sql = `
            SELECT i.id inscripcionId,
                   u.id alumnoId,
                   u.nombre alumno,
                   u.mail,
                   u.usuario,
                   i.fecha_alta fechaInscripcion
            FROM inscripciones i
                INNER JOIN usuarios u ON u.id = i.alumno_id
                INNER JOIN roles r ON r.id = u.rol_id
            WHERE i.materia_id = ?
                AND i.fecha_baja IS NULL
                AND u.fecha_baja IS NULL
                AND r.nombre = 'Alumno'
            ORDER BY u.nombre
        `

        const [rows] = await pool.query(sql, [materiaId])
        return rows
    }

    async baja(filtro, usuarioActual) {
        const inscripcion = await this.obtenerActiva(filtro)

        if (usuarioActual.rol !== 'Administrador' && usuarioActual.id !== inscripcion.alumnoId) {
            throw crearError(403, 'Solo el alumno inscripto o un administrador pueden dar de baja la inscripcion')
        }

        const sql = `
            UPDATE inscripciones
            SET fecha_baja = NOW(),
                usuario_baja_id = ?
            WHERE id = ?
                AND fecha_baja IS NULL
        `

        await pool.query(sql, [usuarioActual.id, inscripcion.id])

        return {
            id: inscripcion.id,
            mensaje: 'Inscripcion dada de baja correctamente'
        }
    }

    async obtenerActiva(filtro) {
        let sql = `
            SELECT id,
                   alumno_id alumnoId,
                   materia_id materiaId
            FROM inscripciones
            WHERE fecha_baja IS NULL
        `

        const valores = []

        if (filtro.id) {
            sql += ' AND id = ?'
            valores.push(filtro.id)
        } else {
            sql += ' AND alumno_id = ? AND materia_id = ?'
            valores.push(filtro.alumnoId, filtro.materiaId)
        }

        const [rows] = await pool.query(sql, valores)

        if (rows.length === 0) {
            throw crearError(404, 'No existe una inscripcion activa con esos datos')
        }

        return rows[0]
    }

    async validarAlumnoActivo(alumnoId) {
        const sql = `
            SELECT u.id
            FROM usuarios u
                INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.id = ?
                AND r.nombre = 'Alumno'
                AND u.fecha_baja IS NULL
                AND r.fecha_baja IS NULL
        `

        const [rows] = await pool.query(sql, [alumnoId])

        if (rows.length === 0) {
            throw crearError(404, `No existe un alumno activo con id ${alumnoId}`)
        }
    }

    async validarMateriaActiva(materiaId) {
        const sql = `
            SELECT m.id
            FROM materias m
                INNER JOIN carreras c ON c.id = m.carrera_id
            WHERE m.id = ?
                AND m.fecha_baja IS NULL
                AND c.fecha_baja IS NULL
        `

        const [rows] = await pool.query(sql, [materiaId])

        if (rows.length === 0) {
            throw crearError(404, `No existe una materia activa con id ${materiaId}`)
        }
    }

    async validarInscripcionNoDuplicada(alumnoId, materiaId) {
        const sql = `
            SELECT id
            FROM inscripciones
            WHERE alumno_id = ?
                AND materia_id = ?
                AND fecha_baja IS NULL
        `

        const [rows] = await pool.query(sql, [alumnoId, materiaId])

        if (rows.length > 0) {
            throw crearError(409, 'El alumno ya se encuentra inscripto en esa materia')
        }
    }
}

module.exports = InscripcionService
