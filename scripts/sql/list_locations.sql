-- List all locations (cities)
SELECT 
    id,
    slug,
    type,
    names->>'tr' as name_tr,
    names->>'en' as name_en,
    has_districts,
    created_at
FROM 
    public.locations
ORDER BY 
    names->>'tr' ASC;
