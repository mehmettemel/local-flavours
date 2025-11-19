-- Production Database Category Update Script
-- Run this in Supabase SQL Editor for production database

-- STEP 1: Clean up old categories
DELETE FROM categories
WHERE slug NOT IN (
  'yemek', 'kafe', 'gece-hayati', 'tatli-firin', 'genel',
  'kebap-ocakbasi', 'esnaf-lokantasi', 'doner', 'pide-lahmacun', 'burger',
  'sokak-lezzetleri', 'corbaci', 'kahvalti', 'balik-deniz', 'dunya-mutfagi',
  'nitelikli-kahve', 'turk-kahvesi', 'kitap-kafe', 'calisma-dostu',
  'pub', 'meyhane', 'sarap-evi', 'kokteyl-bar',
  'baklava-serbetli', 'pastane', 'dondurma', 'cikolata'
);

-- STEP 2: Insert or update main categories
INSERT INTO categories (slug, names, icon, display_order, parent_id)
VALUES
  ('yemek', '{"tr": "Yemek", "en": "Food"}', 'Utensils', 10, NULL),
  ('kafe', '{"tr": "Kafe", "en": "Cafe"}', 'Coffee', 20, NULL),
  ('gece-hayati', '{"tr": "Gece Hayatı", "en": "Nightlife"}', 'Martini', 30, NULL),
  ('tatli-firin', '{"tr": "Tatlı & Fırın", "en": "Dessert & Bakery"}', 'Croissant', 40, NULL),
  ('genel', '{"tr": "Genel / Diğer", "en": "General / Other"}', 'MapPin', 99, NULL)
ON CONFLICT (slug)
DO UPDATE SET
  names = EXCLUDED.names,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- STEP 3: Insert subcategories
-- Get parent IDs
DO $$
DECLARE
  yemek_id UUID;
  kafe_id UUID;
  gece_hayati_id UUID;
  tatli_firin_id UUID;
BEGIN
  -- Get parent category IDs
  SELECT id INTO yemek_id FROM categories WHERE slug = 'yemek';
  SELECT id INTO kafe_id FROM categories WHERE slug = 'kafe';
  SELECT id INTO gece_hayati_id FROM categories WHERE slug = 'gece-hayati';
  SELECT id INTO tatli_firin_id FROM categories WHERE slug = 'tatli-firin';

  -- Insert Yemek subcategories
  INSERT INTO categories (slug, names, icon, display_order, parent_id)
  VALUES
    ('kebap-ocakbasi', '{"tr": "Kebap & Ocakbaşı", "en": "Kebab & Grill"}', 'Flame', 1, yemek_id),
    ('esnaf-lokantasi', '{"tr": "Esnaf Lokantası", "en": "Traditional Eatery"}', 'Soup', 2, yemek_id),
    ('doner', '{"tr": "Döner", "en": "Doner Kebab"}', 'ChefHat', 3, yemek_id),
    ('pide-lahmacun', '{"tr": "Pide & Lahmacun", "en": "Pide & Lahmacun"}', 'Pizza', 4, yemek_id),
    ('burger', '{"tr": "Burger", "en": "Burger"}', 'Sandwich', 5, yemek_id),
    ('sokak-lezzetleri', '{"tr": "Sokak Lezzetleri", "en": "Street Food"}', 'Truck', 6, yemek_id),
    ('corbaci', '{"tr": "Çorbacı", "en": "Soup House"}', 'Soup', 7, yemek_id),
    ('kahvalti', '{"tr": "Kahvaltı & Börek", "en": "Breakfast"}', 'Sun', 8, yemek_id),
    ('balik-deniz', '{"tr": "Balık & Deniz Ürünleri", "en": "Seafood"}', 'Fish', 9, yemek_id),
    ('dunya-mutfagi', '{"tr": "Dünya Mutfağı", "en": "World Cuisine"}', 'Globe', 10, yemek_id)
  ON CONFLICT (slug)
  DO UPDATE SET
    names = EXCLUDED.names,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    parent_id = EXCLUDED.parent_id;

  -- Insert Kafe subcategories
  INSERT INTO categories (slug, names, icon, display_order, parent_id)
  VALUES
    ('nitelikli-kahve', '{"tr": "Nitelikli Kahve", "en": "Specialty Coffee"}', 'Bean', 1, kafe_id),
    ('turk-kahvesi', '{"tr": "Türk Kahvesi & Çay", "en": "Turkish Coffee & Tea"}', 'CupSoda', 2, kafe_id),
    ('kitap-kafe', '{"tr": "Kitap Kafe", "en": "Book Cafe"}', 'BookOpen', 3, kafe_id),
    ('calisma-dostu', '{"tr": "Çalışma Dostu", "en": "Work Friendly"}', 'Laptop', 4, kafe_id)
  ON CONFLICT (slug)
  DO UPDATE SET
    names = EXCLUDED.names,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    parent_id = EXCLUDED.parent_id;

  -- Insert Gece Hayatı subcategories
  INSERT INTO categories (slug, names, icon, display_order, parent_id)
  VALUES
    ('pub', '{"tr": "Pub & Bar", "en": "Pub & Bar"}', 'Beer', 1, gece_hayati_id),
    ('meyhane', '{"tr": "Meyhane", "en": "Meyhane (Tavern)"}', 'GlassWater', 2, gece_hayati_id),
    ('sarap-evi', '{"tr": "Şarap Evi", "en": "Wine House"}', 'Wine', 3, gece_hayati_id),
    ('kokteyl-bar', '{"tr": "Kokteyl Bar", "en": "Cocktail Bar"}', 'Martini', 4, gece_hayati_id)
  ON CONFLICT (slug)
  DO UPDATE SET
    names = EXCLUDED.names,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    parent_id = EXCLUDED.parent_id;

  -- Insert Tatlı & Fırın subcategories
  INSERT INTO categories (slug, names, icon, display_order, parent_id)
  VALUES
    ('baklava-serbetli', '{"tr": "Baklava & Şerbetli", "en": "Baklava & Traditional"}', 'Gem', 1, tatli_firin_id),
    ('pastane', '{"tr": "Pastane & Fırın", "en": "Patisserie & Bakery"}', 'Cake', 2, tatli_firin_id),
    ('dondurma', '{"tr": "Dondurma", "en": "Ice Cream"}', 'IceCream', 3, tatli_firin_id),
    ('cikolata', '{"tr": "Çikolatacı", "en": "Chocolatier"}', 'Candy', 4, tatli_firin_id)
  ON CONFLICT (slug)
  DO UPDATE SET
    names = EXCLUDED.names,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    parent_id = EXCLUDED.parent_id;
END $$;

-- STEP 4: Verify the results
SELECT
  CASE WHEN parent_id IS NULL THEN 'MAIN' ELSE 'SUB' END as type,
  slug,
  names->>'tr' as name_tr,
  icon,
  display_order
FROM categories
ORDER BY
  CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
  display_order;
