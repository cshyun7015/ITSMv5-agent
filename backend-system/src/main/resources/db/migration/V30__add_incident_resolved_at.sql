-- Add resolved_at column to incidents table if it doesn't exist
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resolved_at DATETIME(6);
