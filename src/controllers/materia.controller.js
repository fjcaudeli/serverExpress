const MateriaService = require('../services/materia.service')
const InscripcionService = require('../services/inscripcion.service')

const materiaService = new MateriaService()
const inscripcionService = new InscripcionService()

function debeIncluirBajas(req) {
    return req.query.todos === 'true' || req.query.incluirBajas === 'true'
}

function puedeVerBajas(usuario) {
    return ['Administrador', 'Coordinador'].includes(usuario.rol)
}

async function getMaterias(req, res, next) {
    try {
        const incluirBajas = debeIncluirBajas(req) && puedeVerBajas(req.user)
        const materias = await materiaService.listar(incluirBajas)
        res.json(materias)
    } catch (error) {
        next(error)
    }
}

async function getMateriaPorId(req, res, next) {
    try {
        const incluirBajas = debeIncluirBajas(req) && puedeVerBajas(req.user)
        const materia = await materiaService.obtenerPorId(req.params.id, incluirBajas)
        res.json(materia)
    } catch (error) {
        next(error)
    }
}

async function postMateria(req, res, next) {
    try {
        const materia = await materiaService.crear(req.body, req.user.id)
        res.status(201).json(materia)
    } catch (error) {
        next(error)
    }
}

async function putMateria(req, res, next) {
    try {
        const materia = await materiaService.editar(req.params.id, req.body, req.user.id)
        res.json(materia)
    } catch (error) {
        next(error)
    }
}

async function deleteMateria(req, res, next) {
    try {
        const resultado = await materiaService.baja(req.params.id, req.user.id)
        res.json(resultado)
    } catch (error) {
        next(error)
    }
}

async function getAlumnosPorMateria(req, res, next) {
    try {
        const alumnos = await inscripcionService.listarAlumnosDeMateria(req.params.id)
        res.json(alumnos)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getMaterias,
    getMateriaPorId,
    postMateria,
    putMateria,
    deleteMateria,
    getAlumnosPorMateria
}
