/**
 * Porque: las reglas de operación dependen de fechas y horas consistentes.
 * Para qué: centralizar conversiones y cálculos de tiempo.
 */
const { zonaHoraria } = require('../config');

const fechaLocal = (fecha = new Date()) =>
  new Date(fecha).toLocaleDateString('en-CA', { timeZone: zonaHoraria });

const minutosEntre = (desde, hasta = new Date()) =>
  (new Date(hasta).getTime() - new Date(desde).getTime()) / 60000;

const diasEntre = (desde, hasta = new Date()) => minutosEntre(desde, hasta) / 1440;

module.exports = { fechaLocal, minutosEntre, diasEntre };
