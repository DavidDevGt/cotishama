-- Create action_type enum
CREATE TYPE action_type AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'ROLE_CHANGE', 'PERMISSION_CHANGE');

-- Create audit_log table
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action action_type NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id INTEGER,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indices for audit log queries
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_resource ON audit_log(resource);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
