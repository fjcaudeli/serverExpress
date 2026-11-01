# Explicacion del codigo - App Exchange

Este documento explica los archivos principales del proyecto. No se explican los archivos `__init__.py` porque solo sirven para que Python reconozca las carpetas como paquetes.

## Idea general del proyecto

La aplicacion permite:

- crear usuarios;
- iniciar sesion;
- abrir cuentas en monedas extranjeras;
- ingresar saldo en ARS;
- comprar divisas usando ARS;
- vender divisas y recibir ARS;
- guardar los datos en archivos JSON o en una base de datos con SQLObject;
- consultar cotizaciones desde la API de Fixer.io.

El proyecto esta separado en capas:

- `presentation`: se encarga del menu por consola.
- `business`: contiene la logica de negocio.
- `data`: contiene persistencia, configuracion y conexion con Fixer.

La idea principal es que la capa de presentacion no maneje archivos, base de datos ni API directamente. La presentacion solo pide datos al usuario y llama a la capa de negocio.

---

# main.py

```python
from presentation.login import Login
login = Login()
```

Importa la clase `Login`, que maneja toda la interaccion por consola, y crea un objeto.

```python
print(20*'#',"Bienvenido a la App Exchange",20*'#')
```

Muestra el mensaje de bienvenida una sola vez al iniciar la aplicacion.

```python
rv = True
while(rv):
    rv=login.menu()
```

Mantiene la aplicacion en ejecucion mientras `login.menu()` devuelva `True`.

Si el usuario elige salir, `menu()` devuelve `False` y termina el programa.

---

# presentation/login.py

Este archivo pertenece a la capa de presentacion. Su responsabilidad es mostrar menus, pedir datos por consola y mostrar mensajes. No guarda datos directamente ni calcula cotizaciones por su cuenta.

```python
from business.LoginHelper import LoginHelper
from getpass import getpass
```

Importa `LoginHelper`, que contiene la logica de negocio. Tambien importa `getpass`, que permite ingresar contrasenas sin mostrarlas en pantalla.

## Clase Login

```python
class Login:
```

Representa la interfaz por consola.

```python
def __init__(self):
    self.loginHelper = LoginHelper()
```

Cuando se crea un objeto `Login`, tambien se crea un `LoginHelper`. A partir de ahi, la presentacion delega la logica en esa clase.

## registerUsuario

Sirve para crear un usuario.

Pasos:

1. Pide el nombre de usuario.
2. Lo sanitiza usando `sanitize`.
3. Verifica si ya existe con `checkUserAvailable`.
4. Pide la contrasena dos veces.
5. Verifica que ambas contrasenas coincidan.
6. Guarda el usuario.
7. Muestra `usuario creado exitosamente`.

Si el usuario ya existe, el error aparece antes de pedir las contrasenas.

## iniciarSesion

Sirve para iniciar sesion.

Pasos:

1. Pide usuario.
2. Sanitiza el texto.
3. Pide contrasena.
4. Verifica usuario y contrasena.
5. Si todo esta bien, muestra bienvenida y entra al menu de cuentas.

Si hay error, muestra el mensaje y vuelve al menu principal.

## abrirCuenta

Muestra un submenu para abrir cuentas.

Opciones:

- listar monedas disponibles;
- ingresar una moneda;
- volver.

Cuando la cuenta se crea bien, vuelve al menu principal de cuentas.

## listarMonedas

Pide a la capa de negocio el listado de monedas disponibles en Fixer.

La presentacion solo las muestra con:

```python
print(codigo,"-",nombre)
```

## ingresarMonedaCuenta

Pide el codigo de moneda y llama a:

```python
self.loginHelper.abrir_cuenta(username,moneda)
```

Si la moneda es valida y la cuenta no existe, la crea.

No permite abrir cuenta en `ARS`, porque `ARS` es la moneda base que se ingresa como saldo, no una divisa extranjera.

## listarCuentas

Muestra las cuentas del usuario con su saldo.

La informacion viene desde:

```python
self.loginHelper.listar_cuentas(username)
```

## ingresarArs

Permite ingresar pesos argentinos.

Antes de pedir el monto, muestra el saldo actual en ARS.

Luego pide el monto, lo envia a la capa de negocio y muestra el saldo actualizado.

## elegirDivisa

Este metodo se usa tanto para comprar como para vender.

Lista solo las divisas extranjeras que el usuario tiene abiertas. No incluye `ARS`.

Ejemplo:

```text
1 - USD
2 - EUR
0 - Cancelar
```

Valida:

- que se ingrese un numero;
- que el numero este dentro del rango;
- que `0` cancele la operacion.

