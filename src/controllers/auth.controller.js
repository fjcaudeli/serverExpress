const AuthService = require('../services/auth.service')

const service = new AuthService()

async function login(req, res, next) {
    try {
        const respuesta = await service.login(req.body)
        res.json(respuesta)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    login
}
