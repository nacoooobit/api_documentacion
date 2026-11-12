# REQ-HU-001 — Autenticación de usuarios

## Historia de usuario

**Como** usuario del puesto de chance, **quiero** iniciar sesión con mis credenciales, **para** acceder a las operaciones permitidas para mi rol.

## Requisitos funcionales

- **RF-HU-001-01:** El sistema debe exigir usuario y contraseña para iniciar sesión.
- **RF-HU-001-02:** El sistema debe rechazar credenciales incorrectas y cuentas inactivas.
- **RF-HU-001-03:** Si las credenciales son válidas y la cuenta está activa, el sistema debe emitir un token JWT con la identidad y el rol del usuario.
- **RF-HU-001-04:** La respuesta debe incluir el token y el perfil público del usuario, sin exponer su contraseña.
- **RF-HU-001-05:** Las rutas protegidas deben exigir un token Bearer válido y aplicar las restricciones de rol definidas para cada operación.

## Criterios de aceptación

- Con credenciales válidas de una cuenta activa, el login responde `200` e incluye `token` y `usuario`.
- Con una contraseña incorrecta, el login responde `401`.
- Con datos obligatorios ausentes, el login responde `400`.
- Una ruta protegida sin token válido responde `401`.
- El perfil de la respuesta no contiene el campo de contraseña.

## Trazabilidad

- **Endpoint:** `POST /api/v1/auth/login`
- **Implementación:** `src/controllers/authController.js`, `src/services/authService.js`, `src/middlewares/auth.js`
- **Pruebas:** `tests/auth.test.js` — `test_login_exitoso`, `test_login_credenciales_invalidas`, `test_ruta_protegida_sin_token`
- **Estado QA:** Cubierto por pruebas automatizadas.
