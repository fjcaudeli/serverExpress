const CarreraService = require('../services/carrera.service')

const serviceCarrera = new CarreraService()

async function getCarrera(req, res, next){
    try {
        const carreras = await serviceCarrera.get(req, res)
        res.json(carreras)
    }
    catch(error) {
        next(error) 
    }
}

async function postCarrera(req, res, next){
    try {
        const carrera = req.body
        const resultado = await serviceCarrera.post(carrera)
        res.status(201).json(resultado)       
    } catch (error) {
        next(error)        
    }
}

async function updateCarrera(req, res, next){
    try {
        const carrera = req.body
        const resultado = await serviceCarrera.update(carrera)
        res.status(200).json(resultado)       
    } catch (error) {
        next(error)        
    }
}

async function deleteCarrera(req, res, next){
    try {
        const id = req.params.id
        const resultado = await serviceCarrera.delete(id)
        res.status(200).json(resultado)       
    } catch (error) {
        next(error)        
    }
}

module.exports = {
    getCarrera,
    postCarrera,
    deleteCarrera,
    updateCarrera,
}
