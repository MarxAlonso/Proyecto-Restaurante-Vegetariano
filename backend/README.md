# Backend - Restaurant Veg

API REST separada del frontend para el sistema de restaurante vegetariano.

## Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de datos**: PostgreSQL

## Estructura

```
backend/
├── src/
│   ├── routes/        # Endpoints API
│   ├── middleware/    # Auth y validación
│   ├── types/         # Tipos TypeScript
│   ├── db/           # Conexión Prisma
│   └── index.ts      # Entry point
├── prisma/
│   └── schema.prisma # Modelo de datos
└── railway.json      # Config部署
```

## Setup Local

```bash
cd backend
npm install

# Configurar base de datos
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente Prisma
npm run db:generate

# Aplicar esquema a la DB
npm run db:push

# Iniciar servidor
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar a JavaScript |
| `npm run start` | Iniciar producción |
| `npm run db:generate` | Generar Prisma Client |
| `npm run db:push` | Sincronizar esquema |

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default: 3001) |
| `FRONTEND_URL` | URL del frontend para CORS |
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Clave para tokens JWT |

## API Endpoints

### Auth
- `POST /api/auth/register` - Registar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Menu
- `GET /api/menu` - Listar todos los items
- `GET /api/menu/:id` - Obtener item por ID
- `POST /api/menu` - Crear item (admin)
- `PUT /api/menu/:id` - Actualizar item (admin)
- `DELETE /api/menu/:id` - Eliminar item (admin)

### Orders
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `GET /api/orders/:id` - Obtener pedido
- `PATCH /api/orders/:id` - Actualizar estado

### Kitchen
- `GET /api/kitchen` - Pedidos activos (cocina)
- `PATCH /api/kitchen/:id/status` - Cambiar estado
- `GET /api/kitchen/stats` - Estadísticas

## Despliegue (Railway)

```bash
railway init
railway up
```

Configuración automática en `railway.json`.