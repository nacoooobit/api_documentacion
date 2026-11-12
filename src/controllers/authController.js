/**
 * Porque: las solicitudes HTTP necesitan conectarse con las reglas de identidad.
 * Para qué: exponer autenticación y perfil según el rol del operador.
 */
const authService = require('../services/authService');

/**
 * Autentica a un usuario para habilitar las operaciones del puesto según su rol.
 * La identidad se valida antes de emitir un token para proteger los flujos de venta,
 * administración de sorteos y caja.
 *
 * @api POST /api/v1/auth/login
 * @apiDescription Emite un JWT para una cuenta activa con credenciales válidas.
 * @param {Object} req Solicitud HTTP; `req.body` contiene `usuario` y `password`.
 * @param {Object} res Respuesta Express con el token y el perfil público.
 * @returns {void}
 * @traceability REQ-HU-001
 */
exports.login = (req, res) => {
  res.json(authService.login(req.body.usuario, req.body.password));
};

exports.perfil = (req, res) => {
  res.json(authService.perfil(req.usuario));
};
