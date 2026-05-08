-- Create change_type enum
CREATE TYPE change_type AS ENUM ('CREATED', 'STATUS_CHANGED', 'DETAILS_MODIFIED', 'NOTES_UPDATED', 'DELETED');

-- Create quote_history table
CREATE TABLE quote_history (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id),
  changed_by INTEGER NOT NULL REFERENCES users(id),
  change_type change_type NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indices for history lookups
CREATE INDEX idx_quote_history_quote_id ON quote_history(quote_id);
CREATE INDEX idx_quote_history_changed_by ON quote_history(changed_by);
CREATE INDEX idx_quote_history_created_at ON quote_history(created_at);
