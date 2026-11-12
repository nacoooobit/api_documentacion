# REQ-HU-004 — Pago de premios

## Historia de usuario

**Como** vendedor, **quiero** pagar el premio de un tiquete ganador y vigente, **para** registrar el desembolso y evitar que el mismo premio se pague más de una vez.

## Requisitos funcionales

- **RF-HU-004-01:** El pago debe estar disponible para usuarios autenticados con rol `VENDEDOR`.
- **RF-HU-004-02:** El sistema debe permitir el pago solo si el sorteo ya fue jugado, el tiquete está activo y tiene un premio mayor que cero.
- **RF-HU-004-03:** El sistema debe rechazar un tiquete que ya fue pagado, anulado o que no tenga premio.
- **RF-HU-004-04:** El sistema debe rechazar los premios caducados y marcar el tiquete como `CADUCADO`.
- **RF-HU-004-05:** Al realizar el pago, el sistema debe registrar tiquete, código, usuario que paga, valor y fecha; luego debe cambiar el estado del tiquete a `PAGADO`.

## Criterios de aceptación

- Un premio elegible responde `200`, devuelve el registro del pago y marca el tiquete como pagado.
- Un segundo intento de pago para el mismo tiquete se rechaza con `409`.
- Un sorteo no jugado, un tiquete no activo o un tiquete sin premio se rechazan con `409`.
- Un premio fuera del plazo configurado se rechaza con `410`.

## Trazabilidad

- **Endpoint:** `POST /api/v1/tickets/:codigo/pagar`
- **Implementación:** `src/controllers/ticketController.js`, `src/services/ticketService.js`, `src/services/sorteoService.js`
- **Pruebas:** `tests/tickets.test.js` — `test_resultado_y_pago_premio`
- **Estado QA:** Cubierto por pruebas automatizadas.
