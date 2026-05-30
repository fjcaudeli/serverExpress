const MateriaService = require('../services/materia.service')

const serviceMateria = new MateriaService()

async function getMateria(req, res, next) {
    try {
        const materias = await serviceMateria.get()
        res.json(materias)       
    } catch (error) {
        next(error)    
    }
}

async function getMateriaPorCarrera(req, res, next) {
    try {     
        const carrera = req.params.carrera
        const materias = await serviceMateria.getMateriaPorCarrera(carrera)
        res.json(materias)        
    } catch (error) {
        next(error)
    }
}

async function postMateria(req, res, next) {
    try {
        const materia = req.body
        const materiaNueva = await serviceMateria.post(materia)
        res.status(201).json(materiaNueva)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getMateria,
    getMateriaPorCarrera,
    postMateria
}
