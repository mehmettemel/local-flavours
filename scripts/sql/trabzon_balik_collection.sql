-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_trabzon_id uuid;
    v_collection_category_id uuid;
    v_cat_balik uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get or Create Location ID (Trabzon)
    SELECT id INTO v_trabzon_id FROM public.locations WHERE slug = 'trabzon' OR names->>'tr' = 'Trabzon' LIMIT 1;
    
    IF v_trabzon_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'trabzon', '{"tr": "Trabzon", "en": "Trabzon"}', false)
        RETURNING id INTO v_trabzon_id;
        RAISE NOTICE 'Created missing location: Trabzon';
    END IF;

    -- 3. Get Category IDs
    -- Collection Category: Genel
    SELECT id INTO v_collection_category_id FROM public.categories WHERE slug = 'genel' LIMIT 1;
    IF v_collection_category_id IS NULL THEN RAISE EXCEPTION 'Category genel not found'; END IF;

    -- Place Category: Balık & Deniz Ürünleri
    SELECT id INTO v_cat_balik FROM public.categories WHERE slug = 'balik-deniz' LIMIT 1;
    IF v_cat_balik IS NULL THEN RAISE EXCEPTION 'Category balik-deniz not found'; END IF;

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
        '{"tr": "Trabzon''da Balık Keyfi: Gurme Rotası", "en": "Trabzon Fish Gourmet Route"}'::jsonb,
        '{"tr": "Trabzon''da balık yemek, sadece karnını doyurmak değil, denizin o hırçın ama cömert ruhunu tabağında hissetmektir. Sadece turistlerin değil, ağzının tadını bilen yerlilerin gittiği, hem manzarasıyla hem de lezzetiyle öne çıkan o özel liste."}'::jsonb,
        'trabzon-balik-gurme-rotasi',
        v_collection_category_id,
        v_trabzon_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: Bordo Mavi Balık - Erşan Yılmaz
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
        '{"tr": "Bordo Mavi Balık - Erşan Yılmaz"}'::jsonb,
        '{"tr": "Burası sadece bir restoran değil, Trabzon''u ayaklarının altına seren bir teras. Şef Erşan Yılmaz’ın dokunuşlarıyla balık burada sanata dönüşüyor. Klasik salaş balıkçıdan ziyade, daha rafine ve şık bir deneyim arayanlar için \"gizli\" değil ama kesinlikle \"en değerli\" cevherlerden biri."}'::jsonb,
        'bordo-mavi-balik-trabzon',
        'Boztepe, İpekyolu Cd., 61030 Ortahisar/Trabzon',
        v_trabzon_id,
        v_cat_balik,
        'https://www.google.com/maps/search/?api=1&query=Bordo+Mavi+Balik+Trabzon',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'bordo-mavi-balik-trabzon';
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
        ARRAY['Barbun Buğulama', 'İskorpit Çorbası', 'Mezgit Tava']
    );

    -- Place 2: Balıklama Balık Lokantası
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
        '{"tr": "Balıklama Balık Lokantası"}'::jsonb,
        '{"tr": "Şehrin tam kalbinde, İskenderpaşa''da, süsten püsten uzak ama lezzette zirve bir mekan. Burası tam bir \"Esnaf Lokantası\" ruhu taşır ama balık konusunda profesördürler. Öğle arası kaçamağı yapan yerel halkın, kravatlısından öğrencisine herkesin buluşma noktasıdır."}'::jsonb,
        'baliklama-balik-lokantasi-trabzon',
        'İskenderpaşa, Şht. İbrahim Karaoğlanoğlu Cd. 15/A, 61100 Ortahisar/Trabzon',
        v_trabzon_id,
        v_cat_balik,
        'https://www.google.com/maps/search/?api=1&query=Baliklama+Balik+Lokantasi+Trabzon',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'baliklama-balik-lokantasi-trabzon';
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
        ARRAY['Hamsi Tava', 'Mısır Ekmeği', 'Turşu Kavurması', 'Somon Şiş']
    );

    -- Place 3: Fevzi Hoca Balık Köfte
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
        '{"tr": "Fevzi Hoca Balık Köfte"}'::jsonb,
        '{"tr": "Belki \"gizli\" bir yer değil, bir kurum. Ancak bir gurme rehberi Fevzi Hoca''yı anmadan geçemez. Neden? Çünkü standardı asla şaşmaz. Deniz kenarında devasa bir tesis olmasına rağmen, butik bir lezzet sunmayı başarırlar. Hem balığı hem de meşhur Akçaabat köftesini aynı kalitede yapan nadir yerlerden."}'::jsonb,
        'fevzi-hoca-balik-kofte-trabzon',
        'Akçakale, 61300 Akçaabat/Trabzon',
        v_trabzon_id,
        v_cat_balik,
        'https://www.google.com/maps/search/?api=1&query=Fevzi+Hoca+Balik+Kofte+Trabzon',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'fevzi-hoca-balik-kofte-trabzon';
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
        ARRAY['Laz Böreği', 'Trabzon Somonu', 'Kaygana']
    );

END $$;

COMMIT;
