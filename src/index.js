const express = require('express')
const materiaRouter = require('./routes/materia.router')
const carreraRouter = require('./routes/carrera.router')
const { errorLog, errorHandler } = require('./middlewares/errorHandler')
const { testConnection } = require('./db/connection')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use('/materias', materiaRouter)
app.use('/carreras', carreraRouter)

app.get('/', (req, res) => {
    res.end('API RESTful del TP Integrador')
})

app.use(errorLog)
app.use(errorHandler)

const puerto = process.env.PUERTO
app.listen(puerto, async () =>{
    await testConnection()
    console.log(`Servidor escuchando en el puerto ${puerto}`)
})
