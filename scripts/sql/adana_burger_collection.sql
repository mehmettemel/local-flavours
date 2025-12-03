-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_adana_id uuid;
    v_category_id uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get or Create Location ID (Adana)
    SELECT id INTO v_adana_id FROM public.locations WHERE slug = 'adana' OR names->>'tr' = 'Adana' LIMIT 1;
    
    IF v_adana_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'adana', '{"tr": "Adana", "en": "Adana"}', true)
        RETURNING id INTO v_adana_id;
        RAISE NOTICE 'Created missing location: Adana';
    END IF;

    -- 3. Get Category ID (Genel / General)
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'genel' LIMIT 1;

    IF v_category_id IS NULL THEN
         INSERT INTO public.categories (slug, names, display_order)
         VALUES ('genel', '{"tr": "Genel", "en": "General"}', -1)
         RETURNING id INTO v_category_id;
         RAISE NOTICE 'Created missing category: Genel';
    END IF;

    -- 4. Create Collection
    INSERT INTO public.collections (
        names,
        descriptions,
        slug,
        category_id,
        location_id,
        creator_id,
        status,
        vote_score,
        vote_count,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Adana''nın En İyi Burger Mekanları", "en": "Best Burger Spots in Adana"}'::jsonb,
        '{"tr": "Adana''da burger severler için özenle seçilmiş, lezzeti ve kalitesiyle öne çıkan en iyi burger mekanları. El yapımı köfteler, özel soslar ve gurme lezzetler bu listede."}'::jsonb,
        'adana-burger-mekanlari',
        v_category_id,
        v_adana_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: The Bull Burger & Coffee
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "The Bull Burger & Coffee"}'::jsonb,
        'the-bull-burger-coffee-adana',
        'Cemalpaşa mh.toros cad. Ziya apt no 30/1 Kazım büfe karşısı, Seyhan/Adana',
        v_adana_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=The+Bull+Burger+Coffee+Adana',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    -- Handle case where place already exists and wasn't returned
    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'the-bull-burger-coffee-adana';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        1,
        ARRAY['Classicbull Burger', 'Mushbull Burger', 'BBQ Bull Burger']
    );

    -- Place 2: Single Burger
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Single Burger"}'::jsonb,
        'single-burger-adana',
        'Kemal Çelik apt, Kurtuluş, 64012. Sk. 5/A, Seyhan/Adana',
        v_adana_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Single+Burger+Adana',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'single-burger-adana';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        2,
        ARRAY['Singarlic Burger', 'Single Special Burger', 'Patates Kızartması']
    );

    -- Place 3: Barks Burger Hive & Street Food
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Barks Burger Hive & Street Food"}'::jsonb,
        'barks-burger-hive-adana',
        'Cemalpaşa, Toros Cd. Çiğdem Apt No: 6/B, Seyhan/Adana',
        v_adana_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Barks+Burger+Hive+Adana',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'barks-burger-hive-adana';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        3,
        ARRAY['Özel Soslu Burgerler', 'Tavuklu Burgerler', 'Yan Lezzetler']
    );

END $$;

COMMIT;
