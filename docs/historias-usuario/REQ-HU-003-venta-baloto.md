# REQ-HU-003 — Venta de tiquetes de Baloto

## Historia de usuario

**Como** vendedor, **quiero** registrar jugadas de Baloto para un sorteo abierto, **para** entregar un comprobante válido y consultar sus premios cuando se publique el resultado.

## Requisitos funcionales

- **RF-HU-003-01:** Solo un usuario con rol `VENDEDOR` puede vender tiquetes de Baloto.
- **RF-HU-003-02:** El sistema debe aceptar la venta únicamente para un sorteo de tipo `BALOTO` que esté abierto y dentro del horario de ventas.
- **RF-HU-003-03:** Cada tiquete debe contener entre una y diez jugadas.
- **RF-HU-003-04:** Una jugada manual debe contener exactamente cinco números enteros, únicos y entre 1 y 43, además de una superbalota entre 1 y 16.
- **RF-HU-003-05:** El sistema debe permitir solicitar una jugada aleatoria y generar números válidos sin repetición.
- **RF-HU-003-06:** El sistema debe calcular el total multiplicando la cantidad de jugadas por el precio unitario configurado y registrar el tiquete como `ACTIVO`, asociado al vendedor y al sorteo.

## Criterios de aceptación

- Una venta válida responde `201`, genera un código con prefijo `BL-` y calcula el precio total.
- Una jugada con números repetidos, fuera de rango o con una superbalota inválida se rechaza con `400`.
- Un usuario que no sea vendedor recibe `403`.
- Un sorteo que no esté abierto para ventas se rechaza.

## Trazabilidad

- **Endpoint:** `POST /api/v1/tickets/baloto`
- **Implementación:** `src/controllers/ticketController.js`, `src/services/ticketService.js`, `src/services/balotoService.js`, `src/services/sorteoService.js`
- **Pruebas:** `tests/tickets.test.js` — `test_venta_baloto`; `tests/baloto.test.js` — `test_jugada_aleatoria_valida`, `test_jugada_numeros_repetidos`
- **Estado QA:** Cubierto por pruebas automatizadas.
