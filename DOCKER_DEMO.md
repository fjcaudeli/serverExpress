# Backend en Docker: preparacion y guion de demostracion

## Alcance

Se contiene solamente el backend de Node.js y Express. MySQL sigue instalado
en Windows con la base `tp_integrador` existente. React sigue con Vite en Windows.
No se crea otra base ni se ejecuta el seed automaticamente.

```text
React / Vite (Windows, puerto 5173)
  -> proxy /api
  -> puerto 3000 de Windows
  -> Express / Node (contenedor, puerto 3000)
  -> host.docker.internal:3306
  -> MySQL (Windows)
```

Esto permite mostrar el backend en un contenedor sin ampliar el trabajo a
contenedores para el frontend y la base. No afirmar que todo el sistema esta
contenedorizado ni que el despliegue productivo esta resuelto.

## Requisito previo: Docker Desktop operativo

Abrir Docker Desktop y esperar a que el motor de contenedores Linux funcione.
En una terminal nueva de VS Code, comprobar:

```powershell
docker version
docker compose version
```

`docker version` debe mostrar Client y Server. Ver solo Client no demuestra
que el motor este funcionando. Si docker no se reconoce, completar primero la
instalacion y abrir una terminal nueva; puede ser necesario reiniciar VS Code.

La instalacion por usuario de esta PC deja el comando en
`%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin`. Si VS Code se abrio antes
de instalar Docker y su terminal no reconoce el comando, volver a abrir VS Code
o actualizar el PATH solo de esa terminal:

```powershell
$env:Path = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin;$env:Path"
```

Si el instalador informa requisitos pendientes de Windows, atenderlos antes de
seguir. No habilitar funciones, aceptar acuerdos ni reiniciar la PC
automaticamente desde el proyecto.

## Archivos agregados

- `Dockerfile`: receta para construir la imagen del backend.
- `.dockerignore`: excluye secretos, dependencias locales y archivos innecesarios
  del contexto de construccion.
- `compose.yaml`: define como construir y ejecutar el contenedor de la API.

La imagen parte de `node:24-bookworm-slim`. `npm ci --omit=dev` instala las
dependencias del lockfile para Linux, sin reutilizar binarios de Windows.
`COPY src ./src` incorpora el codigo del backend. `USER node` evita ejecutar
el proceso como root. `CMD` arranca `src/index.js`.

`EXPOSE 3000` documenta el puerto interno; no lo publica por si solo.
`ports` en Compose publica ese puerto en Windows. Se limita a `127.0.0.1`
para esta demostracion local.

## Configuracion y MySQL

Compose usa el `.env` habitual de la API mediante `env_file`, pero no lo mete
en la imagen. No subir `.env` a Git ni mostrarlo al profesor.

Dentro del contenedor, `localhost` se refiere al propio contenedor, no a Windows.
Por eso Compose reemplaza solamente `DB_HOST` por `host.docker.internal` y fija
el puerto interno de Express en 3000. Las demas variables vienen del `.env`.
Este nombre especial esta soportado por Docker Desktop.

No se modificaron contrasenas, usuarios, permisos ni la configuracion de MySQL.
Cuando Docker este operativo hay que probar realmente el login y las consultas:
MySQL debe aceptar la conexion que viene desde Docker Desktop. Si devuelve
Access denied, no dar permisos globales a root ni modificar el firewall a ciegas;
primero revisar el error y decidir el ajuste minimo.

## Primera puesta en marcha

Estos pasos requieren Docker Desktop funcionando. La imagen ya se construyo
y se verificaron la conexion a MySQL, el login y las consultas en esta PC.

1. Mantener MySQL iniciado.
2. Si Express esta ejecutandose directamente con Node en el puerto 3000,
   detener ESA instancia antes de ocupar el mismo puerto con Docker. En una
   terminal propia de `npm start`, usar Ctrl+C. Si esta en segundo plano,
   identificar el proceso antes de detenerlo. No terminar procesos desconocidos.
3. Desde `ServerExpress`, ejecutar:

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 20 api
```

El primer arranque puede descargar la imagen de Node e instalar paquetes.
Prepararlo antes de la reunion. `-d` deja el servicio ejecutandose en segundo
plano. `--build` construye o actualiza la imagen si hace falta.

4. Los logs deben mostrar conexion exitosa con MySQL y el puerto 3000.
5. Comprobar la respuesta HTTP:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/
```

6. Mantener o levantar el frontend en otra terminal:

```powershell
cd frontend
npm run dev
```

7. Abrir Campus en el navegador integrado de VS Code y probar login y listado.
   La URL del front y el proxy no cambian si la API se publica en el puerto 3000.

IMPORTANTE: El GET de la raiz solo prueba HTTP. El backend actual puede seguir
escuchando aunque falle MySQL, por lo que un contenedor Up y un GET exitoso NO
son suficientes para afirmar que funciona el sistema: tambien hay que probar
el login y una consulta autenticada.

### Prueba inicial sin detener el Node local

Para verificar primero el contenedor en otro puerto, se puede usar temporalmente:

```powershell
$env:API_PORT = '3001'
docker compose up -d --build
Invoke-RestMethod http://127.0.0.1:3001/
```

Esto no cambia automaticamente el proxy del front: en esta prueba inicial el
front sigue apuntando al 3000. Despues de verificar el contenedor y MySQL, detener
la instancia local de Node y recrear la API con el puerto habitual:

```powershell
Remove-Item Env:API_PORT
docker compose up -d --force-recreate
```

No afirmar que React esta usando Docker mientras siga consultando al Node local.

## Guion para mostrarlo compartiendo solo VS Code

