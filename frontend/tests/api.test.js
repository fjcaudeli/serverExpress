import test from 'node:test'
import assert from 'node:assert/strict'

// Es optativa porque escribe datos de prueba. npm test normal no toca MySQL.
test(
  'integracion real: proxy, CRUD, relaciones y permisos de los tres roles',
  {
    skip: !process.env.TEST_API_URL,
    timeout: 60000,
  },
  async () => {
    const base = process.env.TEST_API_URL.replace(/\/$/, '')
    const sufijo = Date.now()
    const alumnosCreados = []
    const inscripcionesCreadas = []
    let materiaCreada
    let admin

    async function pedir(
      ruta,
      { method = 'GET', body, token, status = 200 } = {},
    ) {
      const respuesta = await fetch(`${base}${ruta}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      const datos = await respuesta.json()
      assert.equal(
        respuesta.status,
        status,
        `${method} ${ruta}: ${JSON.stringify(datos)}`,
      )
      return datos
    }

    try {
      await pedir('/login', {
        method: 'POST',
        body: { usuario: 'admin', password: 'incorrecta' },
        status: 401,
      })
      admin = await pedir('/login', {
        method: 'POST',
        body: { usuario: 'admin', password: 'admin123' },
      })
      const coordinador = await pedir('/login', {
        method: 'POST',
        body: { usuario: 'coordinador', password: 'coord123' },
      })
      const materias = await pedir('/materias', { token: admin.token })
      assert.ok(
        materias.length,
        'Debe existir al menos una materia para conocer un ID de carrera valido',
      )

      for (const prefijo of ['origen', 'destino']) {
        const alumno = await pedir('/alumnos', {
          method: 'POST',
          token: admin.token,
          status: 201,
          body: {
            nombre: `Prueba Front ${prefijo} ${sufijo}`,
            mail: `front.${prefijo}.${sufijo}@example.com`,
            usuario: `front.${prefijo}.${sufijo}`,
            password: 'prueba123',
          },
        })
        alumnosCreados.push(alumno)
      }
      const [origen, destino] = alumnosCreados
      const alumno = await pedir('/login', {
        method: 'POST',
        body: { usuario: origen.usuario, password: 'prueba123' },
      })

      const editado = await pedir(`/alumnos/${origen.id}`, {
        method: 'PUT',
        token: alumno.token,
        body: { nombre: `Prueba Front editado ${sufijo}` },
      })
      assert.ok(editado.fechaModificacion)
      assert.equal(editado.usuarioModificacionId, origen.id)
      await pedir(`/alumnos/${origen.id}`, { token: coordinador.token })
      await pedir('/alumnos', { token: alumno.token, status: 403 })
      await pedir(`/alumnos/${destino.id}`, {
        token: alumno.token,
        status: 403,
      })
      await pedir(`/alumnos/${origen.id}`, {
        method: 'DELETE',
        token: alumno.token,
        status: 403,
      })
      await pedir('/alumnos', {
        method: 'POST',
        token: coordinador.token,
        body: {},
        status: 403,
      })
      await pedir('/alumnos', {
        method: 'POST',
        token: alumno.token,
        body: {},
        status: 403,
      })

      materiaCreada = await pedir('/materias', {
        method: 'POST',
        token: admin.token,
        status: 201,
        body: {
          nombre: `Prueba Front materia ${sufijo}`,
          carreraId: materias[0].carreraId,
        },
      })
      const materiaEditada = await pedir(`/materias/${materiaCreada.id}`, {
        method: 'PUT',
        token: admin.token,
        body: { nombre: `Prueba Front materia editada ${sufijo}` },
      })
      assert.ok(materiaEditada.fechaModificacion)
      await pedir('/materias', {
        method: 'POST',
        token: alumno.token,
        body: {},
        status: 403,
      })
      await pedir(`/materias/${materiaCreada.id}`, {
        method: 'PUT',
        token: coordinador.token,
        body: { nombre: 'No permitido' },
        status: 403,
      })
      await pedir('/inscripciones', {
        method: 'POST',
        token: coordinador.token,
        body: { alumnoId: origen.id, materiaId: materiaCreada.id },
        status: 403,
      })
      await pedir('/inscripciones', {
        method: 'POST',
        token: alumno.token,
        body: { alumnoId: destino.id, materiaId: materiaCreada.id },
        status: 403,
      })

      const propia = await pedir('/inscripciones', {
        method: 'POST',
        token: alumno.token,
        body: { materiaId: materiaCreada.id },
        status: 201,
      })
      inscripcionesCreadas.push(propia)
      assert.equal(propia.alumnoId, origen.id)
      await pedir('/inscripciones', {
        method: 'POST',
        token: alumno.token,
        body: { materiaId: materiaCreada.id },
        status: 409,
      })
      const ajena = await pedir('/inscripciones', {
        method: 'POST',
        token: admin.token,
        body: { alumnoId: destino.id, materiaId: materiaCreada.id },
        status: 201,
      })
      inscripcionesCreadas.push(ajena)
      await pedir('/inscripciones', {
        method: 'DELETE',
        token: alumno.token,
        body: { id: ajena.id },
        status: 403,
      })

      const porAlumno = await pedir(`/alumnos/${origen.id}/materias`, {
        token: alumno.token,
      })
      assert.ok(porAlumno.some((item) => item.inscripcionId === propia.id))
      const porMateria = await pedir(`/materias/${materiaCreada.id}/alumnos`, {
        token: coordinador.token,
      })
      assert.equal(porMateria.length, 2)
      await pedir(`/materias/${materiaCreada.id}/alumnos`, {
        token: alumno.token,
        status: 403,
      })
      await pedir('/inscripciones', {
        method: 'DELETE',
        token: alumno.token,
        body: { id: propia.id },
      })
      inscripcionesCreadas.splice(inscripcionesCreadas.indexOf(propia), 1)
      assert.deepEqual(
        await pedir(`/alumnos/${origen.id}/materias`, { token: alumno.token }),
        [],
      )
    } finally {
      // Solo damos de baja los registros que creo esta ejecucion; nunca borramos fisicamente.
      for (const inscripcion of inscripcionesCreadas) {
        await pedir('/inscripciones', {
          method: 'DELETE',
          token: admin.token,
          body: { id: inscripcion.id },
        })
      }
      if (materiaCreada)
        await pedir(`/materias/${materiaCreada.id}`, {
          method: 'DELETE',
          token: admin.token,
        })
      for (const alumno of alumnosCreados)
        await pedir(`/alumnos/${alumno.id}`, {
          method: 'DELETE',
          token: admin.token,
        })
    }

    const todos = await pedir('/alumnos?todos=true', { token: admin.token })
    assert.ok(
      alumnosCreados.every((alumno) =>
        todos.some((item) => item.id === alumno.id && item.fechaBaja),
      ),
    )
    const todasMaterias = await pedir('/materias?todos=true', {
      token: admin.token,
    })
    assert.ok(
      todasMaterias.some(
        (item) => item.id === materiaCreada.id && item.fechaBaja,
      ),
    )
  },
)
