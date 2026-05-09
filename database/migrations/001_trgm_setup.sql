-- Enable pg_trgm extension and create GIN index for fuzzy search
-- This migration should be run before any product search operations

-- Enable the pg_trgm extension (requires superuser or extension already installed)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index on products.name for fuzzy search
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- Create additional indexes for better query performance
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_code ON products (code);

-- Example query for fuzzy search:
-- SELECT * FROM products 
-- WHERE similarity(name, 'search_term') > 0.3
-- ORDER BY similarity(name, 'search_term') DESC
-- LIMIT 20;

-- Alternative using LIKE (simpler but less powerful):
-- SELECT * FROM products 
-- WHERE name ILIKE '%tornillo%'
-- LIMIT 20;