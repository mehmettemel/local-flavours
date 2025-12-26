-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_istanbul_id uuid;
    v_kadikoy_id uuid;
    v_uskudar_id uuid;
    v_category_id uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get Location IDs
    -- Istanbul
    SELECT id INTO v_istanbul_id FROM public.locations WHERE slug = 'istanbul' LIMIT 1;
    IF v_istanbul_id IS NULL THEN
        RAISE EXCEPTION 'Location Istanbul not found';
    END IF;

    -- Kadikoy
    SELECT id INTO v_kadikoy_id FROM public.locations WHERE slug = 'kadikoy' LIMIT 1;
    IF v_kadikoy_id IS NULL THEN
        -- Fallback to Istanbul if district not found (though it should exist)
        v_kadikoy_id := v_istanbul_id;
        RAISE NOTICE 'Location Kadikoy not found, using Istanbul';
    END IF;

    -- Uskudar
    SELECT id INTO v_uskudar_id FROM public.locations WHERE slug = 'uskudar' LIMIT 1;
    IF v_uskudar_id IS NULL THEN
        -- Fallback to Istanbul if district not found
        v_uskudar_id := v_istanbul_id;
        RAISE NOTICE 'Location Uskudar not found, using Istanbul';
    END IF;

    -- 3. Get Category ID (Kahvaltı & Börek)
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'kahvalti' LIMIT 1;

    IF v_category_id IS NULL THEN
         RAISE EXCEPTION 'Category kahvalti not found';
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
        '{"tr": "Kadıköy & Üsküdar Uygun Fiyatlı Kahvaltı", "en": "Affordable Breakfast in Kadikoy & Uskudar"}'::jsonb,
        '{"tr": "İstanbul''un Anadolu yakasında, Kadıköy ve Üsküdar semtlerinde bütçe dostu, lezzetli ve samimi kahvaltı mekanları. Öğrenci dostu fiyatlar ve bol çeşitli kahvaltılar.", "en": "Budget-friendly, delicious and cozy breakfast spots in Kadikoy and Uskudar districts of Istanbul. Student-friendly prices and rich breakfast options."}'::jsonb,
        'kadikoy-uskudar-uygun-fiyatli-kahvalti',
        v_category_id,
        v_istanbul_id, -- Main location is Istanbul as it covers multiple districts
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: Nunu (Çengelköy/Beylerbeyi -> Uskudar)
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
        '{"tr": "Nunu"}'::jsonb,
        'nunu-cengelkoy-uskudar',
        'Çengelköy, Beylerbeyi, Üsküdar/İstanbul',
        v_uskudar_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Nunu+Cengelkoy',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'nunu-cengelkoy-uskudar';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order
    ) VALUES (
        v_collection_id,
        v_place_id,
        1
    );

    -- Place 2: Pişiköy (Kadıköy)
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
        '{"tr": "Pişiköy"}'::jsonb,
        'pisikoy-kadikoy',
        'Caferağa, Kadıköy/İstanbul',
        v_kadikoy_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Pisikoy+Kadikoy',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'pisikoy-kadikoy';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order
    ) VALUES (
        v_collection_id,
        v_place_id,
        2
    );

    -- Place 3: Nuva Coffee & Bakery (Üsküdar)
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
        '{"tr": "Nuva Coffee & Bakery"}'::jsonb,
        'nuva-coffee-bakery-uskudar',
        'Mimar Sinan, Üsküdar/İstanbul',
        v_uskudar_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Nuva+Coffee+Bakery+Uskudar',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'nuva-coffee-bakery-uskudar';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order
    ) VALUES (
        v_collection_id,
        v_place_id,
        3
    );

    -- Place 4: Müjgan (Kadıköy Yeldeğirmeni)
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
        '{"tr": "Müjgan"}'::jsonb,
        'mujgan-yeldegirmeni-kadikoy',
        'Rasimpaşa, Yeldeğirmeni, Kadıköy/İstanbul',
        v_kadikoy_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Mujgan+Yeldegirmeni+Kadikoy',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'mujgan-yeldegirmeni-kadikoy';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order
    ) VALUES (
        v_collection_id,
        v_place_id,
        4
    );

    -- Place 5: Temel Reis (Üsküdar)
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
        '{"tr": "Temel Reis"}'::jsonb,
        'temel-reis-uskudar',
        'Üsküdar Merkez, Üsküdar/İstanbul',
        v_uskudar_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Temel+Reis+Uskudar',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'temel-reis-uskudar';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order
    ) VALUES (
        v_collection_id,
        v_place_id,
        5
    );

END $$;

COMMIT;
