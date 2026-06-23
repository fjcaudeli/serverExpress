const express = require('express')
const { login } = require('../controllers/auth.controller')
const { validator } = require('../middlewares/validatorHandler')
const { loginSchema } = require('../schemas/auth.schema')

const router = express.Router()

router.post('/login',
    validator(loginSchema, 'body'),
    login
)

module.exports = router
