const joi = require('joi')

const id = joi.number().min(1).messages({
    'any.required': 'El id es obligatorio',
    'number.min': 'El id debe ser igual o mayor a {#limit}'
})

const nombre = joi.string().min(3).max(50).messages({
    'any.required': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener por lo menos {#limit} caracteres',
    'string.max': 'El nombre debe tener como maximo {#limit} caracteres'
})

const carrera = id.required()

const postMateriaSchema = joi.object({
    nombre: nombre.required(),
    carrera: carrera
})

const paramCarreraSchema = joi.object({
    carrera: carrera
})

module.exports = { postMateriaSchema, paramCarreraSchema }
