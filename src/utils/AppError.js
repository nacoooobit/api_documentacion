/**
 * Porque: los errores de negocio necesitan un estado HTTP identificable.
 * Para qué: permitir que el middleware responda con el código adecuado.
 */
class AppError extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

module.exports = AppError;