## comprarDivisa

Permite comprar una divisa extranjera usando saldo en ARS.

Pasos:

1. Llama a `elegirDivisa`.
2. Si se cancela, termina la operacion.
3. Verifica que el usuario tenga saldo ARS mayor a cero.
4. Muestra saldo ARS.
5. Muestra la cotizacion:

```text
cotizacion: 1.00 USD - 1478.08 ARS
```

6. Pide la cantidad de divisa a comprar.
7. Calcula el total a pagar.
8. Pide confirmacion.
9. Si confirma, realiza la compra y muestra el saldo ARS actualizado.

## venderDivisa

Permite vender una divisa extranjera y recibir ARS.

Pasos:

1. Llama a `elegirDivisa`.
2. Verifica que la divisa elegida tenga saldo mayor a cero.
3. Pide la cantidad a vender.
4. Calcula cuanto se recibe en ARS.
5. Pide confirmacion.
6. Si confirma, realiza la venta.
7. Muestra saldo ARS actualizado y saldo actualizado de la divisa vendida.

## menuCuentas

Es el menu que aparece despues de iniciar sesion.

Opciones:

```text
1-abrir cuenta
2-listar cuentas
3-ingresar ARS
4-comprar divisa
5-vender divisa
6-cerrar sesion
0-salir
```

`6` vuelve al menu de login.

`0` termina la aplicacion.

## menu

Es el menu inicial:

```text
1-iniciar sesion
2-crear usuario
0-salir
```

Devuelve `True` o `False` para que `main.py` sepa si debe seguir ejecutando la aplicacion.

---

# business/LoginHelper.py

Este archivo contiene la logica principal del sistema.

La presentacion llama a esta clase para validar usuarios, cuentas, saldos, compras y ventas.

```python
import bcrypt
from decimal import Decimal, InvalidOperation, ROUND_DOWN
# ! Persistencia JSON:
from data.dataHelper import Datahelper
# ! Persistencia SQLObject:
# from data.dataHelperSqlObject import Datahelper
from data.fixerApi import FixerApi
```

Se usa:

- `bcrypt` para guardar contrasenas hasheadas;
- `Decimal` para trabajar con dinero sin usar `float`;
- `Datahelper` para acceder a la capa de persistencia elegida;
- `FixerApi` para obtener cotizaciones.

## __init__

```python
self.dataHelper  = Datahelper()
self.fixerApi = FixerApi()
```

La clase trabaja contra una clase llamada `Datahelper`. Esa clase puede venir de la implementacion JSON o de la implementacion SQLObject.

El cambio de persistencia se hace modificando el import de arriba:

```python
# JSON
from data.dataHelper import Datahelper

# SQLObject
from data.dataHelperSqlObject import Datahelper
```

Lo importante es que ambas implementaciones tienen la misma clase `Datahelper` y los mismos metodos publicos. Por eso el resto de `LoginHelper` no necesita cambiar.

Tambien crea el acceso a Fixer. `FixerApi` usa Singleton.

## sanitize

```python
return text.replace(" ", "").lower()
```

Normaliza el usuario:

- quita espacios;
- pasa todo a minusculas.

Asi `Juan`, `juan` y `j u a n` quedan tratados de forma uniforme.

## dosDecimales

```python
return numero.quantize(Decimal("0.01"),rounding=ROUND_DOWN)
```

Deja los importes con dos decimales, truncando hacia abajo.

Esto se usa para saldos, compras, ventas y montos en ARS.

## montoDecimal

Convierte un texto ingresado por el usuario a `Decimal`.

Tambien permite usar coma o punto:

```python
Decimal(str(monto).replace(",","."))
```

Valida que el monto sea mayor a cero.

## checkEqPwd

Verifica que las dos contrasenas ingresadas al registrar usuario sean iguales.

Si son distintas, lanza:

```python
ValueError("los passwords no son iguales")
```

## checkUserAvailable

Verifica que el usuario no exista antes de crearlo.

Esto evita pedir la contrasena dos veces cuando el nombre de usuario ya esta usado.

## prepareAndStorePwd

Se encarga de preparar y guardar la contrasena.

Pasos:

1. Verifica que el usuario este disponible.
2. Codifica la contrasena en UTF-8.
3. Genera el hash con `bcrypt`.
4. Guarda el usuario con la contrasena hasheada.

La contrasena real nunca se guarda en texto plano.

## checkUserAndPwd

Valida login.

Primero busca el hash guardado del usuario.

Si no existe, tira error.

Despues compara la contrasena ingresada con el hash usando:

```python
bcrypt.checkpw(...)
```

## abrir_cuenta

