-- Create quote_details table
CREATE TABLE quote_details (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  line_total NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(5, 2) DEFAULT 0,
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indices for quote detail lookups
CREATE INDEX idx_quote_details_quote_id ON quote_details(quote_id);
CREATE INDEX idx_quote_details_product_id ON quote_details(product_id);
