import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Veg API',
      description: 'API REST para gestión de restaurante vegetariano',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@restaurantveg.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development Server',
      },
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://restaurante-vegetariano-backend.vercel.app',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token',
          description: 'Authentication cookie',
        },
      },
      schemas: {
        // Auth Schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['CLIENT', 'ADMIN', 'KITCHEN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', description: 'JWT token' },
            refreshToken: { type: 'string', description: 'Refresh token' },
          },
        },
        // Menu Schemas
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'float' },
            image: { type: 'string', description: 'Image URL' },
            category: { type: 'string' },
            available: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Category Schemas
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'string' },
          },
        },
        // Order Schemas
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] },
            total: { type: 'number', format: 'float' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  menuItemId: { type: 'string' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Table Schemas
        Table: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tableNumber: { type: 'integer' },
            capacity: { type: 'integer' },
            status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'] },
          },
        },
        // Reservation Schemas
        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            tableId: { type: 'string', format: 'uuid' },
            reservationDate: { type: 'string', format: 'date-time' },
            guests: { type: 'integer' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
          },
        },
        // Error Schemas
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/*/infrastructure/http/routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
