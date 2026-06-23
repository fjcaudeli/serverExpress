require('dotenv').config({ quiet: true })
const express = require('express')
const authRouter = require('./routes/auth.router')
const alumnoRouter = require('./routes/alumno.router')
const materiaRouter = require('./routes/materia.router')
const inscripcionRouter = require('./routes/inscripcion.router')
const { errorLog, errorHandler } = require('./middlewares/errorHandler')
const { testConnection } = require('./db/connection')

const app = express()

app.use(express.json())
app.use('/', authRouter)
app.use('/alumnos', alumnoRouter)
app.use('/materias', materiaRouter)
app.use('/inscripciones', inscripcionRouter)

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API TP Integrador - Alumnos, materias e inscripciones'
    })
})

app.use(errorLog)
app.use(errorHandler)

const puerto = process.env.PUERTO || 3000
app.listen(puerto, async () =>{
    await testConnection()
    console.log(`Servidor escuchando en el puerto ${puerto}`)
})
