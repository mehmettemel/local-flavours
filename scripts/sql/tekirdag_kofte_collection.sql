-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_tekirdag_id uuid;
    v_collection_category_id uuid;
    v_cat_kebap uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get or Create Location ID (Tekirdağ)
    SELECT id INTO v_tekirdag_id FROM public.locations WHERE slug = 'tekirdag' OR names->>'tr' = 'Tekirdağ' LIMIT 1;
    
    IF v_tekirdag_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'tekirdag', '{"tr": "Tekirdağ", "en": "Tekirdag"}', false)
        RETURNING id INTO v_tekirdag_id;
        RAISE NOTICE 'Created missing location: Tekirdağ';
    END IF;

    -- 3. Get Category IDs
    -- Collection Category: Genel
    SELECT id INTO v_collection_category_id FROM public.categories WHERE slug = 'genel' LIMIT 1;
    IF v_collection_category_id IS NULL THEN RAISE EXCEPTION 'Category genel not found'; END IF;

    -- Place Category: Kebap & Ocakbaşı (Closest fit for Köfte)
    SELECT id INTO v_cat_kebap FROM public.categories WHERE slug = 'kebap-ocakbasi' LIMIT 1;
    IF v_cat_kebap IS NULL THEN RAISE EXCEPTION 'Category kebap-ocakbasi not found'; END IF;

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
        '{"tr": "Tekirdağ Köftesi: En İyi 4 Durak", "en": "Tekirdag Meatballs: Top 4 Spots"}'::jsonb,
        '{"tr": "Tekirdağ denince akla hemen köfte gelir ama \"nerede yediğin\" o deneyimi bambaşka bir seviyeye taşır. Sadece karın doyurmak için değil, o meşhur elastik kıvamı, yanında gelen acı sosun lezzetini ve mekanın ruhunu hissetmen için sana özel, nokta atışı bir liste."}'::jsonb,
        'tekirdag-kofte-rotasi',
        v_collection_category_id,
        v_tekirdag_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: Meşhur Köfteci Abdi Özcan
    INSERT INTO public.places (
        names,
        descriptions,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_score,
        vote_count,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Meşhur Köfteci Abdi Özcan"}'::jsonb,
        '{"tr": "Burası tam bir \"esnaf lokantası\" samimiyetinde ama lezzetiyle gurme restoranlara taş çıkartır. Yerlilerin \"gerçek Tekirdağ köftesi burada yenir\" dediği, turistik fabrikasyon üretimden uzak, butik ve efsane bir dükkan. Salaş ama lezzet on numara."}'::jsonb,
        'meshur-kofteci-abdi-ozcan-tekirdag',
        'Tekirdağ Merkez', -- Adres detaylandırılabilir
        v_tekirdag_id,
        v_cat_kebap,
        'https://www.google.com/maps/search/?api=1&query=Me%C5%9Fhur+K%C3%B6fteci+Abdi+%C3%96zcan+Tekirda%C4%9F+K%C3%B6ftecisi&query_place_id=ChIJWQ-ERIOKtBQR5L2rjKgRbJg',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'meshur-kofteci-abdi-ozcan-tekirdag';
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
        ARRAY['Tekirdağ Köftesi', 'Piyaz', 'Hayrabolu Tatlısı']
    );

    -- Place 2: Özcanlar Köfte | Sahil Şube
    INSERT INTO public.places (
        names,
        descriptions,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_score,
        vote_count,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Özcanlar Köfte | Sahil Şube"}'::jsonb,
        '{"tr": "Tekirdağ''ın en köklü markalarından biri. Sahil şubesini özellikle seçtim çünkü deniz manzarasına karşı köfte yemek ayrı bir keyif. Daha \"şık\" ve ferah bir ortam arıyorsan, ailenle rahatça gidebileceğin, servisi oturmuş bir klasik."}'::jsonb,
        'ozcanlar-kofte-sahil-sube-tekirdag',
        'Tekirdağ Sahil', -- Adres detaylandırılabilir
        v_tekirdag_id,
        v_cat_kebap,
        'https://www.google.com/maps/search/?api=1&query=%C3%96zcanlar+K%C3%B6fte+%7C+Sahil+%C5%9Eube&query_place_id=ChIJYfti85yKtBQRn3kPhLiHWD4',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'ozcanlar-kofte-sahil-sube-tekirdag';
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
        ARRAY['Tekirdağ Köftesi', 'Manda Yoğurdu', 'Kırmızı Biber Sosu']
    );

    -- Place 3: İki Kardeşler Et Lokantası
    INSERT INTO public.places (
        names,
        descriptions,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_score,
        vote_count,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "İki Kardeşler Et Lokantası"}'::jsonb,
        '{"tr": "Burası et konusunda tam bir uzman. Kasap kökenli oldukları için etin en iyisinden anlıyorlar. Köfteleri sulu sulu ve tam kıvamında. Sadece bir köfteci değil, etin her halini iyi bilen bir lezzet tapınağı diyebiliriz."}'::jsonb,
        'iki-kardesler-et-lokantasi-tekirdag',
        'Tekirdağ', -- Adres detaylandırılabilir
        v_tekirdag_id,
        v_cat_kebap,
        'https://www.google.com/maps/search/?api=1&query=%C4%B0ki+Karde%C5%9Fler+Et+Lokantas%C4%B1&query_place_id=ChIJvXTcbjb1tBQRW_LcKIwgbWw',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'iki-kardesler-et-lokantasi-tekirdag';
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
        ARRAY['Kasap Köfte', 'Tekirdağ Köftesi', 'Ev Yapımı Ayran']
    );

    -- Place 4: Etoba Restaurant
    INSERT INTO public.places (
        names,
        descriptions,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_score,
        vote_count,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Etoba Restaurant"}'::jsonb,
        '{"tr": "Listeye biraz \"rafine\" bir dokunuş ekleyelim. Klasik köfteci formatından biraz daha modern, restoran havasında bir yer. Sadece köftesiyle değil, genel gastronomi deneyimiyle ve sunumlarıyla öne çıkıyor. \"Köfte yiyelim ama ortam da biraz şık olsun\" dersen adres burası."}'::jsonb,
        'etoba-restaurant-tekirdag',
        'Hürriyet Mahallesi, Tekirdağ',
        v_tekirdag_id,
        v_cat_kebap,
        'https://www.google.com/maps/search/?api=1&query=Etoba+Restaurant&query_place_id=ChIJyXGVe7NhtBQRGJ5_1OQ2wzI',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'etoba-restaurant-tekirdag';
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
        ARRAY['Etoba Köfte', 'Satır Köfte', 'Dondurmalı İrmik Helvası']
    );

END $$;

COMMIT;
