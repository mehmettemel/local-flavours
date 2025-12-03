-- List all categories
SELECT 
    id,
    slug,
    names->>'tr' as name_tr,
    names->>'en' as name_en,
    display_order,
    created_at
FROM 
    public.categories
ORDER BY 
    display_order ASC,
    names->>'tr' ASC;
