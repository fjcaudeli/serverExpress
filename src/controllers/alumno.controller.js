const AlumnoService = require('../services/alumno.service')

const service = new AlumnoService()

function debeIncluirBajas(req) {
    return req.query.todos === 'true' || req.query.incluirBajas === 'true'
}

function puedeVerBajas(usuario) {
    return ['Administrador', 'Coordinador'].includes(usuario.rol)
}

async function getAlumnos(req, res, next) {
    try {
        const alumnos = await service.listar(debeIncluirBajas(req) && puedeVerBajas(req.user))
        res.json(alumnos)
    } catch (error) {
        next(error)
    }
}

async function getAlumnoPorId(req, res, next) {
    try {
        const alumno = await service.obtenerPorId(req.params.id, debeIncluirBajas(req) && puedeVerBajas(req.user))
        res.json(alumno)
    } catch (error) {
        next(error)
    }
}

async function postAlumno(req, res, next) {
    try {
        const alumno = await service.crear(req.body, req.user.id)
        res.status(201).json(alumno)
    } catch (error) {
        next(error)
    }
}

async function putAlumno(req, res, next) {
    try {
        const alumno = await service.editar(req.params.id, req.body, req.user.id)
        res.json(alumno)
    } catch (error) {
        next(error)
    }
}

async function deleteAlumno(req, res, next) {
    try {
        const resultado = await service.baja(req.params.id, req.user.id)
        res.json(resultado)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAlumnos,
    getAlumnoPorId,
    postAlumno,
    putAlumno,
    deleteAlumno
}