Agregar este bloque al principio del guion de Campus, antes de la demo de React.
La puesta en marcha de Docker reemplaza `npm start` para el backend. No ejecutar
los dos sobre el mismo puerto. El resto del recorrido de alumnos y materias sigue
igual una vez verificados los endpoints contra el contenedor.

### 1. Mostrar la receta

Abrir con Ctrl+P: `Dockerfile`.

Decir:

> Este Dockerfile define la imagen del backend. Parte de Node en Linux, instala
> las dependencias declaradas en el lockfile y copia el codigo de Express. Al
> iniciar el contenedor, el comando final ejecuta la API. La imagen es la receta
> construida; el contenedor es una instancia de esa imagen en ejecucion.

Senalar FROM, WORKDIR, COPY, RUN, USER, EXPOSE y CMD. No leer cada comentario.

### 2. Mostrar como se ejecuta

Abrir con Ctrl+P: `compose.yaml`.

Decir:

> Compose me permite repetir el arranque con la misma configuracion. Publico el
> puerto 3000 del contenedor en el 3000 de mi PC. Las variables se pasan al
> ejecutar, sin guardar el archivo de credenciales en la imagen. En este alcance
> solo el backend esta en Docker: MySQL y React siguen en Windows.

Senalar `env_file`, el puerto y `DB_HOST`. No abrir el archivo `.env`.

### 3. Mostrar evidencia del contenedor real

En la terminal integrada de VS Code, desde ServerExpress:

```powershell
docker compose ps
docker compose logs --tail 20 api
docker compose top api
docker compose exec api node --version
docker compose exec api node -p "process.platform"
```

Decir:

> Aca se ve el servicio en ejecucion, la imagen que usa y el puerto publicado.
> Los logs muestran el arranque de Express y la conexion a MySQL. El proceso de
> Node esta dentro del contenedor; el ultimo comando confirma que corre en Linux,
> aunque yo estoy presentando desde Windows.

Comprobar el resultado antes de decirlo. Si los logs muestran un error de base,
no presentar el contenedor como una integracion terminada.

### 4. Mostrar que React usa esa API

Ir a la pestana Campus del navegador integrado. Hacer el login de administrador
y abrir Alumnos. La API local con Node debe estar detenida para que no haya
confusion sobre que proceso atiende el puerto 3000.

Decir:

> La interfaz sigue haciendo las mismas peticiones. Lo que cambio es donde corre
> Express: ahora esas peticiones las responde el backend del contenedor. Las
> reglas de negocio, los middlewares y los endpoints siguen siendo los mismos.

Continuar con el guion principal de Campus.

### 5. Prueba de parada, solamente si la ensayaste

Es opcional. Se hace con el contenedor publicado en el puerto habitual, sin un
Node alternativo atendiendo el 3000:

```powershell
docker compose stop api
```

En la app, tocar Actualizar en el listado y mostrar el error de conexion. Luego:

```powershell
docker compose start api
docker compose logs --tail 10 api
```

Esperar la conexion con MySQL y volver a tocar Actualizar. La lista deberia
recuperarse. No hacer F5, porque reinicia la sesion en memoria del frontend.

Decir:

> Al detener el contenedor, la interfaz deja de recibir datos. Al iniciarlo,
> vuelve a consultar la API. Eso permite ver que el backend que esta usando
> realmente es el del contenedor.

Dejar la API iniciada antes de seguir la demo.

## Comandos de uso habitual

```powershell
docker compose up -d
docker compose ps
docker compose logs --tail 20 api
docker compose stop api
docker compose start api
docker compose down
```

`up -d` crea o arranca el servicio; si cambio el codigo, usar `up -d --build`.
No hay un montaje del codigo local, asi que editar un archivo no cambia una
imagen ya construida. `stop` y `start` conservan el contenedor; `down` lo elimina
junto con la red de este proyecto. La base MySQL no esta en Compose y sus datos
no se borran con esos comandos.

No mostrar `docker inspect` completo, `printenv` ni `docker compose config` sin
`--quiet` al compartir pantalla: pueden revelar variables con credenciales.

## Verificaciones realizadas

- Motor de Docker Desktop en modo Linux.
- Imagen `tp-integrador-api:local` construida desde el Dockerfile.
- Contenedor `tp-integrador-api` publicado en `127.0.0.1:3000`.
- Node 24 dentro del contenedor, con UID 1000, no root.
- El archivo `/app/.env` no existe dentro de la imagen.
- Conexion exitosa al MySQL de Windows, sin cambiar cuentas ni permisos.
- Login y consulta de alumnos a traves del proxy de Vite en 5173.
- Las nueve pruebas del front, incluida la integracion HTTP real, pasaron
  usando el backend de Docker. Los datos de esa prueba recibieron baja logica.

La API que antes corria directamente con Node en Windows se detuvo; la que
ahora atiende el puerto 3000 es la del contenedor. La prueba de parada del paso
5 es opcional y debe ensayarse antes de usarla en la presentacion.

### Pendiente de seguridad, fuera de este cambio

`npm audit --omit=dev` detecto cinco vulnerabilidades en las dependencias
existentes del backend: dos moderadas, dos altas y una critica. Los paquetes
informados fueron mysql2, qs, joi, body-parser y proxy-addr. No se ejecuto
`npm audit fix` ni se modificaron versiones en esta tarea. Revisarlas antes
de publicar el proyecto; que funcione dentro de Docker no elimina ese pendiente.

## Referencias oficiales

- Docker Desktop para Windows: https://docs.docker.com/desktop/setup/install/windows-install/
- Acceder a servicios de Windows desde el contenedor: https://docs.docker.com/desktop/features/networking/networking-how-tos/
- Variables y servicios en Compose: https://docs.docker.com/reference/compose-file/services/
