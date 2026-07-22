-- ============================================================
-- SEED: ZonasDB (zonas)
-- 3 zonas con sus respectivos espacios
-- tipo_zona: 0=VIP, 1=REGULAR, 2=EXTERNO, 3=INTERNO, 4=PREFERENCIAL
-- ============================================================

-- ── 1. ZONAS ────────────────────────────────────────────────
INSERT INTO zonas (id, nombre, codigo, tipo_zona, descripcion, estado, capacidad, fecha_creacion, fecha_modificacion) VALUES
  (gen_random_uuid(), 'VIP',         'VIP-01', 0, 'Zona VIP exclusiva',                          1, 5,  NOW(), NOW()),
  (gen_random_uuid(), 'Regular',     'REG-01', 1, 'Zona regular general',                         1, 10, NOW(), NOW()),
  (gen_random_uuid(), 'Preferencial','PRE-01', 4, 'Zona preferencial (discapacitados y embarazadas)', 1, 3, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ── 2. ESPACIOS ─────────────────────────────────────────────
-- Zona VIP (5 espacios, tipo AUTO)
INSERT INTO espacios (id, codigo, descripcion, tipo_espacio, activo, estado, id_zona, fecha_creacion, fecha_modificacion) VALUES
  (gen_random_uuid(), 'V-01', 'VIP - Auto 01', 'AUTO', true, 'DISPONIBLE',  (SELECT id FROM zonas WHERE codigo = 'VIP-01'), NOW(), NOW()),
  (gen_random_uuid(), 'V-02', 'VIP - Auto 02', 'AUTO', true, 'DISPONIBLE',  (SELECT id FROM zonas WHERE codigo = 'VIP-01'), NOW(), NOW()),
  (gen_random_uuid(), 'V-03', 'VIP - Auto 03', 'AUTO', true, 'DISPONIBLE',  (SELECT id FROM zonas WHERE codigo = 'VIP-01'), NOW(), NOW()),
  (gen_random_uuid(), 'V-04', 'VIP - Auto 04', 'AUTO', true, 'DISPONIBLE',  (SELECT id FROM zonas WHERE codigo = 'VIP-01'), NOW(), NOW()),
  (gen_random_uuid(), 'V-05', 'VIP - Auto 05', 'AUTO', true, 'DISPONIBLE',  (SELECT id FROM zonas WHERE codigo = 'VIP-01'), NOW(), NOW());

-- Zona Regular (8 autos + 2 motos)
INSERT INTO espacios (id, codigo, descripcion, tipo_espacio, activo, estado, id_zona, fecha_creacion, fecha_modificacion) VALUES
  (gen_random_uuid(), 'R-01', 'Regular - Auto 01', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'R-02', 'Regular - Auto 02', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'R-03', 'Regular - Auto 03', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'R-04', 'Regular - Auto 04', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'R-05', 'Regular - Auto 05', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'R-06', 'Regular - Auto 06', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'R-07', 'Regular - Auto 07', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'R-08', 'Regular - Auto 08', 'AUTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'M-01', 'Regular - Moto 01', 'MOTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW()),
  (gen_random_uuid(), 'M-02', 'Regular - Moto 02', 'MOTO', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'REG-01'), NOW(), NOW());

-- Zona Preferencial (3 discapacitados)
INSERT INTO espacios (id, codigo, descripcion, tipo_espacio, activo, estado, id_zona, fecha_creacion, fecha_modificacion) VALUES
  (gen_random_uuid(), 'P-01', 'Preferencial - Discapacitado 01', 'DISCAPACITADOS', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'PRE-01'), NOW(), NOW()),
  (gen_random_uuid(), 'P-02', 'Preferencial - Discapacitado 02', 'DISCAPACITADOS', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'PRE-01'), NOW(), NOW()),
  (gen_random_uuid(), 'P-03', 'Preferencial - Discapacitado 03', 'DISCAPACITADOS', true, 'DISPONIBLE', (SELECT id FROM zonas WHERE codigo = 'PRE-01'), NOW(), NOW());
