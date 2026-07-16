--
-- PostgreSQL database dump
--

\restrict jaAtUq4Shde1axFCdxkwqLgqx2HZdvQAMnRdD5ltyDa4ooVbymGjw1wxoVTmkpa

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."Reservation" DROP CONSTRAINT IF EXISTS "Reservation_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Reservation" DROP CONSTRAINT IF EXISTS "Reservation_tableId_fkey";
ALTER TABLE IF EXISTS ONLY public."Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Order" DROP CONSTRAINT IF EXISTS "Order_tableId_fkey";
ALTER TABLE IF EXISTS ONLY public."OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
ALTER TABLE IF EXISTS ONLY public."OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_menuItemId_fkey";
ALTER TABLE IF EXISTS ONLY public."MenuItem" DROP CONSTRAINT IF EXISTS "MenuItem_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."EmployeePayment" DROP CONSTRAINT IF EXISTS "EmployeePayment_userId_fkey";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Table_number_key";
DROP INDEX IF EXISTS public."EmployeePayment_userId_year_month_idx";
DROP INDEX IF EXISTS public."Category_slug_key";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Table" DROP CONSTRAINT IF EXISTS "Table_pkey";
ALTER TABLE IF EXISTS ONLY public."Reservation" DROP CONSTRAINT IF EXISTS "Reservation_pkey";
ALTER TABLE IF EXISTS ONLY public."Order" DROP CONSTRAINT IF EXISTS "Order_pkey";
ALTER TABLE IF EXISTS ONLY public."OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_pkey";
ALTER TABLE IF EXISTS ONLY public."MenuItem" DROP CONSTRAINT IF EXISTS "MenuItem_pkey";
ALTER TABLE IF EXISTS ONLY public."EmployeePayment" DROP CONSTRAINT IF EXISTS "EmployeePayment_pkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_pkey";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Table";
DROP TABLE IF EXISTS public."Reservation";
DROP TABLE IF EXISTS public."OrderItem";
DROP TABLE IF EXISTS public."Order";
DROP TABLE IF EXISTS public."MenuItem";
DROP TABLE IF EXISTS public."EmployeePayment";
DROP TABLE IF EXISTS public."Category";
DROP TYPE IF EXISTS public."TableStatus";
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."ReservationStatus";
DROP TYPE IF EXISTS public."PaymentStatus";
DROP TYPE IF EXISTS public."OrderType";
DROP TYPE IF EXISTS public."OrderStatus";
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: OrderType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderType" AS ENUM (
    'DINE_IN',
    'TAKEAWAY'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REFUNDED'
);


--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'CLIENT',
    'ADMIN',
    'KITCHEN'
);


--
-- Name: TableStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TableStatus" AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'RESERVED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: EmployeePayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmployeePayment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "paymentDate" timestamp(3) without time zone NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MenuItem" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    "categoryId" text NOT NULL,
    image text,
    available boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total numeric(10,2) NOT NULL,
    notes text,
    "orderType" public."OrderType" DEFAULT 'DINE_IN'::public."OrderType" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "customerName" text,
    "customerEmail" text,
    "customerPhone" text,
    "tableId" text,
    "mercadoPagoPreferenceId" text,
    "mercadoPagoPaymentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "menuItemId" text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);


--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    "userId" text,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "time" text NOT NULL,
    guests integer DEFAULT 2 NOT NULL,
    "tableId" text NOT NULL,
    "specialRequests" text,
    status public."ReservationStatus" DEFAULT 'CONFIRMED'::public."ReservationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Table" (
    id text NOT NULL,
    number integer NOT NULL,
    capacity integer DEFAULT 4 NOT NULL,
    status public."TableStatus" DEFAULT 'AVAILABLE'::public."TableStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    name text NOT NULL,
    role public."Role" DEFAULT 'CLIENT'::public."Role" NOT NULL,
    salary numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, slug, description, "createdAt") FROM stdin;
