const joi = require('joi')

const loginSchema = joi.object({
    usuario: joi.string().min(3).max(50).required().messages({
        'any.required': 'El usuario es obligatorio',
        'string.empty': 'El usuario es obligatorio'
    }),
    password: joi.string().min(6).max(100).required().messages({
        'any.required': 'La contrasena es obligatoria',
        'string.empty': 'La contrasena es obligatoria'
    })
})

module.exports = {
    loginSchema
}
