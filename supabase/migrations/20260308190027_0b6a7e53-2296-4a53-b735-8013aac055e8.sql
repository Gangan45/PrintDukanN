INSERT INTO categories (name, slug, description, display_order, is_active)
SELECT 'Name Pencils', 'name-pencils', 'Personalized name pencils for kids and gifts', 13, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'name-pencils');