50dabd44-1899-4c6a-a064-d2f9f7a31a40	Entrantes	entrantes	Aperitivos y entrantes ligeros	2026-07-16 01:56:39.836
68ff2e97-465b-491b-9ee4-35049b7ea7d2	Ensaladas	ensaladas	Ensaladas frescas y saludables	2026-07-16 01:56:39.843
e05c7e3b-bca6-463d-90e4-01abbde6b3c6	Platos Principales	platos-principales	Platos principales vegetarianos	2026-07-16 01:56:39.849
81fc7910-8a7c-43cd-bc60-fb91772e4530	Parrillas	parrillas	Cortes premium a la parrilla	2026-07-16 01:56:39.856
416b19e4-8197-4204-b1b0-1c19cc50151b	Pollos	pollos	Especialidades de pollo	2026-07-16 01:56:39.862
e025ac9d-f071-4d75-9059-08dba5cebc37	Carnes	carnes	Cortes de carne seleccionados	2026-07-16 01:56:39.868
e242b498-cf6c-416f-90a3-483d6f7678a6	Postres	postres	Postres y dulces artesanales	2026-07-16 01:56:39.874
939c2854-e46c-4ce7-b258-1de325c11919	Bebidas	bebidas	Bebidas y refrescos	2026-07-16 01:56:39.88
8db69980-6b1d-4b89-85a5-a46aa50f3735	Bebidas Alcohólicas	bebidas-alcoholicas	Cervezas, vinos y licores	2026-07-16 01:56:39.886
\.


--
-- Data for Name: EmployeePayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EmployeePayment" (id, "userId", amount, "paymentDate", month, year, "createdAt") FROM stdin;
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MenuItem" (id, name, description, price, "categoryId", image, available, "createdAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "userId", status, total, notes, "orderType", "paymentStatus", "customerName", "customerEmail", "customerPhone", "tableId", "mercadoPagoPreferenceId", "mercadoPagoPaymentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "menuItemId", quantity, price) FROM stdin;
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Reservation" (id, "userId", name, email, phone, date, "time", guests, "tableId", "specialRequests", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: Table; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Table" (id, number, capacity, status, "createdAt") FROM stdin;
ae4887b1-5ff5-4886-a4f0-b6ca0386809f	1	2	AVAILABLE	2026-07-16 01:56:39.895
b02991ac-3da1-4fd0-8efd-fda1edf798da	2	2	AVAILABLE	2026-07-16 01:56:39.9
d07004fe-a5bd-41a7-a926-5ab79369dd5a	3	2	AVAILABLE	2026-07-16 01:56:39.904
84f0c250-7f3b-4612-a062-e339e173599f	4	2	AVAILABLE	2026-07-16 01:56:39.907
fe9bb4a4-c623-4fd5-9730-1b0dab691bd5	5	2	AVAILABLE	2026-07-16 01:56:39.91
7b14c451-f923-4d5d-b3a6-19b63a7aaa26	6	4	AVAILABLE	2026-07-16 01:56:39.913
4e39bcf9-0f23-42cb-837e-46420166d84b	7	4	AVAILABLE	2026-07-16 01:56:39.916
d8ebaef8-d098-4996-87ba-010a2ae60f25	8	4	AVAILABLE	2026-07-16 01:56:39.92
89298843-1f7c-4ecc-8625-7edc94d4963f	9	4	AVAILABLE	2026-07-16 01:56:39.922
e47a4b63-61f7-437f-9f59-45dec79420be	10	4	AVAILABLE	2026-07-16 01:56:39.925
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, name, role, salary, "createdAt") FROM stdin;
dd12fbbf-3881-49cf-bcfa-f7154a20f818	admin@restveg.com	$2a$10$PmQf4VIycE5Lp7CQkRIjOeBh3zgqFER0RiBRTh18uKkPHGO6A9usS	Admin User	ADMIN	\N	2026-07-16 01:56:39.584
affa2d39-9b6b-4add-a9d6-617143d140e2	kitchen@restveg.com	$2a$10$2qbKEGnaxwid33/gKdGBt.LzoomMiZv8AlyanOlRmPwbgZa7xUfwG	Kitchen User	KITCHEN	\N	2026-07-16 01:56:39.702
c66233ba-295d-41c7-a9fe-a04c79df7fa8	client@restveg.com	$2a$10$0KwFWJl6uqxA/kdXQosQ4.n7gOcrWoUdBR3CJhB3zkqYkMtnd0sQm	Client User	CLIENT	\N	2026-07-16 01:56:39.829
\.


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: EmployeePayment EmployeePayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmployeePayment"
    ADD CONSTRAINT "EmployeePayment_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Table Table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: EmployeePayment_userId_year_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmployeePayment_userId_year_month_idx" ON public."EmployeePayment" USING btree ("userId", year, month);


--
-- Name: Table_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Table_number_key" ON public."Table" USING btree (number);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: EmployeePayment EmployeePayment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmployeePayment"
    ADD CONSTRAINT "EmployeePayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Reservation Reservation_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict jaAtUq4Shde1axFCdxkwqLgqx2HZdvQAMnRdD5ltyDa4ooVbymGjw1wxoVTmkpa

