-- List all collections with their slugs
SELECT 
    names->>'tr' as collection_name,
    slug,
    status,
    created_at
FROM 
    public.collections
ORDER BY 
    created_at DESC;