Crea una cuenta en una moneda extranjera.

Valida:

- que el usuario exista;
- que la moneda tenga exactamente 3 letras;
- que no sea `ARS`;
- que exista en Fixer;
- que el usuario no tenga ya esa cuenta.

Si todo esta bien, crea la cuenta con saldo `0`.

## listar_cuentas

Devuelve las cuentas del usuario.

Si el usuario no existe, lanza error.

## listar_divisas_usuario

Devuelve solo las monedas extranjeras abiertas por el usuario.

No incluye `ARS`.

Se usa para que compra y venta muestren opciones numeradas.

## listar_monedas

Devuelve las monedas disponibles desde Fixer.

La capa de negocio no arma el listado por su cuenta, sino que lo pide a `FixerApi`.

## validar_saldo_ars_para_compra

Verifica que el usuario tenga saldo ARS mayor a cero.

Si tiene cero, lanza:

```python
ValueError("tiene saldo 0 de ARS")
```

## saldo_ars

Devuelve el saldo actual en ARS con dos decimales.

## saldo_divisa

Devuelve el saldo de una moneda extranjera especifica.

Si el usuario no tiene esa cuenta, lanza error.

## validar_saldo_divisa_para_venta

Verifica que la cuenta de la divisa exista y que el saldo no sea cero.

Se usa antes de vender.

## cotizacion_desde_ars

Calcula cuanta divisa equivale a 1 ARS.

El flujo actual de compra muestra la cotizacion al reves, es decir:

```text
1.00 DIVISA = N ARS
```

Este metodo queda como auxiliar para la conversion inversa.

## ingresar_ars

Agrega saldo ARS al usuario.

Pasos:

1. Valida que el usuario exista.
2. Convierte el monto a `Decimal`.
3. Obtiene las cuentas.
4. Suma el monto al saldo ARS actual.
5. Guarda las cuentas actualizadas.

## cotizar_compra

Calcula cuanto sale comprar una cantidad de divisa.

Ejemplo:

Si 1 USD vale 1478.08 ARS y se compran 2 USD:

```text
total = 2 * 1478.08
```

Devuelve:

- cotizacion;
- total a pagar en ARS.

## comprar_divisa

Realiza la compra.

Pasos:

1. Usa `cotizar_compra`.
2. Obtiene el saldo ARS.
3. Verifica que alcance.
4. Descuenta ARS.
5. Suma la divisa comprada.
6. Guarda los saldos.

Si no alcanza el saldo, lanza:

```python
ValueError("saldo insuficiente")
```

## cotizar_venta

Calcula cuanto se recibe en ARS al vender una divisa.

Tambien valida:

- que la divisa exista;
- que no sea `ARS`;
- que el usuario tenga cuenta en esa divisa;
- que el saldo de esa divisa no sea cero;
- que no venda mas de lo que tiene.

## vender_divisa

Realiza la venta.

Pasos:

1. Usa `cotizar_venta`.
2. Descuenta la cantidad vendida de la divisa.
3. Suma el total recibido al saldo ARS.
4. Guarda los saldos actualizados.

---

# data/config.py

Este archivo permite leer configuraciones.

```python
from dotenv import load_dotenv

load_dotenv()

def get_config(nombre, valor_por_defecto=""):
```

Usa `python-dotenv` para cargar el archivo `.env`.

`load_dotenv()` lee el archivo `.env` y carga sus valores como variables de entorno.

Despues `get_config` obtiene el valor desde `os.environ`. Si no encuentra la variable, devuelve el valor por defecto.

Esto se usa para:

- `FIXER_API_KEY`;
- `DATABASE_FILE`.

---

# data/dataHelper.py

Esta es la implementacion de persistencia con archivos JSON.

## __init__

```python
self.userFile='users.json'
```

Define el archivo donde se guardan los usuarios.

## addUser

Lee `users.json`, agrega el usuario y vuelve a guardar el archivo.

Si el archivo no existe, arranca con un diccionario vacio.

## getUser

Busca un usuario dentro de `users.json`.

Si no existe el archivo o el usuario no esta, devuelve `None`.

Esto evita que el programa se rompa con `FileNotFoundError` o `KeyError`.

## getAccountFile

Devuelve el nombre del archivo de cuentas de un usuario.

Ejemplo:

```text
franco.json
```

## getAccounts

Lee el archivo de cuentas del usuario.

Si el archivo no existe, devuelve `{}`.

## saveAccounts

Guarda el diccionario de cuentas en el archivo correspondiente al usuario.

## serialize

Convierte un diccionario de Python a JSON y lo escribe en archivo.

## deserialize

