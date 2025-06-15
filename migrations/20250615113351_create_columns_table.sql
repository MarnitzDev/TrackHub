
-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
                                       id SERIAL PRIMARY KEY,
                                       profile_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                             );

-- Create index on profile_id for faster queries
CREATE INDEX idx_columns_profile_id ON columns(profile_id);

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_columns_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_columns_modtime
    BEFORE UPDATE ON columns
    FOR EACH ROW
    EXECUTE FUNCTION update_columns_modified_column();

-- Add foreign key constraint to tasks table
ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_column
        FOREIGN KEY (column_id)
            REFERENCES columns(id)
            ON DELETE CASCADE;