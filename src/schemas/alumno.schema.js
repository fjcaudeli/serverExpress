const joi = require('joi')

const id = joi.number().integer().min(1).required().messages({
    'any.required': 'El id es obligatorio',
    'number.base': 'El id debe ser numerico',
    'number.min': 'El id debe ser mayor a 0'
})

const nombre = joi.string().min(2).max(100)
const mail = joi.string().email().max(150)
const usuario = joi.string().pattern(/^[a-zA-Z0-9._-]+$/).min(3).max(50).messages({
    'string.pattern.base': 'El usuario solo puede tener letras, numeros, puntos, guiones y guion bajo'
})
const password = joi.string().min(6).max(100)

const idParamSchema = joi.object({
    id
})

const listarAlumnosSchema = joi.object({
    todos: joi.string().valid('true', 'false').optional(),
    incluirBajas: joi.string().valid('true', 'false').optional()
})

const crearAlumnoSchema = joi.object({
    nombre: nombre.required(),
    mail: mail.required(),
    usuario: usuario.required(),
    password: password.required()
})

const editarAlumnoSchema = joi.object({
    nombre,
    mail,
    usuario,
    password
}).min(1)

module.exports = {
    idParamSchema,
    listarAlumnosSchema,
    crearAlumnoSchema,
    editarAlumnoSchema
}
