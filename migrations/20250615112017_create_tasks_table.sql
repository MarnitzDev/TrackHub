-- migrations/YYYYMMDDHHMMSS_create_tasks_table.sql

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
                                     id SERIAL PRIMARY KEY,
                                     profile_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'done')),
    column_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                             );

-- Create index on profile_id for faster queries
CREATE INDEX idx_tasks_profile_id ON tasks(profile_id);

-- Create index on column_id for faster queries
CREATE INDEX idx_tasks_column_id ON tasks(column_id);

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_modtime
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();