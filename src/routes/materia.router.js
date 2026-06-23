const express = require('express')
const {
    getMaterias,
    getMateriaPorId,
    postMateria,
    putMateria,
    deleteMateria,
    getAlumnosPorMateria
} = require('../controllers/materia.controller')
const {
    autenticar,
    autorizarRoles
} = require('../middlewares/authHandler')
const { validator } = require('../middlewares/validatorHandler')
const {
    idParamSchema,
    listarMateriasSchema,
    crearMateriaSchema,
    editarMateriaSchema
} = require('../schemas/materia.schema')

const router = express.Router()

router.get('/',
    autenticar,
    validator(listarMateriasSchema, 'query'),
    getMaterias
)

router.get('/:id/alumnos',
    autenticar,
    autorizarRoles('Administrador', 'Coordinador'),
    validator(idParamSchema, 'params'),
    getAlumnosPorMateria
)

router.get('/:id',
    autenticar,
    validator(idParamSchema, 'params'),
    getMateriaPorId
)

router.post('/',
    autenticar,
    autorizarRoles('Administrador'),
    validator(crearMateriaSchema, 'body'),
    postMateria
)

router.put('/:id',
    autenticar,
    autorizarRoles('Administrador'),
    validator(idParamSchema, 'params'),
    validator(editarMateriaSchema, 'body'),
    putMateria
)

router.delete('/:id',
    autenticar,
    autorizarRoles('Administrador'),
    validator(idParamSchema, 'params'),
    deleteMateria
)

module.exports = router
