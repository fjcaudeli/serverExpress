const express = require('express')
const {
    getAlumnos,
    getAlumnoPorId,
    postAlumno,
    putAlumno,
    deleteAlumno
} = require('../controllers/alumno.controller')
const {
    getMateriasPorAlumno
} = require('../controllers/inscripcion.controller')
const {
    autenticar,
    autorizarRoles,
    permitirAdminCoordinadorOMismoAlumno,
    permitirAdminOMismoAlumno
} = require('../middlewares/authHandler')
const { validator } = require('../middlewares/validatorHandler')
const {
    idParamSchema,
    listarAlumnosSchema,
    crearAlumnoSchema,
    editarAlumnoSchema
} = require('../schemas/alumno.schema')

const router = express.Router()

router.get('/',
    autenticar,
    autorizarRoles('Administrador', 'Coordinador'),
    validator(listarAlumnosSchema, 'query'),
    getAlumnos
)

router.get('/:id/materias',
    autenticar,
    validator(idParamSchema, 'params'),
    permitirAdminCoordinadorOMismoAlumno,
    getMateriasPorAlumno
)

router.get('/:id',
    autenticar,
    validator(idParamSchema, 'params'),
    permitirAdminCoordinadorOMismoAlumno,
    getAlumnoPorId
)

router.post('/',
    autenticar,
    autorizarRoles('Administrador'),
    validator(crearAlumnoSchema, 'body'),
    postAlumno
)

router.put('/:id',
    autenticar,
    validator(idParamSchema, 'params'),
    permitirAdminOMismoAlumno,
    validator(editarAlumnoSchema, 'body'),
    putAlumno
)

router.delete('/:id',
    autenticar,
    autorizarRoles('Administrador'),
    validator(idParamSchema, 'params'),
    deleteAlumno
)

module.exports = router
