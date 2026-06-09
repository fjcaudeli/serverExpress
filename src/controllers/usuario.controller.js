const UsuarioService = require('../services/usuario.service')
const service = new UsuarioService()

async function login(req, res, next) {
    try {
        const data = req.body // Deberiamos validar con un schema de joi
        const result = await service.login(data)
        res.send(result)
    } catch(error) {
        next(error)
    }
}

async function crearUsuario(req, res, next) {
    try {
        const data = req.body // Deberiamos validar con un schema de joi
        const result = await service.crearUsuario(data)
        res.send(result)
    } catch(error) {
        next(error)
    }
}

module.exports = {
    login,
    crearUsuario
}
