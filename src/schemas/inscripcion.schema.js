const joi = require('joi')

const id = joi.number().integer().min(1).messages({
    'number.base': 'El id debe ser numerico',
    'number.min': 'El id debe ser mayor a 0'
})

const crearInscripcionSchema = joi.object({
    alumnoId: id.optional(),
    materiaId: id.required().messages({
        'any.required': 'La materia es obligatoria'
    })
})

const bajaInscripcionSchema = joi.object({
    id: id.optional(),
    alumnoId: id.optional(),
    materiaId: id.optional()
})
    .or('id', 'alumnoId')
    .with('alumnoId', 'materiaId')
    .with('materiaId', 'alumnoId')

module.exports = {
    crearInscripcionSchema,
    bajaInscripcionSchema
}
