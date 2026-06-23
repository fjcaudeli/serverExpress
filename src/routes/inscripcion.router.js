const express = require('express')
const {
    postInscripcion,
    deleteInscripcion
} = require('../controllers/inscripcion.controller')
const {
    autenticar,
    autorizarRoles
} = require('../middlewares/authHandler')
const { validator } = require('../middlewares/validatorHandler')
const {
    crearInscripcionSchema,
    bajaInscripcionSchema
} = require('../schemas/inscripcion.schema')

const router = express.Router()

router.post('/',
    autenticar,
    autorizarRoles('Administrador', 'Alumno'),
    validator(crearInscripcionSchema, 'body'),
    postInscripcion
)

router.delete('/',
    autenticar,
    autorizarRoles('Administrador', 'Alumno'),
    validator(bajaInscripcionSchema, 'body'),
    deleteInscripcion
)

module.exports = router
