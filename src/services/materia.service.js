const { pool } = require('../db/connection')
const crearError = require('../utils/httpError')

const columnasMateria = `
    m.id,
    m.nombre,
    c.id carreraId,
    c.nombre carrera,
    m.fecha_alta fechaAlta,
    m.usuario_alta_id usuarioAltaId,
    usuarioAlta.usuario usuarioAlta,
    m.fecha_modificacion fechaModificacion,
    m.usuario_modificacion_id usuarioModificacionId,
    usuarioModificacion.usuario usuarioModificacion,
    m.fecha_baja fechaBaja,
    m.usuario_baja_id usuarioBajaId,
    usuarioBaja.usuario usuarioBaja
`

const joinsMateria = `
    FROM materias m
        INNER JOIN carreras c ON c.id = m.carrera_id
        LEFT JOIN usuarios usuarioAlta ON usuarioAlta.id = m.usuario_alta_id
        LEFT JOIN usuarios usuarioModificacion ON usuarioModificacion.id = m.usuario_modificacion_id
        LEFT JOIN usuarios usuarioBaja ON usuarioBaja.id = m.usuario_baja_id
`

class MateriaService {
    async listar(incluirBajas = false) {
        let sql = `
            SELECT ${columnasMateria}
            ${joinsMateria}
            WHERE c.fecha_baja IS NULL
        `

        if (!incluirBajas) {
            sql += ' AND m.fecha_baja IS NULL'
        }

        sql += ' ORDER BY m.id'

        const [rows] = await pool.query(sql)
        return rows
    }

    async obtenerPorId(id, incluirBajas = false) {
        let sql = `
            SELECT ${columnasMateria}
            ${joinsMateria}
            WHERE m.id = ?
                AND c.fecha_baja IS NULL
        `

        if (!incluirBajas) {
            sql += ' AND m.fecha_baja IS NULL'
        }

        const [rows] = await pool.query(sql, [id])

        if (rows.length === 0) {
            throw crearError(404, `No existe una materia activa con id ${id}`)
        }

        return rows[0]
    }

    async crear(materia, usuarioAltaId) {
        await this.validarCarreraActiva(materia.carreraId)

        const sql = `
            INSERT INTO materias(nombre, carrera_id, usuario_alta_id)
            VALUES(?, ?, ?)
        `

        const [result] = await pool.query(sql, [
            materia.nombre,
            materia.carreraId,
            usuarioAltaId
        ])

        return await this.obtenerPorId(result.insertId)
    }

    async editar(id, datos, usuarioModificacionId) {
        await this.obtenerPorId(id)

        const campos = []
        const valores = []

        if (datos.nombre !== undefined) {
            campos.push('nombre = ?')
            valores.push(datos.nombre)
        }

        if (datos.carreraId !== undefined) {
            await this.validarCarreraActiva(datos.carreraId)
            campos.push('carrera_id = ?')
            valores.push(datos.carreraId)
        }

        if (campos.length === 0) {
            throw crearError(400, 'Debe enviar al menos un dato para modificar')
        }

        campos.push('fecha_modificacion = NOW()')
        campos.push('usuario_modificacion_id = ?')
        valores.push(usuarioModificacionId)
        valores.push(id)

        const sql = `
            UPDATE materias
            SET ${campos.join(', ')}
            WHERE id = ?
                AND fecha_baja IS NULL
        `

        await pool.query(sql, valores)
        return await this.obtenerPorId(id)
    }

    async baja(id, usuarioBajaId) {
        await this.obtenerPorId(id)

        const sql = `
            UPDATE materias
            SET fecha_baja = NOW(),
                usuario_baja_id = ?
            WHERE id = ?
                AND fecha_baja IS NULL
        `

        await pool.query(sql, [usuarioBajaId, id])

        return {
            id: Number(id),
            mensaje: 'Materia dada de baja correctamente'
        }
    }

    async validarCarreraActiva(carreraId) {
        const [rows] = await pool.query(
            `SELECT id
             FROM carreras
             WHERE id = ?
                AND fecha_baja IS NULL`,
            [carreraId]
        )

        if (rows.length === 0) {
            throw crearError(404, `No existe una carrera activa con id ${carreraId}`)
        }
    }
}

module.exports = MateriaService
