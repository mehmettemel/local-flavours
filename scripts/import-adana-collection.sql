-- Adana Lezzetleri Koleksiyonu Import SQL
-- Supabase SQL Editor'de çalıştırılabilir

-- 1. Değişkenler (Manuel güncelleme gerekebilir)
DO $$
DECLARE
  v_user_id UUID := 'a973355b-ffba-45d3-86eb-091f5b97ae2f'; -- Kullanıcı ID'niz
  v_city_id UUID;
  v_category_id UUID;
  v_collection_id UUID;
  v_place_id UUID;
  v_collection_slug TEXT;
BEGIN
  -- 2. Şehir ID'sini bul (Adana)
  SELECT id INTO v_city_id
  FROM locations
  WHERE names->>'tr' ILIKE 'Adana'
    AND type = 'city'
  LIMIT 1;

  IF v_city_id IS NULL THEN
    RAISE EXCEPTION 'Adana şehri bulunamadı!';
  END IF;

  RAISE NOTICE 'Şehir ID bulundu: %', v_city_id;

  -- 3. Kategori ID'sini bul (Kebap & Ocakbaşı)
  SELECT id INTO v_category_id
  FROM categories
  WHERE slug = 'kebap-ocakbasi'
  LIMIT 1;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Kebap & Ocakbaşı kategorisi bulunamadı!';
  END IF;

  RAISE NOTICE 'Kategori ID bulundu: %', v_category_id;

  -- 4. Koleksiyon slug'ı oluştur (benzersiz olması için random suffix)
  v_collection_slug := 'adana-nin-yerel-lezzet-duraklari-' || substr(md5(random()::text), 1, 4);

  -- 5. Koleksiyonu oluştur
  INSERT INTO collections (
    slug,
    names,
    descriptions,
    creator_id,
    location_id,
    category_id,
    subcategory_id,
    status
  ) VALUES (
    v_collection_slug,
    '{"tr": "Adana''nın Yerel Lezzet Durakları", "en": "Adana''nın Yerel Lezzet Durakları"}'::jsonb,
    '{"tr": "Turist tuzaklarından uzak, 4.0 üzeri puana sahip ve yerlilerin müdavimi olduğu, gerçek Adana lezzetlerini sunan 5 özel mekan.", "en": "Turist tuzaklarından uzak, 4.0 üzeri puana sahip ve yerlilerin müdavimi olduğu, gerçek Adana lezzetlerini sunan 5 özel mekan."}'::jsonb,
    v_user_id,
    v_city_id,
    v_category_id,
    NULL,
    'active'
  ) RETURNING id INTO v_collection_id;

  RAISE NOTICE 'Koleksiyon oluşturuldu: %', v_collection_id;

  -- 6. Mekan 1: Tarihi İştah Kebap
  -- Önce var mı kontrol et
  SELECT id INTO v_place_id
  FROM places
  WHERE names->>'tr' ILIKE 'Tarihi İştah Kebap'
    AND location_id = v_city_id
  LIMIT 1;

  IF v_place_id IS NULL THEN
    -- Yoksa oluştur
    INSERT INTO places (
      slug,
      names,
      descriptions,
      address,
      location_id,
      category_id,
      status,
      vote_count,
      vote_score
    ) VALUES (
      'tarihi-istah-kebap-' || substr(md5(random()::text), 1, 4),
      '{"tr": "Tarihi İştah Kebap", "en": "Tarihi İştah Kebap"}'::jsonb,
      '{"tr": "Salaş atmosferi ve meşhur ''Jet Kebap'' spesiyali ile bilinen, lezzetin ön planda olduğu tarihi bir mekan.", "en": "Salaş atmosferi ve meşhur ''Jet Kebap'' spesiyali ile bilinen, lezzetin ön planda olduğu tarihi bir mekan."}'::jsonb,
      'Alidede Mah., Seyhan, Adana',
      v_city_id,
      v_category_id,
      'approved',
      0,
      0
    ) RETURNING id INTO v_place_id;
    RAISE NOTICE 'Yeni mekan oluşturuldu: Tarihi İştah Kebap';
  ELSE
    RAISE NOTICE 'Mevcut mekan bulundu: Tarihi İştah Kebap';
  END IF;

  -- Koleksiyona bağla
  INSERT INTO collection_places (collection_id, place_id, display_order, curator_note, recommended_items)
  VALUES (v_collection_id, v_place_id, 0, 'Salaş atmosferi ve meşhur ''Jet Kebap'' spesiyali ile bilinen, lezzetin ön planda olduğu tarihi bir mekan.', '["Jet Kebap", "Adana Kebap", "Ayran"]'::jsonb);

  -- 7. Mekan 2: Yeşil Kapı Kebap
  SELECT id INTO v_place_id
  FROM places
  WHERE names->>'tr' ILIKE 'Yeşil Kapı Kebap'
    AND location_id = v_city_id
  LIMIT 1;

  IF v_place_id IS NULL THEN
    INSERT INTO places (
      slug,
      names,
      descriptions,
      address,
      location_id,
      category_id,
      status,
      vote_count,
      vote_score
    ) VALUES (
      'yesil-kapi-kebap-' || substr(md5(random()::text), 1, 4),
      '{"tr": "Yeşil Kapı Kebap", "en": "Yeşil Kapı Kebap"}'::jsonb,
      '{"tr": "Gösterişten uzak, aile işletmesi sıcaklığında hizmet veren ve etiyle öne çıkan gerçek bir kebapçı.", "en": "Gösterişten uzak, aile işletmesi sıcaklığında hizmet veren ve etiyle öne çıkan gerçek bir kebapçı."}'::jsonb,
      'Reşatbey, Ordu Cad., Seyhan, Adana',
      v_city_id,
      v_category_id,
      'approved',
      0,
      0
    ) RETURNING id INTO v_place_id;
    RAISE NOTICE 'Yeni mekan oluşturuldu: Yeşil Kapı Kebap';
  ELSE
    RAISE NOTICE 'Mevcut mekan bulundu: Yeşil Kapı Kebap';
  END IF;

  INSERT INTO collection_places (collection_id, place_id, display_order, curator_note, recommended_items)
  VALUES (v_collection_id, v_place_id, 1, 'Gösterişten uzak, aile işletmesi sıcaklığında hizmet veren ve etiyle öne çıkan gerçek bir kebapçı.', '["Adana Kebap", "Külbastı", "Ezme"]'::jsonb);

  -- 8. Mekan 3: Kling Usta
  SELECT id INTO v_place_id
  FROM places
  WHERE names->>'tr' ILIKE 'Kling Usta'
    AND location_id = v_city_id
  LIMIT 1;

  IF v_place_id IS NULL THEN
    INSERT INTO places (
      slug,
      names,
      descriptions,
      address,
      location_id,
      category_id,
      status,
      vote_count,
      vote_score
    ) VALUES (
      'kling-usta-' || substr(md5(random()::text), 1, 4),
      '{"tr": "Kling Usta", "en": "Kling Usta"}'::jsonb,
      '{"tr": "İsmini sahibinin eski bir film karakterine benzerliğinden alan, yılların eskitemediği klasik bir lezzet durağı.", "en": "İsmini sahibinin eski bir film karakterine benzerliğinden alan, yılların eskitemediği klasik bir lezzet durağı."}'::jsonb,
      'Cemalpaşa, Toros Cad., Seyhan, Adana',
      v_city_id,
      v_category_id,
      'approved',
      0,
      0
    ) RETURNING id INTO v_place_id;
    RAISE NOTICE 'Yeni mekan oluşturuldu: Kling Usta';
  ELSE
    RAISE NOTICE 'Mevcut mekan bulundu: Kling Usta';
  END IF;

  INSERT INTO collection_places (collection_id, place_id, display_order, curator_note, recommended_items)
  VALUES (v_collection_id, v_place_id, 2, 'İsmini sahibinin eski bir film karakterine benzerliğinden alan, yılların eskitemediği klasik bir lezzet durağı.', '["Adana Kebap", "Beyti", "Şalgam"]'::jsonb);

  -- 9. Mekan 4: Bankalar Lokantası
  SELECT id INTO v_place_id
  FROM places
  WHERE names->>'tr' ILIKE 'Bankalar Lokantası'
    AND location_id = v_city_id
  LIMIT 1;

  IF v_place_id IS NULL THEN
    INSERT INTO places (
      slug,
      names,
      descriptions,
      address,
      location_id,
      category_id,
      status,
      vote_count,
      vote_score
    ) VALUES (
      'bankalar-lokantasi-' || substr(md5(random()::text), 1, 4),
      '{"tr": "Bankalar Lokantası", "en": "Bankalar Lokantası"}'::jsonb,
      '{"tr": "Adana''nın en eski esnaf lokantalarından biri. Kebap dışında muazzam tencere yemekleri de sunuyor.", "en": "Adana''nın en eski esnaf lokantalarından biri. Kebap dışında muazzam tencere yemekleri de sunuyor."}'::jsonb,
      'Kocavezir, Seyhan, Adana',
      v_city_id,
      v_category_id,
      'approved',
      0,
      0
    ) RETURNING id INTO v_place_id;
    RAISE NOTICE 'Yeni mekan oluşturuldu: Bankalar Lokantası';
  ELSE
    RAISE NOTICE 'Mevcut mekan bulundu: Bankalar Lokantası';
  END IF;

  INSERT INTO collection_places (collection_id, place_id, display_order, curator_note, recommended_items)
  VALUES (v_collection_id, v_place_id, 3, 'Adana''nın en eski esnaf lokantalarından biri. Kebap dışında muazzam tencere yemekleri de sunuyor.', '["Et Haşlama", "Güveç", "Pilav"]'::jsonb);

  -- 10. Mekan 5: Cik Cik Ali
  SELECT id INTO v_place_id
  FROM places
  WHERE names->>'tr' ILIKE 'Cik Cik Ali'
    AND location_id = v_city_id
  LIMIT 1;

  IF v_place_id IS NULL THEN
    INSERT INTO places (
      slug,
      names,
      descriptions,
      address,
      location_id,
      category_id,
      status,
      vote_count,
      vote_score
    ) VALUES (
      'cik-cik-ali-' || substr(md5(random()::text), 1, 4),
      '{"tr": "Cik Cik Ali", "en": "Cik Cik Ali"}'::jsonb,
      '{"tr": "Bol yeşillik ve salata ikramıyla bilinen, otantik atmosferini koruyan sanayi tipi kebapçı.", "en": "Bol yeşillik ve salata ikramıyla bilinen, otantik atmosferini koruyan sanayi tipi kebapçı."}'::jsonb,
      'Kurtuluş Cad., Seyhan, Adana',
      v_city_id,
      v_category_id,
      'approved',
      0,
      0
    ) RETURNING id INTO v_place_id;
    RAISE NOTICE 'Yeni mekan oluşturuldu: Cik Cik Ali';
  ELSE
    RAISE NOTICE 'Mevcut mekan bulundu: Cik Cik Ali';
  END IF;

  INSERT INTO collection_places (collection_id, place_id, display_order, curator_note, recommended_items)
  VALUES (v_collection_id, v_place_id, 4, 'Bol yeşillik ve salata ikramıyla bilinen, otantik atmosferini koruyan sanayi tipi kebapçı.', '["Adana Kebap", "Ciğer Şiş", "Söğüş Salata"]'::jsonb);

  RAISE NOTICE '✅ İşlem başarıyla tamamlandı!';
  RAISE NOTICE 'Koleksiyon slug: %', v_collection_slug;
END $$;
