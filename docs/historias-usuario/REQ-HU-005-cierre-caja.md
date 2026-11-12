# REQ-HU-005 — Cierre diario de caja

## Historia de usuario

**Como** vendedor, **quiero** cerrar la caja de una fecha reportando el efectivo contado, **para** compararlo con las ventas y premios pagados e identificar diferencias.

## Requisitos funcionales

- **RF-HU-005-01:** El sistema debe permitir al vendedor consultar el resumen de su caja para una fecha; la fecha debe usar la zona horaria configurada si no se proporciona.
- **RF-HU-005-02:** El resumen debe incluir ventas válidas, tiquetes anulados, pagos de premios y saldo esperado; los tiquetes anulados no deben sumar a las ventas.
- **RF-HU-005-03:** El cierre debe aceptar un efectivo reportado entero y no negativo.
- **RF-HU-005-04:** El sistema debe impedir un segundo cierre para el mismo vendedor y fecha.
- **RF-HU-005-05:** El sistema debe registrar el efectivo reportado, el saldo esperado, la diferencia y el estado `CUADRADA`, `SOBRANTE` o `FALTANTE`.

## Criterios de aceptación

- El resumen responde `200` con los totales del vendedor y fecha solicitados.
- Un cierre válido responde `201` e informa la diferencia entre efectivo reportado y saldo esperado.
- Una diferencia negativa produce estado `FALTANTE`; una diferencia positiva, `SOBRANTE`; y una diferencia cero, `CUADRADA`.
- Un valor no entero o negativo se rechaza con `400`.
- Un cierre duplicado se rechaza con `409`.

## Trazabilidad

- **Endpoints:** `GET /api/v1/caja/resumen`, `POST /api/v1/caja/cierre`
- **Implementación:** `src/controllers/cajaController.js`, `src/services/cajaService.js`, `src/utils/fechas.js`
- **Pruebas:** `tests/caja.test.js` — `test_resumen_caja_diario`, `test_cierre_caja_con_faltante`
- **Estado QA:** Cubierto por pruebas automatizadas.
