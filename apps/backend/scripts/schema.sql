-- ChefAI Database Schema
-- Applied to Supabase PostgreSQL

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Establishments
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  address VARCHAR,
  timezone VARCHAR NOT NULL DEFAULT 'Europe/Paris',
  plan_tier VARCHAR NOT NULL DEFAULT 'starter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'chef',
  password_hash VARCHAR NOT NULL,
  establishment_id UUID NOT NULL REFERENCES establishments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  unit VARCHAR NOT NULL,
  unit_cost DECIMAL(10,4) NOT NULL DEFAULT 0,
  current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
  reorder_threshold DECIMAL(10,3) NOT NULL DEFAULT 0,
  establishment_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Stock lots
CREATE TABLE IF NOT EXISTS stock_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity DECIMAL(10,3) NOT NULL,
  remaining_quantity DECIMAL(10,3) NOT NULL,
  expiry_date DATE NOT NULL,
  supplier_id UUID,
  lot_number VARCHAR,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  establishment_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Stock movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  type VARCHAR NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  reason VARCHAR,
  user_id UUID NOT NULL,
  lot_id UUID,
  establishment_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description VARCHAR,
  category VARCHAR NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  portions INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  establishment_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Recipe ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity DECIMAL(10,4) NOT NULL
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  establishment_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'draft',
  notes VARCHAR,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  establishment_id UUID NOT NULL,
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Order lines
CREATE TABLE IF NOT EXISTS order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL,
  ingredient_name VARCHAR NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR NOT NULL,
  unit_price DECIMAL(10,4) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_email VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  entity_type VARCHAR NOT NULL,
  entity_id UUID,
  metadata JSONB,
  establishment_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_establishment ON ingredients(establishment_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_ingredient ON stock_lots(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_expiry ON stock_lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient ON stock_movements(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipes_establishment ON recipes(establishment_id);
CREATE INDEX IF NOT EXISTS idx_orders_establishment ON orders(establishment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_establishment ON audit_logs(establishment_id);

-- Seed: demo establishment + admin user (password: Admin1234!)
INSERT INTO establishments (id, name, timezone, plan_tier)
VALUES ('00000000-0000-0000-0000-000000000001', 'Restaurant Demo', 'Europe/Paris', 'pro')
ON CONFLICT DO NOTHING;

-- Admin: admin@chefai.fr / Admin1234!
-- Hash: $2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0/wiX7rFiTW
INSERT INTO users (id, email, first_name, last_name, role, password_hash, establishment_id)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@chefai.fr',
  'Admin',
  'ChefAI',
  'admin',
  '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0/wiX7rFiTW',
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;
