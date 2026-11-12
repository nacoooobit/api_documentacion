/**
 * Porque: ventas y pagos deben poder revisarse al final de la jornada.
 * Para qué: exponer el resumen y el cierre de caja de cada vendedor.
 */
const cajaService = require('../services/cajaService');

exports.resumen = (req, res) => {
  const vendedorId = req.usuario.rol === 'ADMIN' && req.query.vendedorId
    ? Number(req.query.vendedorId)
    : req.usuario.id;
  res.json(cajaService.resumen(vendedorId, req.query.fecha));
};

/**
 * Formaliza el cierre diario contrastando el efectivo contado con las ventas y pagos.
 * El resultado evidencia sobrantes o faltantes y evita que una jornada ya cerrada
 * vuelva a contabilizarse en el control operativo del puesto.
 *
 * @api POST /api/v1/caja/cierre
 * @apiDescription Crea el cierre de caja para el vendedor y la fecha indicados.
 * @param {Object} req Solicitud HTTP autenticada; `req.usuario.id` identifica al
 *   vendedor y `req.body` contiene `efectivoReportado` y opcionalmente `fecha`.
 * @param {Object} res Respuesta Express con el cierre creado.
 * @returns {void}
 * @traceability REQ-HU-005
 */
exports.cerrar = (req, res) => res.status(201).json(cajaService.cerrar(req.usuario.id, req.body));
