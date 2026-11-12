/**
 * Porque: cada venta y movimiento necesita un comprobante consultable.
 * Para qué: exponer la gestión HTTP de ventas, anulaciones y pagos de tiquetes.
 */
const ticketService = require('../services/ticketService');

/**
 * Registra apuestas de Chance para un sorteo abierto y deja constancia de su vendedor.
 * Este comprobante permite al puesto controlar la venta y posteriormente contrastar
 * las apuestas contra el resultado oficial al liquidar los premios.
 *
 * @api POST /api/v1/tickets/chance
 * @apiDescription Crea un tiquete de Chance con una o más apuestas válidas.
 * @param {Object} req Solicitud HTTP autenticada; incluye el vendedor en `req.usuario`
 *   y `sorteoId`, `apuestas` y opcionalmente `cliente` en `req.body`.
 * @param {Object} res Respuesta Express con el tiquete creado.
 * @returns {void}
 * @traceability REQ-HU-002
 */
exports.venderChance = (req, res) => res.status(201).json(ticketService.venderChance(req.usuario, req.body));

/**
 * Registra las jugadas de Baloto como tiquete asociado al sorteo y al vendedor.
 * Mantener cada jugada y su precio en un comprobante permite verificar la participación
 * y resolver después el premio frente al resultado publicado.
 *
 * @api POST /api/v1/tickets/baloto
 * @apiDescription Crea un tiquete de Baloto con jugadas manuales o aleatorias válidas.
 * @param {Object} req Solicitud HTTP autenticada; incluye el vendedor en `req.usuario`
 *   y `sorteoId`, `jugadas` y opcionalmente `cliente` en `req.body`.
 * @param {Object} res Respuesta Express con el tiquete creado.
 * @returns {void}
 * @traceability REQ-HU-003
 */
exports.venderBaloto = (req, res) => res.status(201).json(ticketService.venderBaloto(req.usuario, req.body));

exports.listar = (req, res) => res.json(ticketService.listar(req.usuario, req.query));

exports.consultar = (req, res) => res.json(ticketService.consultar(req.params.codigo));

exports.anular = (req, res) =>
  res.json(ticketService.anular(req.params.codigo, req.usuario, req.body.motivo));

/**
 * Registra el desembolso de un premio válido asociado a un tiquete ganador.
 * La validación de sorteo jugado, estado activo, premio y caducidad evita pagar
 * premios no liquidados o duplicar pagos en la operación de caja.
 *
 * @api POST /api/v1/tickets/:codigo/pagar
 * @apiDescription Paga el premio reclamable del tiquete y lo marca como pagado.
 * @param {Object} req Solicitud HTTP autenticada; `req.params.codigo` identifica el
 *   tiquete y `req.usuario` identifica al vendedor que procesa el pago.
 * @param {Object} res Respuesta Express con el registro del pago.
 * @returns {void}
 * @traceability REQ-HU-004
 */
exports.pagar = (req, res) => res.json(ticketService.pagarPremio(req.params.codigo, req.usuario));