Lee un archivo JSON y lo convierte nuevamente en un diccionario de Python.

---

# data/dataHelperSqlObject.py

Esta es la segunda implementacion de persistencia, usando base de datos relacional con SQLObject.

Tiene la misma interfaz publica que `dataHelper.py`:

- `addUser`;
- `getUser`;
- `getAccounts`;
- `saveAccounts`.

Gracias a eso, la capa de negocio puede usar cualquiera de las dos sin cambiar su logica interna.

Para usar esta implementacion, en `business/LoginHelper.py` se comenta el import de JSON y se descomenta el import de SQLObject:

```python
# from data.dataHelper import Datahelper
from data.dataHelperSqlObject import Datahelper
```

## Clase Usuario

```python
class Usuario(SQLObject):
    username = StringCol()
    hashedPwd = StringCol()
```

Representa la tabla de usuarios.

Guarda:

- nombre de usuario;
- contrasena hasheada.

## Clase Cuenta

```python
class Cuenta(SQLObject):
    usuario = ForeignKey("Usuario")
    moneda = StringCol()
    saldo = StringCol()
```

Representa la tabla de cuentas.

Cada cuenta esta relacionada con un usuario mediante `ForeignKey`.

Guarda:

- usuario;
- codigo de moneda;
- saldo.

El saldo se guarda como texto para mantener compatibilidad con la implementacion JSON, y en la capa de negocio se convierte a `Decimal` cuando se opera.

## Clase Datahelper

Es la clase que implementa las operaciones de persistencia usando SQLObject.

Se llama igual que la clase de la version JSON:

```python
class Datahelper:
```

Esto permite que la capa de negocio pueda importar una u otra implementacion con el mismo nombre.

## __init__

Configura la conexion con SQLite.

```python
archivo = get_config("DATABASE_FILE","exchange.db")
sqlhub.processConnection = connectionForURI("sqlite:" + archivo)
```

Despues crea las tablas si no existen:

```python
Usuario.createTable(ifNotExists=True)
Cuenta.createTable(ifNotExists=True)
```

Usa una variable de clase `iniciado` para no inicializar la conexion muchas veces.

## buscarUsuario

Busca un usuario por nombre.

Si lo encuentra, lo devuelve.

Si no, devuelve `None`.

## addUser

Agrega un usuario nuevo.

Si el usuario ya existiera, actualiza la contrasena hasheada.

## getUser

Devuelve el hash de la contrasena del usuario.

Si no existe, devuelve `None`.

## getAccounts

Devuelve las cuentas del usuario como diccionario.

Ejemplo:

```python
{
    "USD": "10.00",
    "ARS": "15000.00"
}
```

Esto mantiene la misma forma de datos que la version JSON.

## saveAccounts

Recibe un diccionario de cuentas y lo guarda en la base de datos.

Si la cuenta ya existe, actualiza el saldo.

Si no existe, crea una nueva fila.

---

# data/fixerApi.py

Este archivo maneja la conexion con la API de Fixer.io.

## Imports principales

```python
import json
from decimal import Decimal, ROUND_DOWN
from urllib.request import urlopen
```

Se usa:

- `json` para interpretar la respuesta de la API;
- `Decimal` para no trabajar con `float`;
- `urlopen` para hacer pedidos HTTP sin agregar otra libreria externa.

## Singleton

```python
class FixerApi:
    _instance = None
```

La clase implementa Singleton para que exista una sola instancia.

```python
def __new__(cls):
    if cls._instance is None:
        cls._instance = object.__new__(cls)
    return cls._instance
```

Si ya existe una instancia, devuelve la misma.

Esto ayuda a no repetir datos y a centralizar las consultas a Fixer.

## __init__

```python
if hasattr(self,"iniciado"):
    return
```

Evita reinicializar el objeto si ya fue creado antes.

Guarda:

- URL base de Fixer;
- API key;
- cotizaciones;
- simbolos.

## leerApiKey

Lee la API key desde configuracion:

```python
return get_config("FIXER_API_KEY","")
```

La clave no queda escrita directamente en el codigo.

## pedir

Hace el pedido HTTP a Fixer.

Construye la URL con:

```python
urlencode({"access_key": self.apiKey})
```

Maneja errores:

- si falta la API key;
- si no se puede consultar Fixer;
- si se alcanzo el limite de consultas;
- si Fixer devuelve `success = False`.

Tambien usa:

```python
json.loads(texto,parse_float=Decimal,parse_int=Decimal)
```

Esto hace que los numeros de la API se lean como `Decimal` y no como `float`.

## obtenerCotizaciones

Pide el endpoint `latest`.

