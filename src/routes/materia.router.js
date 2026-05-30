const express = require('express')
const {
    getMateria,
    getMateriaPorCarrera,
    postMateria
 } = require('../controllers/materia.controller')
 const { 
    postMateriaSchema, 
    paramCarreraSchema } = require('../schemas/materia.schema')
 const { validator } = require('../middlewares/validatorHandler')


const materiasRouter = express.Router()
materiasRouter.get('/', getMateria)
materiasRouter.get('/carrera/:carrera',
    validator(paramCarreraSchema, 'params'), 
    getMateriaPorCarrera)
materiasRouter.post('/',  
    validator(postMateriaSchema, 'body'), 
    postMateria)

module.exports = materiasRouter
