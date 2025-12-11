-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_kayseri_id uuid;
    v_collection_category_id uuid;
    v_cat_kebap uuid;
    v_cat_doner uuid;
    v_cat_pide uuid;
    v_cat_kahvalti uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get or Create Location ID (Kayseri)
    SELECT id INTO v_kayseri_id FROM public.locations WHERE slug = 'kayseri' OR names->>'tr' = 'Kayseri' LIMIT 1;
    
    IF v_kayseri_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'kayseri', '{"tr": "Kayseri", "en": "Kayseri"}', false)
        RETURNING id INTO v_kayseri_id;
        RAISE NOTICE 'Created missing location: Kayseri';
    END IF;

    -- 3. Get Category IDs
    -- Collection Category: Genel
    SELECT id INTO v_collection_category_id FROM public.categories WHERE slug = 'genel' LIMIT 1;
    IF v_collection_category_id IS NULL THEN RAISE EXCEPTION 'Category genel not found'; END IF;

    -- Place Categories
    SELECT id INTO v_cat_kebap FROM public.categories WHERE slug = 'kebap-ocakbasi' LIMIT 1;
    SELECT id INTO v_cat_doner FROM public.categories WHERE slug = 'doner' LIMIT 1;
    SELECT id INTO v_cat_pide FROM public.categories WHERE slug = 'pide-lahmacun' LIMIT 1;
    SELECT id INTO v_cat_kahvalti FROM public.categories WHERE slug = 'kahvalti' LIMIT 1;

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
        '{"tr": "Kayseri''nin Meşhur Lezzet Haritası", "en": "Kayseri''s Famous Flavor Map"}'::jsonb,
        '{"tr": "Kayseri denince akla hemen mantı ve pastırma gelir ama bu şehirde damak çatlatan çok daha derin bir mutfak kültürü var. Senin için sadece turistlerin gittiği değil, yerlilerin de lezzet için sıraya girdiği, puanı şişirilmemiş ama lezzeti tavan yapmış o özel noktaları seçtim."}'::jsonb,
        'kayseri-lezzet-haritasi',
        v_collection_category_id,
        v_kayseri_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: Altınsaray Pöç Tandır
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
        '{"tr": "Altınsaray Pöç Tandır"}'::jsonb,
        '{"tr": "Kayseri''ye gelip de \"Pöç\" (dananın kuyruk sokumu eti) yemeden dönmek olmaz. Burası, bu işin piri sayılan yerlerden. Saatlerce güveçte pişen etin lokum gibi dağılmasına şahit olacaksın."}'::jsonb,
        'altinsaray-poc-tandir-kayseri',
        'Cumhuriyet, Nazmi Toker Cd. No:18, 38040 Melikgazi/Kayseri',
        v_kayseri_id,
        v_cat_kebap,
        'https://www.google.com/maps/search/?api=1&query=Altinsaray+Poc+Tandir+Kayseri',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'altinsaray-poc-tandir-kayseri';
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
        ARRAY['Güveçte Pöç', 'Kuzu Tandır', 'İç Pilav']
    );

    -- Place 2: Elmacıoğlu İskender
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
        '{"tr": "Elmacıoğlu İskender"}'::jsonb,
        '{"tr": "Şehrin en köklü ve klasik mekanlarından biri. \"İskender Kayseri''de mi yenir?\" deme, burası standartları çok yukarı taşımış bir işletme. Hem servis hızı hem de lezzet istikrarı ile tam bir güvenli liman."}'::jsonb,
        'elmacioglu-iskender-kayseri',
        'Cumhuriyet, Sultanhamam Cd. 6B, 38040 Melikgazi/Kayseri',
        v_kayseri_id,
        v_cat_doner,
        'https://www.google.com/maps/search/?api=1&query=Elmacioglu+Iskender+Kayseri',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'elmacioglu-iskender-kayseri';
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
        ARRAY['İskender Kebap', 'Özel Kayseri Mantısı']
    );

    -- Place 3: Gubate Restaurant
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
        '{"tr": "Gubate Restaurant"}'::jsonb,
        '{"tr": "İşte sana bir \"gizli cevher\" (hidden gem). Kayseri''deki Çerkes kültürünü mutfağa en iyi yansıtan yerlerden. Kahvaltısı efsane olsa da, hamur işleri ve akşam yemekleri de bir o kadar iddialı. Daha butik ve samimi bir havası var."}'::jsonb,
        'gubate-restaurant-kayseri',
        'Mevlana, Mehmet Akif Ersoy Cd. Aydın Sit D:22/C, 38280 Talas/Kayseri',
        v_kayseri_id,
        v_cat_kahvalti,
        'https://www.google.com/maps/search/?api=1&query=Gubate+Restaurant+Kayseri',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'gubate-restaurant-kayseri';
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
        ARRAY['Gubate', 'Velibah', 'Hınkal Mantı']
    );

    -- Place 4: Bağdat Pöç Tandır
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
        '{"tr": "Bağdat Pöç Tandır"}'::jsonb,
        '{"tr": "Pöç konusunda Altınsaray ile tatlı bir rekabet içindeler ve bu rekabetten kazanan hep biz müşteriler oluyoruz. Daha geleneksel, salaş ama lezzetiyle \"vay be\" dedirten bir esnaf lokantası havası var."}'::jsonb,
        'bagdat-poc-tandir-kayseri',
        'Kiçikapı Mah. Vatan Cad, Şekerbank Arkası No:34/B, 38050 Melikgazi/Kayseri',
        v_kayseri_id,
        v_cat_kebap,
        'https://www.google.com/maps/search/?api=1&query=Bagdat+Poc+Tandir+Kayseri',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'bagdat-poc-tandir-kayseri';
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
        ARRAY['Pöç Tandır', 'Ayak Paça Çorbası', 'Beyin Söğüş']
    );

    -- Place 5: Bereket Develi Cıvıklısı (Gültepe Şubesi)
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
        '{"tr": "Bereket Develi Cıvıklısı (Gültepe Şubesi)"}'::jsonb,
        '{"tr": "Kayseri''nin Develi ilçesine has o meşhur \"Cıvıklı\"yı (Kuşbaşılı Pide diyip geçmeyin, hakaret sayılır!) merkezde en iyi yapan yerlerden. Çıtır çıtır hamuru ve el kıyması ile yapılan harcı muazzam."}'::jsonb,
        'bereket-develi-civiklisi-gultepe-kayseri',
        'Şehit Üsteğmen Mustafa Şimşek Cad. Gültepe, 38030 Melikgazi/Kayseri',
        v_kayseri_id,
        v_cat_pide,
        'https://www.google.com/maps/search/?api=1&query=Bereket+Develi+Civiklisi+Gultepe+Kayseri',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'bereket-develi-civiklisi-gultepe-kayseri';
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
        ARRAY['Develi Cıvıklısı', 'Tahinli Pide']
    );

    -- Place 6: Çemen's Gurme Mutfak
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
        '{"tr": "Çemen''s Gurme Mutfak"}'::jsonb,
        '{"tr": "Hem alışveriş yapayım hem de şu meşhur \"Yağlama\"yı modern ve temiz bir sunumla yiyeyim dersen adres burası. Şebitleri (lavaşları) incecik, harcı tam kıvamında. Çıkışta pastırma alışverişini de yapabilirsin."}'::jsonb,
        'cemens-gurme-mutfak-kayseri',
        'Esenyurt, Erciyes Blv. No:176, 38050 Melikgazi/Kayseri',
        v_kayseri_id,
        v_cat_kahvalti,
        'https://www.google.com/maps/search/?api=1&query=Cemens+Gurme+Mutfak+Kayseri',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'cemens-gurme-mutfak-kayseri';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        6,
        ARRAY['Kayseri Yağlaması', 'Pastırmalı Humus', 'Yöresel Kahvaltı Tabağı']
    );

END $$;

COMMIT;
