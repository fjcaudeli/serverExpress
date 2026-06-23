const InscripcionService = require('../services/inscripcion.service')
const crearError = require('../utils/httpError')

const service = new InscripcionService()

async function postInscripcion(req, res, next) {
    try {
        const datos = { ...req.body }

        if (req.user.rol === 'Alumno') {
            if (datos.alumnoId && Number(datos.alumnoId) !== req.user.id) {
                throw crearError(403, 'No puede inscribir a otro alumno')
            }

            datos.alumnoId = req.user.id
        }

        if (!datos.alumnoId) {
            throw crearError(400, 'Debe indicar el alumno a inscribir')
        }

        const inscripcion = await service.crear(datos, req.user.id)
        res.status(201).json(inscripcion)
    } catch (error) {
        next(error)
    }
}

async function deleteInscripcion(req, res, next) {
    try {
        const resultado = await service.baja(req.body, req.user)
        res.json(resultado)
    } catch (error) {
        next(error)
    }
}

async function getMateriasPorAlumno(req, res, next) {
    try {
        const materias = await service.listarMateriasDeAlumno(req.params.id)
        res.json(materias)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    postInscripcion,
    deleteInscripcion,
    getMateriasPorAlumno
}