Guarda las cotizaciones en memoria:

```python
self.cotizaciones = datos["rates"]
```

Si ya las habia pedido antes, devuelve las mismas sin volver a consultar.

## obtenerSimbolos

Pide el endpoint `symbols`.

Sirve para listar y validar monedas disponibles.

## listarMonedas

Devuelve las monedas ordenadas alfabeticamente.

Se usa en el submenu de abrir cuenta.

## existeMoneda

Valida si una moneda existe en Fixer.

Tiene un caso especial para `EUR`, porque Fixer suele usar EUR como moneda base.

## cotizacionEnArs

Calcula cuanto vale 1 unidad de una divisa en ARS.

Fixer normalmente devuelve tasas con base EUR. Por eso, para calcular una cotizacion entre ARS y otra moneda, se usa:

```python
valor = cotizaciones["ARS"] / cotizaciones[moneda]
```

Ejemplo conceptual:

- si Fixer informa cuantos ARS equivalen a 1 EUR;
- y cuantos USD equivalen a 1 EUR;
- entonces `ARS / USD` permite obtener cuantos ARS vale 1 USD.

El resultado se devuelve con dos decimales:

```python
quantize(Decimal("0.01"),rounding=ROUND_DOWN)
```

---

# Como explicar el desacople entre capas

Una forma simple de defenderlo:

> La presentacion no sabe si los datos se guardan en JSON o en base de datos. Solo llama a `LoginHelper`. La capa de negocio trabaja con una clase llamada `Datahelper`, que tiene los mismos metodos en ambas implementaciones. Para cambiar la persistencia se cambia el import en `LoginHelper`, pero el resto del codigo de negocio sigue usando los mismos metodos.

---

# Como cambiar entre JSON y base de datos

El cambio ya no se hace desde `.env`.

Ahora se hace en `business/LoginHelper.py`, cambiando el import de la capa de datos.

Para usar archivos JSON:

```python
from data.dataHelper import Datahelper
```

Para usar SQLite con SQLObject:

```python
from data.dataHelperSqlObject import Datahelper
```

Ambas implementaciones tienen una clase llamada `Datahelper` y los mismos metodos publicos:

- `addUser`;
- `getUser`;
- `getAccounts`;
- `saveAccounts`.

Por eso el resto de la aplicacion puede seguir funcionando igual.

El archivo `.env` queda para configuraciones como:

```text
FIXER_API_KEY=...
DATABASE_FILE=exchange.db
```

`DATABASE_FILE` solo se usa cuando esta activa la implementacion SQLObject.

---

# Por que se usa Decimal

Se usa `Decimal` porque el proyecto maneja dinero y saldos.

`float` puede generar errores de precision, por ejemplo:

```text
0.1 + 0.2 = 0.30000000000000004
```

Con `Decimal`, los calculos monetarios son mas controlados.

Ademas, el codigo trunca a dos decimales con `ROUND_DOWN`.

---

# Por que se usa bcrypt

No se guarda la contrasena real.

Se guarda un hash generado con `bcrypt`.

Al iniciar sesion, se compara la contrasena ingresada con el hash guardado.

Esto es mas seguro que guardar la contrasena en texto plano.

---

# Flujo completo de compra

1. El usuario inicia sesion.
2. Abre una cuenta en una moneda extranjera.
3. Ingresa saldo en ARS.
4. Elige comprar divisa.
5. El sistema lista sus divisas abiertas.
6. El usuario elige una por numero.
7. Se muestra saldo ARS y cotizacion.
8. Ingresa cantidad a comprar.
9. El sistema calcula total.
10. Si confirma y tiene saldo suficiente:
    - descuenta ARS;
    - suma la divisa;
    - persiste los cambios.

---

# Flujo completo de venta

1. El usuario inicia sesion.
2. Elige vender divisa.
3. El sistema lista sus divisas abiertas.
4. El usuario elige una por numero.
5. Se valida que tenga saldo de esa divisa.
6. Ingresa cantidad a vender.
7. El sistema calcula cuanto recibe en ARS.
8. Si confirma y tiene saldo suficiente:
    - descuenta la divisa;
    - suma ARS;
    - persiste los cambios.

---

# Archivos de datos y configuracion

Estos archivos no son codigo principal, pero forman parte de la ejecucion:

- `.env`: guarda configuracion sensible, como API key y tipo de persistencia.
- `users.json`: guarda usuarios si se usa persistencia por archivos.
- `exchange.db`: base SQLite si se usa SQLObject.
- `requirements.txt`: lista dependencias (`bcrypt` y `SQLObject`).
- `.venv`: entorno virtual con las dependencias instaladas.
