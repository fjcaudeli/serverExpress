const { 
    getCarrera, 
    postCarrera,
    deleteCarrera,
    updateCarrera } = require('../controllers/carrera.controller')
const express = require('express')

const carrerasRouter = express.Router()

carrerasRouter.post('/', postCarrera)
carrerasRouter.put('/', updateCarrera)
carrerasRouter.get('/', getCarrera)
carrerasRouter.delete('/:id', deleteCarrera)

module.exports = carrerasRouter
