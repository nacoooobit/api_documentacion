# Puesto de Chance API

API REST para operar sorteos de **Chance** y **Baloto**: administra usuarios por rol, registra tiquetes, liquida resultados, gestiona pagos y permite conciliar la caja diaria.

El backend usa Node.js y Express, organizado en rutas, controladores y servicios. Esta separación mantiene las reglas de negocio diferenciadas del transporte HTTP; es una arquitectura por capas sencilla, no una implementación completa de Clean Architecture.

> **Estado del proyecto:** los datos se guardan en memoria y se reinician al volver a iniciar el servidor. Esta versión no usa PostgreSQL, MinIO, Docker ni migraciones, por lo que está orientada al desarrollo y pruebas locales.

![Node.js](https://img.shields.io/badge/Node.js-runtime-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![Jest](https://img.shields.io/badge/tests-Jest-C21325?logo=jest&logoColor=white)
![OpenAPI](https://img.shields.io/badge/docs-OpenAPI_3.0-6BA539?logo=swagger&logoColor=white)

## Contenido

- [Funciones](#funciones)
- [Requisitos](#requisitos)
- [Inicio rápido](#inicio-rápido)
- [Configuración](#configuración)
- [Documentación interactiva](#documentación-interactiva)
- [Autenticación](#autenticación)
- [Rutas](#rutas)
- [Errores](#errores)
- [Pruebas](#pruebas)
- [Historias de usuario](#historias-de-usuario)
- [Trazabilidad QA](#matriz-de-trazabilidad-rtm)
- [Limitaciones conocidas](#limitaciones-conocidas)

## Funciones

- Autenticación con JWT y control de acceso por rol (`ADMIN`, `VENDEDOR`).
- Administración de sorteos y registro de resultados.
- Validación y venta de apuestas de Chance y jugadas de Baloto.
- Consulta, anulación y pago de tiquetes, sujeto a sus reglas de negocio.
- Resumen de movimientos y cierre diario de caja.

## Requisitos

- Git.
- Node.js 18 o posterior y npm.

## Inicio rápido

1. Clona el repositorio:

   ```bash
   git clone https://github.com/crgonzalez3212/documentacionApi.git
   cd documentacionApi
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea tu archivo local de configuración:

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

4. Cambia `JWT_SECRET` en `.env` por un secreto propio. No uses el valor de ejemplo en un entorno compartido.

5. Inicia el servidor:

   ```bash
   npm run dev
   ```

La API estará en `http://localhost:3000`. Para iniciar sin `nodemon`, usa `npm start`.

## Configuración

Las variables se leen al iniciar la aplicación. Los valores predeterminados corresponden a `src/config/index.js`.

| Variable | Uso | Predeterminado |
| --- | --- | --- |
| `PORT` | Puerto HTTP. | `3000` |
| `JWT_SECRET` | Firma de los tokens. Debe cambiarse fuera del desarrollo local. | `cambiar-este-secreto` |
| `JWT_EXPIRES_IN` | Vigencia del token JWT. | `8h` |
| `ZONA_HORARIA` | Zona horaria usada en fechas de operación. | `America/Bogota` |
| `MINUTOS_ANULACION` | Límite para que el vendedor anule su tiquete. | `10` |
| `MINUTOS_CIERRE_VENTAS` | Anticipación con la que cierran las ventas antes del sorteo. | `15` |
| `APUESTA_MIN_CHANCE` | Apuesta mínima de Chance. | `500` |
| `APUESTA_MAX_CHANCE` | Apuesta máxima de Chance. | `50000` |
| `VALOR_BALOTO` | Precio por jugada de Baloto. | `5700` |
| `DIAS_CADUCIDAD_PREMIO` | Plazo para reclamar un premio. | `365` |

El contenido del archivo [`.env.example`](.env.example):

```dotenv
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
ZONA_HORARIA=America/Bogota
MINUTOS_ANULACION=10
MINUTOS_CIERRE_VENTAS=15
APUESTA_MIN_CHANCE=500
APUESTA_MAX_CHANCE=50000
VALOR_BALOTO=5700
DIAS_CADUCIDAD_PREMIO=365
```

## Documentación interactiva

Con el servidor iniciado:

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Especificación OpenAPI (JSON):** [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)
- **Salud del servicio:** [http://localhost:3000/health](http://localhost:3000/health)

En Swagger UI puedes revisar esquemas y probar solicitudes. Para rutas protegidas, primero ejecuta el login y luego usa **Authorize** con el token JWT.

## Autenticación

`POST /api/v1/auth/login` recibe usuario y contraseña y devuelve un token. En las siguientes solicitudes protegidas envíalo como token Bearer:

```http
Authorization: Bearer <token>
```

Ejemplo de login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"<usuario>","password":"<contraseña>"}'
```

Las cuentas de demostración se inicializan en el almacén local; no deben considerarse usuarios de producción.

## Rutas

Todas las rutas de negocio comienzan con `/api/v1`.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Público | Inicia sesión y entrega un token. |
| `GET` | `/auth/perfil` | Autenticado | Consulta el perfil asociado al token. |
| `GET` | `/sorteos` | Autenticado | Lista sorteos; acepta filtros `tipo` y `estado`. |
| `GET` | `/sorteos/:id` | Autenticado | Consulta un sorteo. |
| `POST` | `/sorteos` | Administrador | Crea un sorteo. |
| `POST` | `/sorteos/:id/resultado` | Administrador | Registra el resultado y liquida los tiquetes activos. |
| `POST` | `/tickets/chance` | Vendedor | Vende un tiquete de Chance. |
| `POST` | `/tickets/baloto` | Vendedor | Vende un tiquete de Baloto. |
| `GET` | `/tickets` | Autenticado | Lista tiquetes visibles para el usuario; acepta `fecha` y `estado`. |
| `GET` | `/tickets/:codigo` | Autenticado | Consulta un tiquete por código. |
| `POST` | `/tickets/:codigo/anular` | Autenticado | Anula un tiquete si cumple las reglas de propiedad, estado y tiempo. |
| `POST` | `/tickets/:codigo/pagar` | Vendedor | Paga un premio vigente de un sorteo liquidado. |
| `GET` | `/caja/resumen` | Autenticado | Consulta ventas, pagos y saldo esperado; administrador puede indicar `vendedorId`. |
| `POST` | `/caja/cierre` | Vendedor | Registra el efectivo contado y la diferencia de caja. |

### Ejemplo: vender Chance

Requiere un token de vendedor y un sorteo abierto que todavía acepte ventas:

```bash
curl -X POST http://localhost:3000/api/v1/tickets/chance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sorteoId":1,"apuestas":[{"numero":"1234","modalidad":"DIRECTO","valor":2000}]}'
```

Para Baloto, la solicitud usa `sorteoId` y `jugadas`; cada jugada incluye cinco números distintos y una `superbalota`, o `{"aleatoria":true}`.

## Errores

Los errores se devuelven como JSON con la propiedad `error`. Los códigos más comunes son:

| Código | Significado |
| --- | --- |
| `400` | Datos inválidos o JSON mal formado. |
| `401` | Falta un token válido o las credenciales no son válidas. |
| `403` | El rol o usuario no tiene permiso para la operación. |
| `404` | No existe la ruta o el recurso solicitado. |
| `409` | Conflicto con el estado del sorteo, tiquete o caja. |
| `410` | El premio ya caducó. |
| `500` | Error interno del servidor. |

## Pruebas

Ejecuta la suite automatizada con:

```bash
npm test
```

Las pruebas usan Jest y Supertest, reinician el almacén en los flujos que lo requieren y cubren autenticación, reglas de apuestas, tiquetes, caja y disponibilidad de Swagger/OpenAPI.

## Historias de usuario

Cada historia se documenta en su propio archivo e incluye requisitos funcionales, criterios de aceptación y trazabilidad a implementación y pruebas.

- [REQ-HU-001 — Autenticación de usuarios](./docs/historias-usuario/REQ-HU-001-autenticacion.md)
- [REQ-HU-002 — Venta de tiquetes de Chance](./docs/historias-usuario/REQ-HU-002-venta-chance.md)
- [REQ-HU-003 — Venta de tiquetes de Baloto](./docs/historias-usuario/REQ-HU-003-venta-baloto.md)
- [REQ-HU-004 — Pago de premios](./docs/historias-usuario/REQ-HU-004-pago-premios.md)
- [REQ-HU-005 — Cierre diario de caja](./docs/historias-usuario/REQ-HU-005-cierre-caja.md)

## Matriz de Trazabilidad (RTM)

La columna de pruebas identifica casos existentes en `tests/`. “Cubierto” indica que el flujo tiene una prueba automatizada; no implica certificación externa.

| ID HU | Descripción Requisito | Módulo / Controlador | Caso de Prueba | Estado QA |
| --- | --- | --- | --- | --- |
| REQ-HU-001 | Permitir que usuarios activos se autentiquen para operar según su rol, rechazando credenciales inválidas. | `authController.login` | `tests/auth.test.js`: `test_login_exitoso`, `test_login_credenciales_invalidas`, `test_ruta_protegida_sin_token` | Cubierto |
| REQ-HU-002 | Registrar apuestas de Chance válidas asociadas al sorteo y vendedor para respaldar la venta y su liquidación posterior. | `ticketController.venderChance` | `tests/tickets.test.js`: `test_venta_chance`, `test_venta_sorteo_cerrado`, `test_admin_no_vende`; `tests/chance.test.js`: `test_validacion_apuesta_invalida` | Cubierto |
| REQ-HU-003 | Registrar jugadas de Baloto asociadas al sorteo para habilitar la participación y el cálculo de premios. | `ticketController.venderBaloto` | `tests/tickets.test.js`: `test_venta_baloto`; `tests/baloto.test.js`: `test_jugada_aleatoria_valida`, `test_jugada_numeros_repetidos` | Cubierto |
| REQ-HU-004 | Pagar premios de tiquetes ganadores una sola vez, manteniendo el estado y la trazabilidad del desembolso. | `ticketController.pagar` | `tests/tickets.test.js`: `test_resultado_y_pago_premio` | Cubierto |
| REQ-HU-005 | Cerrar la caja diaria comparando el efectivo reportado con el saldo esperado e impedir cierres duplicados. | `cajaController.cerrar` | `tests/caja.test.js`: `test_resumen_caja_diario`, `test_cierre_caja_con_faltante` | Cubierto |

## Limitaciones conocidas

- La persistencia es en memoria; reiniciar el proceso borra ventas, pagos, cierres y cambios en sorteos.
- No hay base de datos, migraciones, almacenamiento de archivos ni despliegue Docker en este repositorio.
- El secreto JWT predeterminado es solo para desarrollo. Configura uno fuerte y privado antes de cualquier despliegue.
# api_documentacion
