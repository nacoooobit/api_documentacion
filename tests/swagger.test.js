const { app, request } = require('./helpers');

describe('Documentación OpenAPI', () => {
  test('publica el esquema OpenAPI con las rutas del servicio', async () => {
    const res = await request(app).get('/openapi.json');
    const rutasDocumentadas = [
      '/health',
      '/api/v1/auth/login',
      '/api/v1/auth/perfil',
      '/api/v1/sorteos',
      '/api/v1/sorteos/{id}',
      '/api/v1/sorteos/{id}/resultado',
      '/api/v1/tickets/chance',
      '/api/v1/tickets/baloto',
      '/api/v1/tickets',
      '/api/v1/tickets/{codigo}',
      '/api/v1/tickets/{codigo}/anular',
      '/api/v1/tickets/{codigo}/pagar',
      '/api/v1/caja/resumen',
      '/api/v1/caja/cierre',
    ];

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(Object.keys(res.body.paths).sort()).toEqual(rutasDocumentadas.sort());
  });

  test('sirve Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
