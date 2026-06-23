const bcrypt = require('bcrypt')
const { pool } = require('./connection')

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10

async function obtenerRolId(nombre) {
    const [rows] = await pool.query(
        'SELECT id FROM roles WHERE nombre = ? AND fecha_baja IS NULL',
        [nombre]
    )

    if (rows.length === 0) {
        throw new Error(`No existe el rol ${nombre}. Ejecute primero src/db/schema.sql`)
    }

    return rows[0].id
}

async function crearUsuarioSiNoExiste(usuarioBase) {
    const [rows] = await pool.query(
        'SELECT id FROM usuarios WHERE usuario = ?',
        [usuarioBase.usuario]
    )

    if (rows.length > 0) {
        return false
    }

    const passwordHash = await bcrypt.hash(usuarioBase.password, SALT_ROUNDS)

    await pool.query(
        `INSERT INTO usuarios(nombre, mail, usuario, password, rol_id)
         VALUES(?, ?, ?, ?, ?)`,
        [
            usuarioBase.nombre,
            usuarioBase.mail,
            usuarioBase.usuario,
            passwordHash,
            usuarioBase.rolId
        ]
    )

    return true
}

async function main() {
    const rolAdminId = await obtenerRolId('Administrador')
    const rolCoordinadorId = await obtenerRolId('Coordinador')
    const rolAlumnoId = await obtenerRolId('Alumno')

    const usuarios = [
        {
            nombre: 'Administrador Demo',
            mail: 'admin@tp.com',
            usuario: 'admin',
            password: 'admin123',
            rolId: rolAdminId
        },
        {
            nombre: 'Coordinador Demo',
            mail: 'coordinador@tp.com',
            usuario: 'coordinador',
            password: 'coord123',
            rolId: rolCoordinadorId
        },
        {
            nombre: 'Alumno Demo',
            mail: 'alumno@tp.com',
            usuario: 'alumno',
            password: 'alumno123',
            rolId: rolAlumnoId
        }
    ]

    for (const usuario of usuarios) {
        const creado = await crearUsuarioSiNoExiste(usuario)
        const estado = creado ? 'creado' : 'ya existia'
        console.log(`${usuario.usuario}: ${estado}`)
    }

    console.log('Usuarios de prueba disponibles:')
    console.log('admin / admin123')
    console.log('coordinador / coord123')
    console.log('alumno / alumno123')
}

main()
    .catch((error) => {
        console.error('Error al ejecutar el seed:', error.message)
        process.exitCode = 1
    })
    .finally(async () => {
        await pool.end()
    })
