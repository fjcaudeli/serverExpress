const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { pool } = require('../db/connection')
const crearError = require('../utils/httpError')

class AuthService {
    async login(credenciales) {
        const sql = `
            SELECT u.id,
                   u.nombre,
                   u.mail,
                   u.usuario,
                   u.password,
                   r.nombre rol
            FROM usuarios u
                INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.usuario = ?
                AND u.fecha_baja IS NULL
                AND r.fecha_baja IS NULL
        `

        const [usuarios] = await pool.query(sql, [credenciales.usuario])

        if (usuarios.length === 0) {
            throw crearError(401, 'Usuario o contrasena incorrectos')
        }

        const usuario = usuarios[0]
        const passwordValido = await bcrypt.compare(credenciales.password, usuario.password)

        if (!passwordValido) {
            throw crearError(401, 'Usuario o contrasena incorrectos')
        }

        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            mail: usuario.mail,
            usuario: usuario.usuario,
            rol: usuario.rol
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'clave_tp_integrador',
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
        )

        return {
            token,
            usuario: payload
        }
    }
}

module.exports = AuthService
