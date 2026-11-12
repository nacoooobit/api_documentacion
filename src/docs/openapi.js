/**
 * Porque: clientes y personas desarrolladoras necesitan un contrato de la API.
 * Para qué: describir rutas, permisos y formatos para Swagger UI.
 */
const errorResponse = {
  description: 'La solicitud no pudo completarse.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const jsonBody = (schema) => ({
  required: true,
  content: {
    'application/json': { schema },
  },
});

function operation(tag, summary, successCode, successDescription, schema, options = {}) {
  const responses = {
    [successCode]: {
      description: successDescription,
      content: {
        'application/json': { schema },
      },
    },
    400: errorResponse,
  };

  if (options.secured !== false) responses[401] = errorResponse;
  if (options.forbidden) responses[403] = errorResponse;
  if (options.notFound) responses[404] = errorResponse;
  if (options.conflict) responses[409] = errorResponse;

  return {
    tags: [tag],
    summary,
    description: options.description,
    ...(options.parameters ? { parameters: options.parameters } : {}),
    ...(options.body ? { requestBody: jsonBody(options.body) } : {}),
    ...(options.secured === false ? {} : { security: [{ bearerAuth: [] }] }),
    responses,
  };
}

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
};

const codigoParameter = {
  name: 'codigo',
  in: 'path',
  required: true,
  schema: { type: 'string', example: 'CH-A1B2C3D4' },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Puesto de Chance API',
    version: '1.0.0',
    description: 'API para autenticación, sorteos, tiquetes y control de caja.',
  },
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [
    { name: 'Salud' },
    { name: 'Autenticación' },
    { name: 'Sorteos' },
    { name: 'Tiquetes' },
    { name: 'Caja' },
  ],
  paths: {
    '/health': {
      get: operation('Salud', 'Comprobar disponibilidad de la API', 200, 'Servicio disponible.', {
        type: 'object',
        properties: {
          estado: { type: 'string', example: 'ok' },
          hora: { type: 'string', format: 'date-time' },
        },
      }, { secured: false }),
    },
    '/api/v1/auth/login': {
      post: operation('Autenticación', 'Iniciar sesión', 200, 'Token y perfil público del usuario.', {
        $ref: '#/components/schemas/LoginResponse',
      }, {
        secured: false,
        description: 'Valida la cuenta antes de emitir un token que identifica al operador en las demás acciones.',
        body: { $ref: '#/components/schemas/LoginRequest' },
      }),
    },
    '/api/v1/auth/perfil': {
      get: operation('Autenticación', 'Consultar perfil', 200, 'Perfil asociado al token.', {
        $ref: '#/components/schemas/Usuario',
      }),
    },
    '/api/v1/sorteos': {
      get: operation('Sorteos', 'Listar sorteos', 200, 'Sorteos que pueden consultarse para gestionar ventas y resultados.', {
        type: 'array',
        items: { $ref: '#/components/schemas/Sorteo' },
      }, {
        parameters: [
          { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['CHANCE', 'BALOTO'] } },
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['ABIERTO', 'JUGADO'] } },
        ],
      }),
      post: operation('Sorteos', 'Crear sorteo', 201, 'Sorteo abierto para la operación.', {
        $ref: '#/components/schemas/Sorteo',
      }, {
        forbidden: true,
        description: 'Solo administradores pueden preparar un sorteo antes de habilitar la venta de tiquetes.',
        body: { $ref: '#/components/schemas/CrearSorteo' },
      }),
    },
    '/api/v1/sorteos/{id}': {
      get: operation('Sorteos', 'Consultar sorteo', 200, 'Datos del sorteo y su estado.', {
        $ref: '#/components/schemas/Sorteo',
      }, { parameters: [idParameter], notFound: true }),
    },
    '/api/v1/sorteos/{id}/resultado': {
      post: operation('Sorteos', 'Registrar resultado', 200, 'Sorteo liquidado con el resultado registrado.', {
        $ref: '#/components/schemas/Sorteo',
      }, {
        parameters: [idParameter],
        forbidden: true,
        notFound: true,
        conflict: true,
        description: 'Solo administradores pueden registrar el resultado oficial que determina los premios del sorteo.',
        body: {
          type: 'object',
          required: ['resultado'],
          properties: {
            resultado: {
              oneOf: [
                { type: 'string', pattern: '^\\d{4}$', description: 'Resultado de Chance: cuatro dígitos.' },
                { $ref: '#/components/schemas/JugadaBaloto' },
              ],
            },
          },
        },
      }),
    },
    '/api/v1/tickets/chance': {
      post: operation('Tiquetes', 'Vender tiquete de Chance', 201, 'Tiquete con apuestas validadas y vendedor asociado.', {
        $ref: '#/components/schemas/Ticket',
      }, {
        forbidden: true,
        conflict: true,
        description: 'Solo vendedores pueden registrar apuestas como comprobantes para consulta y liquidación posterior.',
        body: { $ref: '#/components/schemas/VentaChance' },
      }),
    },
    '/api/v1/tickets/baloto': {
      post: operation('Tiquetes', 'Vender tiquete de Baloto', 201, 'Tiquete con jugadas validadas y vendedor asociado.', {
        $ref: '#/components/schemas/Ticket',
      }, {
        forbidden: true,
        conflict: true,
        description: 'Solo vendedores pueden registrar jugadas y su costo para comprobar la participación y calcular premios.',
        body: { $ref: '#/components/schemas/VentaBaloto' },
      }),
    },
    '/api/v1/tickets': {
      get: operation('Tiquetes', 'Listar tiquetes', 200, 'Tiquetes visibles para el usuario autenticado.', {
        type: 'array',
        items: { $ref: '#/components/schemas/Ticket' },
      }, {
        parameters: [
          { name: 'fecha', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['ACTIVO', 'ANULADO', 'PAGADO', 'CADUCADO'] } },
        ],
      }),
    },
    '/api/v1/tickets/{codigo}': {
      get: operation('Tiquetes', 'Consultar tiquete', 200, 'Tiquete con información del sorteo y estado de ganador.', {
        $ref: '#/components/schemas/Ticket',
      }, { parameters: [codigoParameter], notFound: true }),
    },
    '/api/v1/tickets/{codigo}/anular': {
      post: operation('Tiquetes', 'Anular tiquete', 200, 'Tiquete anulado con motivo registrado.', {
        $ref: '#/components/schemas/Ticket',
      }, {
        parameters: [codigoParameter],
        notFound: true,
        conflict: true,
        description: 'Permite corregir una venta, manteniendo el motivo y aplicando límites de tiempo y estado.',
        body: {
          type: 'object',
          required: ['motivo'],
          properties: { motivo: { type: 'string', example: 'Error al ingresar la apuesta' } },
        },
      }),
    },
    '/api/v1/tickets/{codigo}/pagar': {
      post: operation('Tiquetes', 'Pagar premio', 200, 'Registro del desembolso del premio.', {
        $ref: '#/components/schemas/Pago',
      }, {
        parameters: [codigoParameter],
        forbidden: true,
        notFound: true,
        conflict: true,
        description: 'Solo vendedores pueden pagar una vez un premio vigente de un sorteo ya liquidado.',
      }),
    },
    '/api/v1/caja/resumen': {
      get: operation('Caja', 'Consultar resumen de caja', 200, 'Totales de venta, premios pagados y saldo esperado.', {
        $ref: '#/components/schemas/ResumenCaja',
      }, {
        parameters: [
          { name: 'fecha', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'vendedorId', in: 'query', schema: { type: 'integer' }, description: 'Solo aplica para administradores.' },
        ],
      }),
    },
    '/api/v1/caja/cierre': {
      post: operation('Caja', 'Cerrar caja', 201, 'Cierre con diferencia y estado de conciliación.', {
        $ref: '#/components/schemas/CierreCaja',
      }, {
        forbidden: true,
        conflict: true,
        description: 'Solo vendedores pueden cerrar su caja; la diferencia con el saldo esperado evidencia faltantes o sobrantes.',
        body: {
          type: 'object',
          required: ['efectivoReportado'],
          properties: {
            efectivoReportado: { type: 'integer', minimum: 0 },
            fecha: { type: 'string', format: 'date' },
          },
        },
      }),
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          usuario: { type: 'string' },
          nombre: { type: 'string' },
          rol: { type: 'string', enum: ['ADMIN', 'VENDEDOR'] },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['usuario', 'password'],
        properties: {
          usuario: { type: 'string', example: 'vendedor1' },
          password: { type: 'string', format: 'password' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
      },
      Sorteo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          tipo: { type: 'string', enum: ['CHANCE', 'BALOTO'] },
          nombre: { type: 'string' },
          fecha: { type: 'string', format: 'date-time' },
          estado: { type: 'string', enum: ['ABIERTO', 'JUGADO'] },
          resultado: { nullable: true },
          acumulado: { type: 'number' },
        },
      },
      CrearSorteo: {
        type: 'object',
        required: ['tipo', 'nombre', 'fecha'],
        properties: {
          tipo: { type: 'string', enum: ['CHANCE', 'BALOTO'] },
          nombre: { type: 'string' },
          fecha: { type: 'string', format: 'date-time' },
          acumulado: { type: 'number', minimum: 0 },
        },
      },
      ApuestaChance: {
        type: 'object',
        required: ['numero', 'valor'],
        properties: {
          numero: { type: 'string', pattern: '^\\d{1,4}$' },
          modalidad: { type: 'string', enum: ['DIRECTO', 'COMBINADO'], default: 'DIRECTO' },
          valor: { type: 'integer', minimum: 500, maximum: 50000, multipleOf: 100 },
        },
      },
      JugadaBaloto: {
        type: 'object',
        properties: {
          aleatoria: { type: 'boolean', description: 'Indica que los números serán generados por el sistema.' },
          numeros: { type: 'array', minItems: 5, maxItems: 5, uniqueItems: true, items: { type: 'integer', minimum: 1, maximum: 43 } },
          superbalota: { type: 'integer', minimum: 1, maximum: 16 },
        },
      },
      VentaChance: {
        type: 'object',
        required: ['sorteoId', 'apuestas'],
        properties: {
          sorteoId: { type: 'integer' },
          apuestas: { type: 'array', minItems: 1, maxItems: 5, items: { $ref: '#/components/schemas/ApuestaChance' } },
          cliente: { type: 'string', nullable: true },
        },
      },
      VentaBaloto: {
        type: 'object',
        required: ['sorteoId', 'jugadas'],
        properties: {
          sorteoId: { type: 'integer' },
          jugadas: { type: 'array', minItems: 1, maxItems: 10, items: { $ref: '#/components/schemas/JugadaBaloto' } },
          cliente: { type: 'string', nullable: true },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          codigo: { type: 'string' },
          tipo: { type: 'string', enum: ['CHANCE', 'BALOTO'] },
          sorteoId: { type: 'integer' },
          vendedorId: { type: 'integer' },
          total: { type: 'integer' },
          estado: { type: 'string', enum: ['ACTIVO', 'ANULADO', 'PAGADO', 'CADUCADO'] },
          premio: { type: 'integer', nullable: true },
        },
        additionalProperties: true,
      },
      Pago: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          ticketId: { type: 'integer' },
          codigo: { type: 'string' },
          usuarioId: { type: 'integer' },
          valor: { type: 'integer' },
          fecha: { type: 'string', format: 'date-time' },
        },
      },
      ResumenCaja: {
        type: 'object',
        properties: {
          vendedorId: { type: 'integer' },
          fecha: { type: 'string', format: 'date' },
          tiquetesVendidos: { type: 'integer' },
          tiquetesAnulados: { type: 'integer' },
          totalVendido: { type: 'integer' },
          totalPagado: { type: 'integer' },
          saldoEsperado: { type: 'integer' },
          cerrada: { type: 'boolean' },
        },
        additionalProperties: true,
      },
      CierreCaja: {
        allOf: [
          { $ref: '#/components/schemas/ResumenCaja' },
          {
            type: 'object',
            properties: {
              efectivoReportado: { type: 'integer' },
              diferencia: { type: 'integer' },
              estado: { type: 'string', enum: ['CUADRADA', 'SOBRANTE', 'FALTANTE'] },
            },
          },
        ],
      },
    },
  },
};
