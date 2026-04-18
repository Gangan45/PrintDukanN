-- Smart shape & photo_count assignment based on OMGS product names
-- Expand shape vocabulary to match OMGS categories

-- 1) HEXA / HEXAGON shape products
UPDATE public.products SET shape = 'hexa', photo_count = 7
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%hexa%';

-- 2) BUTTERFLY shape (2-photo)
UPDATE public.products SET shape = 'butterfly', photo_count = 2
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%butterfly%';

-- 3) DOME shape (top-rounded arch)
UPDATE public.products SET shape = 'dome', photo_count = 1
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%dome%';

-- 4) HEART shape (couple heart products)
UPDATE public.products SET shape = 'heart'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%heart%';

-- 5) FLOWER FACE / FLOWER shape products
UPDATE public.products SET shape = 'flower'
WHERE category = 'Acrylic Wall Photo' AND (lower(name) LIKE '%flower face%' OR lower(name) LIKE 'flower acrylic%');

-- 6) BEAN shape (override portrait/landscape default for bean named products)
UPDATE public.products SET shape = 'bean-portrait'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%bean%' AND lower(name) LIKE '%portrait%';

UPDATE public.products SET shape = 'bean-landscape'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%bean%' AND lower(name) LIKE '%landscape%';

-- 7) EGG shape orientation specific
UPDATE public.products SET shape = 'egg-portrait'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%egg%' AND lower(name) LIKE '%portrait%';

UPDATE public.products SET shape = 'egg-landscape'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%egg%' AND lower(name) LIKE '%landscape%';

-- 8) Rounded rect (squircle) variants
UPDATE public.products SET shape = 'squircle-portrait'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%rounded rect%' AND lower(name) LIKE '%portrait%';

UPDATE public.products SET shape = 'squircle-landscape'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%rounded rect%' AND lower(name) LIKE '%landscape%';

-- 9) Extra rounded variants
UPDATE public.products SET shape = 'extra-rounded-portrait'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%extra rounded%' AND lower(name) LIKE '%portrait%';

UPDATE public.products SET shape = 'extra-rounded-landscape'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%extra rounded%' AND lower(name) LIKE '%landscape%';

-- 10) Square round
UPDATE public.products SET shape = 'square-round'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%square round%';

-- 11) Balloon variants
UPDATE public.products SET shape = 'balloon'
WHERE category = 'Acrylic Wall Photo' AND lower(name) LIKE '%balloon%';

-- 12) Photo count corrections for collages based on numeric prefix in name
UPDATE public.products SET photo_count = 12
WHERE category = 'Acrylic Wall Photo' AND lower(name) ~ '(^|\s)12 ';

UPDATE public.products SET photo_count = 9
WHERE category = 'Acrylic Wall Photo' AND lower(name) ~ '(^|\s)9 ';

UPDATE public.products SET photo_count = 8
WHERE category = 'Acrylic Wall Photo' AND lower(name) ~ '(^|\s)8 ';

UPDATE public.products SET photo_count = 7
WHERE category = 'Acrylic Wall Photo' AND (lower(name) ~ '(^|\s)7 ' OR lower(name) LIKE '%hexa%');

UPDATE public.products SET photo_count = 6
WHERE category = 'Acrylic Wall Photo' AND (lower(name) ~ '(^|\s)1 large \+ 5%' OR lower(name) LIKE '%6 pic%' OR lower(name) LIKE '%6 photo%');

UPDATE public.products SET photo_count = 5
WHERE category = 'Acrylic Wall Photo' AND (lower(name) ~ '(^|\s)5 pic%' OR lower(name) ~ '(^|\s)5 photo%');

UPDATE public.products SET photo_count = 4
WHERE category = 'Acrylic Wall Photo' AND (lower(name) ~ '(^|\s)4 pic%' OR lower(name) ~ '(^|\s)4 photo%' OR lower(name) LIKE '%4 new born%' OR lower(name) LIKE '%love 4 pic%' OR lower(name) LIKE '%cinematic memories%');

UPDATE public.products SET photo_count = 3
WHERE category = 'Acrylic Wall Photo' AND (lower(name) ~ '(^|\s)3 pic%' OR lower(name) ~ '(^|\s)3 photo%' OR lower(name) LIKE '%couple 3%' OR lower(name) LIKE '%3 pics collage%');

UPDATE public.products SET photo_count = 2
WHERE category = 'Acrylic Wall Photo' AND (lower(name) ~ '(^|\s)2 pic%' OR lower(name) ~ '(^|\s)2 photo%' OR lower(name) LIKE '%butterfly%' OR lower(name) LIKE '%new born baby + parents%');

-- 13) Dual border flag — store inside frames jsonb so customizer can render dual-border ring
UPDATE public.products
SET frames = COALESCE(frames, '[]'::jsonb) || '[{"id":"dual","name":"Dual Border","is_default":true}]'::jsonb
WHERE category = 'Acrylic Wall Photo' 
  AND lower(name) LIKE '%dual border%'
  AND NOT (frames::text LIKE '%"dual"%');