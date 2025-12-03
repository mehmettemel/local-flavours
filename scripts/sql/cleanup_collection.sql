-- Transaction start
BEGIN;

DO $$
DECLARE
    v_collection_slug text := 'izmirin-en-lezzetli-kumru-duraklari'; -- CHANGE THIS SLUG
    v_collection_id uuid;
BEGIN
    -- 1. Find Collection ID
    SELECT id INTO v_collection_id FROM public.collections WHERE slug = v_collection_slug;

    IF v_collection_id IS NULL THEN
        RAISE NOTICE 'Collection % not found, nothing to delete.', v_collection_slug;
        RETURN;
    END IF;

    -- 2. Delete Collection (Cascades to collection_places)
    DELETE FROM public.collections WHERE id = v_collection_id;
    
    RAISE NOTICE 'Deleted collection: %', v_collection_slug;

    -- 3. Optional: Delete places that are no longer in any collection
    -- Be careful with this if places are shared or independent entities.
    -- For now, we will NOT delete places automatically to be safe, 
    -- as they might be used in other contexts or future collections.
    
    -- If you REALLY want to clean up orphaned places:
    /*
    DELETE FROM public.places p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.collection_places cp WHERE cp.place_id = p.id
    );
    */

END $$;

COMMIT;
