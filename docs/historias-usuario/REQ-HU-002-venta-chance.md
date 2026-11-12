# REQ-HU-002 — Venta de tiquetes de Chance

## Historia de usuario

**Como** vendedor, **quiero** registrar apuestas de Chance para un sorteo abierto, **para** entregar un comprobante asociado a mi venta y permitir su liquidación posterior.

## Requisitos funcionales

- **RF-HU-002-01:** Solo un usuario con rol `VENDEDOR` puede vender tiquetes de Chance.
- **RF-HU-002-02:** El sistema debe aceptar la venta únicamente para un sorteo de tipo `CHANCE` que esté abierto y dentro del horario de ventas.
- **RF-HU-002-03:** Cada tiquete debe contener entre una y cinco apuestas.
- **RF-HU-002-04:** Cada apuesta debe tener un número de uno a cuatro dígitos, una modalidad válida y un valor entero dentro del mínimo y máximo configurados, múltiplo de 100.
- **RF-HU-002-05:** La modalidad `COMBINADO` solo debe permitirse con tres o cuatro cifras y cuando el número tenga combinaciones distintas.
- **RF-HU-002-06:** El sistema debe generar un código de tiquete, asociarlo al vendedor y al sorteo, calcular el total y registrarlo como `ACTIVO`.

## Criterios de aceptación

- Una venta válida responde `201`, retorna un código con prefijo `CH-` y calcula el total de las apuestas.
- Un usuario que no sea vendedor recibe `403`.
- Una venta para un sorteo cerrado o fuera del horario permitido se rechaza con `409`.
- Apuestas con formato, modalidad o valor inválidos se rechazan con `400`.

## Trazabilidad

- **Endpoint:** `POST /api/v1/tickets/chance`
- **Implementación:** `src/controllers/ticketController.js`, `src/services/ticketService.js`, `src/services/chanceService.js`, `src/services/sorteoService.js`
- **Pruebas:** `tests/tickets.test.js` — `test_venta_chance`, `test_venta_sorteo_cerrado`, `test_admin_no_vende`; `tests/chance.test.js` — `test_validacion_apuesta_invalida`
- **Estado QA:** Cubierto por pruebas automatizadas.
