-- ==========================================
-- SCRIPT DE CREACIÓN FÍSICA DE BASE DE DATOS
-- PROYECTO: RESTAURANTE VEGETARIANO (RESTVEG_BD)
-- TECNOLOGÍA: PostgreSQL 15/16 + Prisma Client
-- AUTOR: MarxAlonso (Desarrollo Universitario)
-- COHERENCIA: 100% Consistente con schema.prisma v2
-- ==========================================

-- 1. LIMPIEZA DE TABLAS Y TIPOS EXISTENTES (EVITA CONFLICTOS)
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "MenuItem" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Category" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;

-- 2. HABILITAR EXTENSIÓN PARA GENERACIÓN DE UUIDv4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREACIÓN DE ENUMS (DOMINIO DEL NEGOCIO)
CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN', 'KITCHEN');
CREATE TYPE "Category" AS ENUM ('APPETIZER', 'MAIN', 'DESSERT', 'DRINK');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');

-- 4. CREACIÓN DE LA TABLA: User (USUARIOS)
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREACIÓN DE LA TABLA: MenuItem (CARTA DEL RESTAURANTE)
CREATE TABLE "MenuItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "category" "Category" NOT NULL,
    "image" VARCHAR(255),
    "available" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. CREACIÓN DE LA TABLA: Order (PEDIDOS DE CLIENTES)
CREATE TABLE "Order" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(10, 2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fk_order_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 7. CREACIÓN DE LA TABLA: OrderItem (DETALLE DE PEDIDOS)
CREATE TABLE "OrderItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    
    CONSTRAINT "fk_orderitem_order" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_orderitem_menuitem" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT
);

-- ==========================================
-- INDEXACIÓN Y OPTIMIZACIÓN DE CONSULTAS
-- ==========================================
-- Índices para mejorar la velocidad en búsquedas frecuentes de la app:
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_order_user" ON "Order"("userId");
CREATE INDEX "idx_order_status" ON "Order"("status");
CREATE INDEX "idx_orderitem_order" ON "OrderItem"("orderId");
CREATE INDEX "idx_menuitem_category" ON "MenuItem"("category");

-- ==========================================
-- AUTOMATIZACIÓN DE TIMESTAMP (TRIGGER)
-- ==========================================
-- Función y trigger para actualizar 'updatedAt' automáticamente (réplica de Prisma @updatedAt)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_order_updated_at
    BEFORE UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- CARGA DE SEMILLAS DE PRUEBA (SEED DATA)
-- ==========================================

-- A. Usuarios (Contraseñas encriptadas con bcrypt, hash para 'password123')
-- Admin: admin@restaurant.com
-- Kitchen: cocina@restaurant.com
-- Client: cliente@restaurant.com
INSERT INTO "User" ("id", "email", "password", "name", "role") VALUES
('11111111-1111-1111-1111-111111111111', 'admin@restaurant.com', '$2a$10$T8Z654HhQ/4C9B3C2pG4Eu8Q5l8uWvH.1k3x5V7cR/aY7e6i7N51G', 'Marx Alonso (Admin)', 'ADMIN'),
('22222222-2222-2222-2222-222222222222', 'cocina@restaurant.com', '$2a$10$T8Z654HhQ/4C9B3C2pG4Eu8Q5l8uWvH.1k3x5V7cR/aY7e6i7N51G', 'Chef Juan (Cocina)', 'KITCHEN'),
('33333333-3333-3333-3333-333333333333', 'cliente@restaurant.com', '$2a$10$T8Z654HhQ/4C9B3C2pG4Eu8Q5l8uWvH.1k3x5V7cR/aY7e6i7N51G', 'Diego Lopez (Cliente)', 'CLIENT');

-- B. Menú Vegetariano Inicial
INSERT INTO "MenuItem" ("id", "name", "description", "price", "category", "image") VALUES
('a1111111-1111-1111-1111-111111111111', 'Tequeños de Queso Andino', '8 tequeños crocantes rellenos de queso andino acompañados de salsa huacamole.', 18.00, 'APPETIZER', 'tequenos.jpg'),
('a2222222-2222-2222-2222-222222222222', 'Ceviche de Champiñones', 'Champiñones frescos marinados en zumo de limón, cebolla roja, culantro y ají limo, servido con camote y choclo.', 24.50, 'APPETIZER', 'ceviche_champ.jpg'),
('m1111111-1111-1111-1111-111111111111', 'Lomo Saltado Veggie', 'Trozos de seitán premium saltados al wok con cebolla, tomate, ají amarillo y un toque de pisco, servido con papas fritas y arroz.', 32.00, 'MAIN', 'lomo_veggie.jpg'),
('m2222222-2222-2222-2222-222222222222', 'Parrilla Vegana de la Casa', 'Berenjenas, zuchinis, champiñones, pimientos y tofu marinados al chimichurri, asados a la parrilla, con papas nativas.', 35.00, 'MAIN', 'parrilla_veggie.jpg'),
('d1111111-1111-1111-1111-111111111111', 'Tres Leches Vegano', 'Bizcocho esponjoso bañado en tres leches vegetales (coco, almendra y soya), decorado con crema batida de coco.', 14.00, 'DESSERT', 'tres_leches_veg.jpg'),
('d2222222-2222-2222-2222-222222222222', 'Mousse de Maracuyá Silvestre', 'Mousse suave y aireado a base de maracuyá y crema vegetal, endulzado con estevia.', 12.00, 'DESSERT', 'mousse_maracuya.jpg'),
('dr111111-1111-1111-1111-111111111111', 'Chicha Morada Clásica', 'Bebida tradicional de maíz morado hervido con piña, manzana, canela y clavo de olor, endulzada al gusto.', 8.00, 'DRINK', 'chicha_morada.jpg'),
('dr222222-2222-2222-2222-222222222222', 'Limonada de Hierbabuena', 'Zumo de limón fresco licuado con hojas de hierbabuena fresca y hielo frappé.', 9.00, 'DRINK', 'limonada_hierbabuena.jpg');
