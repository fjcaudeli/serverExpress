const joi = require('joi')

const id = joi.number().integer().min(1).required().messages({
    'any.required': 'El id es obligatorio',
    'number.base': 'El id debe ser numerico',
    'number.min': 'El id debe ser mayor a 0'
})

const nombre = joi.string().min(3).max(100)
const carreraId = joi.number().integer().min(1)

const idParamSchema = joi.object({
    id
})

const listarMateriasSchema = joi.object({
    todos: joi.string().valid('true', 'false').optional(),
    incluirBajas: joi.string().valid('true', 'false').optional()
})

const crearMateriaSchema = joi.object({
    nombre: nombre.required(),
    carreraId: carreraId.required()
})

const editarMateriaSchema = joi.object({
    nombre,
    carreraId
}).min(1)

module.exports = {
    idParamSchema,
    listarMateriasSchema,
    crearMateriaSchema,
    editarMateriaSchema
}
