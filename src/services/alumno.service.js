const bcrypt = require('bcrypt')
const { pool } = require('../db/connection')
const crearError = require('../utils/httpError')

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10

const columnasAlumno = `
    u.id,
    u.nombre,
    u.mail,
    u.usuario,
    r.nombre rol,
    u.fecha_alta fechaAlta,
    u.usuario_alta_id usuarioAltaId,
    usuarioAlta.usuario usuarioAlta,
    u.fecha_modificacion fechaModificacion,
    u.usuario_modificacion_id usuarioModificacionId,
    usuarioModificacion.usuario usuarioModificacion,
    u.fecha_baja fechaBaja,
    u.usuario_baja_id usuarioBajaId,
    usuarioBaja.usuario usuarioBaja
`

const joinsAlumno = `
    FROM usuarios u
        INNER JOIN roles r ON r.id = u.rol_id
        LEFT JOIN usuarios usuarioAlta ON usuarioAlta.id = u.usuario_alta_id
        LEFT JOIN usuarios usuarioModificacion ON usuarioModificacion.id = u.usuario_modificacion_id
        LEFT JOIN usuarios usuarioBaja ON usuarioBaja.id = u.usuario_baja_id
`

class AlumnoService {
    async listar(incluirBajas = false) {
        let sql = `
            SELECT ${columnasAlumno}
            ${joinsAlumno}
            WHERE r.nombre = 'Alumno'
                AND r.fecha_baja IS NULL
        `

        if (!incluirBajas) {
            sql += ' AND u.fecha_baja IS NULL'
        }

        sql += ' ORDER BY u.id'

        const [rows] = await pool.query(sql)
        return rows
    }

    async obtenerPorId(id, incluirBajas = false) {
        let sql = `
            SELECT ${columnasAlumno}
            ${joinsAlumno}
            WHERE u.id = ?
                AND r.nombre = 'Alumno'
                AND r.fecha_baja IS NULL
        `

        if (!incluirBajas) {
            sql += ' AND u.fecha_baja IS NULL'
        }

        const [rows] = await pool.query(sql, [id])

        if (rows.length === 0) {
            throw crearError(404, `No existe un alumno activo con id ${id}`)
        }

        return rows[0]
    }

    async crear(alumno, usuarioAltaId) {
        const rolAlumnoId = await this.obtenerRolAlumnoId()
        const passwordHash = await bcrypt.hash(alumno.password, SALT_ROUNDS)

        const sql = `
            INSERT INTO usuarios(nombre, mail, usuario, password, rol_id, usuario_alta_id)
            VALUES(?, ?, ?, ?, ?, ?)
        `

        try {
            const [result] = await pool.query(sql, [
                alumno.nombre,
                alumno.mail,
                alumno.usuario,
                passwordHash,
                rolAlumnoId,
                usuarioAltaId
            ])

            return await this.obtenerPorId(result.insertId)
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw crearError(409, 'Ya existe un usuario o mail registrado con esos datos')
            }

            throw error
        }
    }

    async editar(id, datos, usuarioModificacionId) {
        await this.obtenerPorId(id)

        const campos = []
        const valores = []

        if (datos.nombre !== undefined) {
            campos.push('nombre = ?')
            valores.push(datos.nombre)
        }

        if (datos.mail !== undefined) {
            campos.push('mail = ?')
            valores.push(datos.mail)
        }

        if (datos.usuario !== undefined) {
            campos.push('usuario = ?')
            valores.push(datos.usuario)
        }

        if (datos.password !== undefined) {
            campos.push('password = ?')
            valores.push(await bcrypt.hash(datos.password, SALT_ROUNDS))
        }

        if (campos.length === 0) {
            throw crearError(400, 'Debe enviar al menos un dato para modificar')
        }

        campos.push('fecha_modificacion = NOW()')
        campos.push('usuario_modificacion_id = ?')
        valores.push(usuarioModificacionId)
        valores.push(id)

        const sql = `
            UPDATE usuarios
            SET ${campos.join(', ')}
            WHERE id = ?
                AND fecha_baja IS NULL
        `

        try {
            await pool.query(sql, valores)
            return await this.obtenerPorId(id)
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw crearError(409, 'Ya existe un usuario o mail registrado con esos datos')
            }

            throw error
        }
    }

    async baja(id, usuarioBajaId) {
        await this.obtenerPorId(id)

        const sql = `
            UPDATE usuarios
            SET fecha_baja = NOW(),
                usuario_baja_id = ?
            WHERE id = ?
                AND fecha_baja IS NULL
        `

        await pool.query(sql, [usuarioBajaId, id])

        return {
            id: Number(id),
            mensaje: 'Alumno dado de baja correctamente'
        }
    }

    async obtenerRolAlumnoId() {
        const [rows] = await pool.query(
            `SELECT id
             FROM roles
             WHERE nombre = 'Alumno'
                AND fecha_baja IS NULL`
        )

        if (rows.length === 0) {
            throw crearError(500, 'No existe el rol Alumno en la base de datos')
        }

        return rows[0].id
    }
}

module.exports = AlumnoService
