/**
 * Porque: los sorteos requieren operaciones HTTP de consulta y administración.
 * Para qué: crear sorteos, consultar su estado y registrar resultados oficiales.
 */
const sorteoService = require('../services/sorteoService');

exports.listar = (req, res) => res.json(sorteoService.listar(req.query));

exports.obtener = (req, res) => res.json(sorteoService.obtener(req.params.id));

exports.crear = (req, res) => res.status(201).json(sorteoService.crear(req.body));

exports.registrarResultado = (req, res) =>
  res.json(sorteoService.registrarResultado(req.params.id, req.body.resultado));
