const { 
    getCarrera, 
    postCarrera,
    deleteCarrera,
    updateCarrera } = require('../controllers/carrera.controller')
const express = require('express')
const { checkAdmin } = require('../middlewares/secure')

const carrerasRouter = express.Router()

carrerasRouter.post('/',
    checkAdmin(),
    postCarrera)

carrerasRouter.put('/',
    checkAdmin(),
    updateCarrera)

carrerasRouter.get('/', getCarrera)

carrerasRouter.delete('/:id',
    checkAdmin(),
    deleteCarrera)

module.exports = carrerasRouter
