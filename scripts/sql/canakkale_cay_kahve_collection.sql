-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_canakkale_id uuid;
    v_cat_turk_kahvesi uuid;
    v_cat_nitelikli_kahve uuid;
    v_cat_pastane uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get or Create Location ID (Çanakkale)
    SELECT id INTO v_canakkale_id FROM public.locations WHERE slug = 'canakkale' OR names->>'tr' = 'Çanakkale' LIMIT 1;
    
    IF v_canakkale_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'canakkale', '{"tr": "Çanakkale", "en": "Çanakkale"}', false)
        RETURNING id INTO v_canakkale_id;
        RAISE NOTICE 'Created missing location: Çanakkale';
    END IF;

    -- 3. Get Category IDs
    -- Türk Kahvesi & Çay
    SELECT id INTO v_cat_turk_kahvesi FROM public.categories WHERE slug = 'turk-kahvesi' LIMIT 1;
    IF v_cat_turk_kahvesi IS NULL THEN
        RAISE EXCEPTION 'Category turk-kahvesi not found';
    END IF;

    -- Nitelikli Kahve
    SELECT id INTO v_cat_nitelikli_kahve FROM public.categories WHERE slug = 'nitelikli-kahve' LIMIT 1;
    IF v_cat_nitelikli_kahve IS NULL THEN
        RAISE EXCEPTION 'Category nitelikli-kahve not found';
    END IF;

    -- Pastane & Fırın
    SELECT id INTO v_cat_pastane FROM public.categories WHERE slug = 'pastane' LIMIT 1;
    IF v_cat_pastane IS NULL THEN
        RAISE EXCEPTION 'Category pastane not found';
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
        '{"tr": "Çanakkale''nin En İyi Çay & Kahve Mekanları", "en": "Best Tea & Coffee Spots in Çanakkale"}'::jsonb,
        '{"tr": "Boğaz manzaralı çay bahçelerinden, tarihi hanlara ve nitelikli kahve dükkanlarına kadar Çanakkale''nin en keyifli mekanları. Dost sohbetleri ve huzurlu anlar için özenle seçildi."}'::jsonb,
        'canakkale-cay-kahve-mekanlari',
        v_cat_turk_kahvesi, -- Main category for the collection
        v_canakkale_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: Şakir'in Yeri (Çay Bahçesi & Kafe)
    INSERT INTO public.places (
        names,
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
        '{"tr": "Şakir''in Yeri"}'::jsonb,
        'sakirin-yeri-canakkale',
        'Fevzipaşa, Gümrük Sk. 1/3, 17100 Çanakkale Merkez',
        v_canakkale_id,
        v_cat_turk_kahvesi,
        'https://www.google.com/maps/search/?api=1&query=Şakir''in+Yeri+Çanakkale',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO UPDATE SET 
        vote_score = 0,
        vote_count = 0
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'sakirin-yeri-canakkale';
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
        ARRAY['Manzara', 'Tost', 'Çay']
    );

    -- Place 2: Tarihi Yalı Hanı
    INSERT INTO public.places (
        names,
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
        '{"tr": "Tarihi Yalı Hanı"}'::jsonb,
        'tarihi-yali-hani-canakkale',
        'Kemalpaşa, Fetvane Sk. No:31, 17000 Çanakkale Merkez',
        v_canakkale_id,
        v_cat_turk_kahvesi,
        'https://www.google.com/maps/search/?api=1&query=Tarihi+Yalı+Hanı+Çanakkale',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO UPDATE SET 
        vote_score = 0,
        vote_count = 0
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'tarihi-yali-hani-canakkale';
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
        ARRAY['Yalı Tostu', 'Közde Türk Kahvesi', 'Bitki Çayları']
    );

    -- Place 3: Ezop Coffee House
    INSERT INTO public.places (
        names,
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
        '{"tr": "Ezop Coffee House"}'::jsonb,
        'ezop-coffee-house-canakkale',
        'Fevzipaşa, Çarşı Cd. No:8, 17100 Çanakkale Merkez',
        v_canakkale_id,
        v_cat_nitelikli_kahve,
        'https://www.google.com/maps/search/?api=1&query=Ezop+Coffee+House+Çanakkale',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO UPDATE SET 
        vote_score = 0,
        vote_count = 0
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'ezop-coffee-house-canakkale';
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
        ARRAY['Cold Brew', 'V60', 'San Sebastian Cheesecake']
    );

    -- Place 4: Cankuş Cafe
    INSERT INTO public.places (
        names,
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
        '{"tr": "Cankuş Cafe"}'::jsonb,
        'cankus-cafe-canakkale',
        'Fevzipaşa, Çarşı Cd. No:38-40, 17100 Çanakkale Merkez',
        v_canakkale_id,
        v_cat_pastane,
        'https://www.google.com/maps/search/?api=1&query=Cankuş+Cafe+Çanakkale',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO UPDATE SET 
        vote_score = 0,
        vote_count = 0
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'cankus-cafe-canakkale';
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
        ARRAY['Ev Yapımı Limonata', 'Tuzlu Kurabiye', 'Ev Poğaçası']
    );

    -- Place 5: Assos Cafe
    INSERT INTO public.places (
        names,
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
        '{"tr": "Assos Cafe"}'::jsonb,
        'assos-cafe-canakkale',
        'Cevat Paşa, Mehmetçik Blv. No:2, 17100 Çanakkale Merkez',
        v_canakkale_id,
        v_cat_pastane,
        'https://www.google.com/maps/search/?api=1&query=Assos+Cafe+Çanakkale',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO UPDATE SET 
        vote_score = 0,
        vote_count = 0
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'assos-cafe-canakkale';
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
        ARRAY['Serpme Kahvaltı', 'Çikolatalı Pasta', 'Brunch']
    );

END $$;

COMMIT;
