const corsOptions = {
  origin: true, // Reflect request origin in Access-Control-Allow-Origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-auth-token',
    'x-tenant-id',
    'X-Tenant-Id'
  ],
  exposedHeaders: ['x-tenant-id', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
