# API Documentation - Restaurant Veg Backend

## Overview

The Restaurant Veg Backend API is fully documented using **OpenAPI/Swagger 3.0** specifications. This documentation is automatically generated from JSDoc comments in the route files.

## Accessing the Documentation

### 1. **Swagger UI** (Interactive Documentation)

Once the backend server is running, visit:

```
http://localhost:3001/api/docs
```

This provides an interactive interface where you can:
- View all available endpoints
- See request/response schemas
- Test API endpoints directly
- Generate code samples in multiple languages

### 2. **OpenAPI JSON Specification**

Get the raw OpenAPI specification:

```
http://localhost:3001/api/openapi.json
```

This can be imported into:
- **Postman** - Import as OpenAPI URL
- **Insomnia** - Import the specification
- **API clients** - Any tool that supports OpenAPI 3.0

## Starting the Backend Server

```bash
# Development mode with hot reload
pnpm dev

# Build and start in production
pnpm build
pnpm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`)

## API Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://restaurante-vegetariano-backend.vercel.app`

## Authentication

The API uses two authentication methods:

### 1. **JWT Bearer Token** (Recommended)
```bash
Authorization: Bearer <jwt_token>
```

### 2. **Cookie-based**
```
Cookie: auth_token=<token>
```

### Getting an Authentication Token

1. **Register a new user:**
   ```bash
   POST /api/auth/register
   {
     "email": "user@example.com",
     "password": "securePassword123",
     "name": "John Doe"
   }
   ```

2. **Login:**
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "securePassword123"
   }
   ```

3. **Response includes JWT token:**
   ```json
   {
     "user": { "id": "...", "email": "...", "name": "...", "role": "CLIENT" },
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "refreshToken": "..."
   }
   ```

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Menu Management
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Create menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Orders
- `GET /api/orders` - Get user orders (Authenticated)
- `GET /api/orders/:id` - Get order details (Authenticated)
- `POST /api/orders` - Create order (Authenticated)
- `POST /api/orders/guest` - Create guest order (No auth required)
- `PATCH /api/orders/:id` - Update order status (Authenticated)
- `GET /api/orders/kitchen` - Get kitchen orders (Kitchen/Admin only)
- `GET /api/orders/stats` - Get order statistics (Kitchen/Admin only)
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `GET /api/orders/admin/stats` - Get admin statistics (Admin only)
- `GET /api/orders/admin/revenue` - Get daily revenue (Admin only)
- `DELETE /api/orders/:id` - Delete order (Admin only)

### Reservations
- `GET /api/reservations` - Get all reservations (Admin only)
- `GET /api/reservations/my` - Get my reservations (Authenticated)
- `GET /api/reservations/availability` - Check table availability
- `GET /api/reservations/:id` - Get reservation details
- `POST /api/reservations` - Create reservation
- `PATCH /api/reservations/:id/cancel` - Cancel reservation

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/available` - Get available tables
- `GET /api/tables/:id` - Get table by ID
- `GET /api/tables/details/:id` - Get table details (Admin only)
- `POST /api/tables` - Create table (Admin only)
- `PUT /api/tables/:id` - Update table (Admin only)
- `PATCH /api/tables/:id` - Update table status (Admin/Kitchen only)
- `DELETE /api/tables/:id` - Delete table (Admin only)

### Users Management
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users/worker` - Create worker (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Payments
- `GET /api/payments/user/:userId` - Get user payments (Admin only)
- `POST /api/payments` - Create payment (Admin only)
- `DELETE /api/payments/:id` - Delete payment (Admin only)

### MercadoPago Integration
- `POST /api/mercadopago/create-preference` - Create payment preference
- `POST /api/mercadopago/webhook` - MercadoPago webhook handler
- `GET /api/mercadopago/payment/:paymentId/status` - Get payment status

### Health Check
- `GET /api/health` - Server health status

## User Roles

The API implements role-based access control with the following roles:

| Role | Permissions |
|------|------------|
| **CLIENT** | Browse menu, create orders, make reservations |
| **ADMIN** | Full system access, user management, reports |
| **KITCHEN** | View orders, update order status, manage table status |
| **DELIVERY** | Track delivery orders (if enabled) |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 100 requests per second (strict to prevent brute force)

## CORS Policy

Allowed origins:
- `http://localhost:3000` (Development frontend)
- `https://restaurante-vegetariano-frontend.vercel.app` (Production frontend)

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error code or type",
  "message": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request - invalid input |
| 401 | Unauthorized - authentication required or failed |
| 403 | Forbidden - insufficient permissions |
| 404 | Not found |
| 429 | Too many requests - rate limit exceeded |
| 500 | Internal server error |

## API Key Fields

### Standard Pagination (where applicable)
```
?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### Common Query Parameters
```
?filter=status&value=PENDING
?search=query_term
?dateFrom=2024-01-01&dateTo=2024-01-31
```

## Integration Examples

### Using cURL
```bash
# Get all menu items
curl http://localhost:3001/api/menu

# Create menu item (requires authentication)
curl -X POST http://localhost:3001/api/menu \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Salad","price":8.99,"category":"Salads"}'
```

### Using Postman
1. Import the OpenAPI spec: `http://localhost:3001/api/openapi.json`
2. Swagger UI will auto-generate a Postman collection
3. Set the `Authorization` header with your JWT token

### Using JavaScript/Fetch
```javascript
// Get menu items
const response = await fetch('http://localhost:3001/api/menu');
const data = await response.json();

// Create order
const createOrder = async (token) => {
  const response = await fetch('http://localhost:3001/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [
        { menuItemId: 'item-1', quantity: 2 },
        { menuItemId: 'item-2', quantity: 1 }
      ]
    })
  });
  return response.json();
};
```

## Troubleshooting

### Swagger UI Not Loading
1. Ensure server is running: `pnpm dev`
2. Check that port 3001 is not blocked
3. Clear browser cache: Ctrl+F5 or Cmd+Shift+R

### 401 Unauthorized Errors
1. Ensure you have a valid JWT token
2. Check token expiration
3. Verify token is included in Authorization header

### 403 Forbidden Errors
1. Check your user role has permission for this endpoint
2. Some endpoints require ADMIN role

### CORS Errors
1. Verify your frontend URL is in the allowed origins list
2. Check that credentials: true is set in fetch requests

## Documentation Updates

The API documentation is automatically generated from JSDoc comments in the route files. To update documentation:

1. Edit JSDoc comments in `/src/modules/*/infrastructure/http/routes/*.ts`
2. Restart the server
3. The Swagger UI will automatically reflect changes

## Support

For issues with the API or documentation:
- Check the backend logs: `pnpm dev`
- Review error messages in the Swagger UI
- Contact the development team
