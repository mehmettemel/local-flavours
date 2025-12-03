-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_izmir_id uuid;
    v_category_id uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get or Create Location ID (İzmir)
    SELECT id INTO v_izmir_id FROM public.locations WHERE slug = 'izmir' OR names->>'tr' = 'İzmir' LIMIT 1;
    
    IF v_izmir_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'izmir', '{"tr": "İzmir", "en": "Izmir"}', true)
        RETURNING id INTO v_izmir_id;
        RAISE NOTICE 'Created missing location: İzmir';
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
        '{"tr": "İzmir''in En Lezzetli Kumru Durakları", "en": "Best Kumru Spots in Izmir"}'::jsonb,
        '{"tr": "İzmir''e gelip de Kumru yemeden dönmek olmaz! İşte yerel gurmelerin favorisi, en iyi malzemelerle hazırlanan, ekmeğiyle, malzemesiyle fark yaratan en iyi Kumrucular. Sokak lezzetlerinin kralı bu listede."}'::jsonb,
        'izmirin-en-lezzetli-kumru-duraklari',
        v_category_id,
        v_izmir_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: Kumrucu Hikmet
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
        '{"tr": "Kumrucu Hikmet"}'::jsonb,
        'kumrucu-hikmet',
        'İzmir',
        v_izmir_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Kumrucu+Hikmet+Izmir',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'kumrucu-hikmet';
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
        ARRAY['Klasik Kumru', 'Atom Kumru', 'Sandviç Çeşitleri']
    );

    -- Place 2: Kumrucu Şevki (Alaçatı Şubesi)
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
        '{"tr": "Kumrucu Şevki (Alaçatı Şubesi)"}'::jsonb,
        'kumrucu-sevki-alacati',
        'Alaçatı, İzmir',
        v_izmir_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Kumrucu+Sevki+Alacati',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'kumrucu-sevki-alacati';
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
        ARRAY['Kumru (Bol Malzemeli)', 'Sucuklu Tost', 'Soğuk Sandviçler']
    );

    -- Place 3: Kumrucu Ömür
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
        '{"tr": "Kumrucu Ömür"}'::jsonb,
        'kumrucu-omur',
        'İzmir',
        v_izmir_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Kumrucu+Omur+Izmir',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'kumrucu-omur';
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
        ARRAY['Kumru (Özel Soslu)', 'Ayvalık Tostu', 'Taze Sıkma Meyve Suları']
    );

    -- Place 4: Kumrucu Apo
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
        '{"tr": "Kumrucu Apo"}'::jsonb,
        'kumrucu-apo',
        'İzmir',
        v_izmir_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Kumrucu+Apo+Izmir',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'kumrucu-apo';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        4,
        ARRAY['Full Kumru', 'Kokoreç (İnce Doğranmış)', 'Bol Malzemeli Tostlar']
    );

    -- Place 5: Kumrucu Erol
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
        '{"tr": "Kumrucu Erol"}'::jsonb,
        'kumrucu-erol',
        'İzmir',
        v_izmir_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Kumrucu+Erol+Izmir',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'kumrucu-erol';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        5,
        ARRAY['Kumru (Fırınlanmış Ekmek)', 'İzmir Sandviç', 'Karışık Tost']
    );

END $$;

COMMIT;
