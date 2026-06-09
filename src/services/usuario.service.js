const { pool } = require('../db/connection')
const bcrypt = require('bcrypt')
const { sign } = require('../utils/jwt')

class UsuarioService {
    async login(data) {
        const sql =
            `SELECT usu_id id, usu_nombre nombre, usu_esadmin admin, usu_password password
              FROM usuarios
             WHERE usu_usuario = ?`
        const [usuario] = await pool.query(sql, [
            data.usuario
        ])

        if(usuario.length > 0) {
            const { id, nombre, admin, password } = usuario[0]
            return bcrypt.compare(data.pass, password)
                .then(sonIguales => {
                    if(sonIguales) {
                        const token = { token: sign({ id, nombre, admin }) }
                        return { login: true, ...token }
                    } else {
                        console.error('Contrasena invalida')
                        const error = new Error('Datos de login incorrectos')
                        error.status = 401
                        throw error
                    }
                })
        } else {
            console.error('Usuario invalido')
            const error = new Error('Datos de login incorrectos')
            error.status = 401
            throw error
        }
    }

    async crearUsuario(usuario) {
        const hash = await bcrypt.hash(usuario.pass, 10)

        const sql =
            `INSERT INTO usuarios(usu_nombre, usu_usuario, usu_password, usu_esadmin)
            VALUES(?, ?, ?, ?)`
        const [result] = await pool.query(sql, [
            usuario.nombre,
            usuario.usuario,
            hash,
            usuario.admin
        ])
        const nuevoId = result.insertId
        return { nuevoId, ...usuario }
    }
}

module.exports = UsuarioService
