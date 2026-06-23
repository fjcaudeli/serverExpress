const jwt = require('jsonwebtoken')
const crearError = require('../utils/httpError')

function autenticar(req, res, next) {
    const authorization = req.headers.authorization

    if (!authorization) {
        return next(crearError(401, 'Debe enviar un token de autenticacion'))
    }

    const [tipo, token] = authorization.split(' ')

    if (tipo !== 'Bearer' || !token) {
        return next(crearError(401, 'Formato de token invalido'))
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'clave_tp_integrador')
        next()
    } catch (error) {
        next(crearError(401, 'Token invalido o vencido'))
    }
}

function autorizarRoles(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            return next(crearError(401, 'Usuario no autenticado'))
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return next(crearError(403, 'No tiene permisos para realizar esta accion'))
        }

        next()
    }
}

function permitirAdminCoordinadorOMismoAlumno(req, res, next) {
    if (['Administrador', 'Coordinador'].includes(req.user.rol)) {
        return next()
    }

    if (req.user.rol === 'Alumno' && Number(req.params.id) === req.user.id) {
        return next()
    }

    next(crearError(403, 'No tiene permisos para acceder a este alumno'))
}

function permitirAdminOMismoAlumno(req, res, next) {
    if (req.user.rol === 'Administrador') {
        return next()
    }

    if (req.user.rol === 'Alumno' && Number(req.params.id) === req.user.id) {
        return next()
    }

    next(crearError(403, 'No tiene permisos para realizar esta accion'))
}

module.exports = {
    autenticar,
    autorizarRoles,
    permitirAdminCoordinadorOMismoAlumno,
    permitirAdminOMismoAlumno
}
