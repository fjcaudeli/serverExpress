const express = require('express')
const { crearUsuario, login } = require('../controllers/usuario.controller')

const usuarioRouter = express.Router()

usuarioRouter.post('/', crearUsuario)
usuarioRouter.post('/login', login)

module.exports = usuarioRouter
