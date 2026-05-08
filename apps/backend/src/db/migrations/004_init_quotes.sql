-- Create quote_status enum
CREATE TYPE quote_status AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'ARCHIVED');

-- Create quotes table
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  created_by INTEGER NOT NULL REFERENCES users(id),
  status quote_status DEFAULT 'DRAFT' NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indices for quote lookups
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_created_by ON quotes(created_by);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_valid_until ON quotes(valid_until);
