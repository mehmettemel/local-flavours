-- Restore the foreign key relationship between collections and locations
-- This fixes the PGRST200 error where the API cannot find the relationship
-- Also ensures location_id is nullable as intended by previous migrations

DO $$
BEGIN
    -- Add the constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collections_location_id_fkey') THEN
        ALTER TABLE collections
        ADD CONSTRAINT collections_location_id_fkey
        FOREIGN KEY (location_id)
        REFERENCES locations(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Ensure location_id is nullable (it should be from 011, but reinforcing just in case)
ALTER TABLE collections ALTER COLUMN location_id DROP NOT NULL;
