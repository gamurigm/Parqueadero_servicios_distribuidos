-- ============================================================
-- SEED: ZonasDB (zonas)
-- 3 zonas con sus respectivos espacios
-- Espacios referencian zonas con FK física (misma DB)
-- Espacios tienen UUIDs fijos para referencia desde tickets
-- ============================================================

-- ── 1. ZONAS ────────────────────────────────────────────────
INSERT INTO zonas (id, nombre, codigo, tipo_zona, descripcion, estado, capacidad, fecha_creacion, fecha_modificacion) VALUES
  ('44444444-0000-0000-0000-000000000001', 'VIP',        'VIP-01', 'VIP',        'Zona VIP exclusiva',         1, 5,  NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000002', 'Regular',    'REG-01', 'REGULAR',    'Zona regular general',        1, 10, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000003', 'Preferencial','PRE-01','PREFERENCIAL','Zona preferencial (discapacitados y embarazadas)', 1, 3, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ── 2. ESPACIOS ─────────────────────────────────────────────
-- Zona VIP (5 espacios, tipo AUTO)
INSERT INTO espacios (id, codigo, descripcion, tipo_espacio, activo, estado, id_zona, fecha_creacion, fecha_modificacion) VALUES
  ('55555555-0000-0000-0000-000000000001', 'V-01', 'VIP - Auto 01', 'AUTO', true, 'DISPONIBLE',  '44444444-0000-0000-0000-000000000001', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000002', 'V-02', 'VIP - Auto 02', 'AUTO', true, 'DISPONIBLE',  '44444444-0000-0000-0000-000000000001', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000003', 'V-03', 'VIP - Auto 03', 'AUTO', true, 'DISPONIBLE',  '44444444-0000-0000-0000-000000000001', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000004', 'V-04', 'VIP - Auto 04', 'AUTO', true, 'DISPONIBLE',  '44444444-0000-0000-0000-000000000001', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000005', 'V-05', 'VIP - Auto 05', 'AUTO', true, 'DISPONIBLE',  '44444444-0000-0000-0000-000000000001', NOW(), NOW());

-- Zona Regular (8 autos + 2 motos)
INSERT INTO espacios (id, codigo, descripcion, tipo_espacio, activo, estado, id_zona, fecha_creacion, fecha_modificacion) VALUES
  ('55555555-0000-0000-0000-000000000006', 'R-01', 'Regular - Auto 01', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000007', 'R-02', 'Regular - Auto 02', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000008', 'R-03', 'Regular - Auto 03', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000009', 'R-04', 'Regular - Auto 04', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000010', 'R-05', 'Regular - Auto 05', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000011', 'R-06', 'Regular - Auto 06', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000012', 'R-07', 'Regular - Auto 07', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000013', 'R-08', 'Regular - Auto 08', 'AUTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000014', 'M-01', 'Regular - Moto 01', 'MOTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000015', 'M-02', 'Regular - Moto 02', 'MOTO', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000002', NOW(), NOW());

-- Zona Preferencial (3 discapacitados)
INSERT INTO espacios (id, codigo, descripcion, tipo_espacio, activo, estado, id_zona, fecha_creacion, fecha_modificacion) VALUES
  ('55555555-0000-0000-0000-000000000016', 'P-01', 'Preferencial - Discapacitado 01', 'DISCAPACITADOS', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000003', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000017', 'P-02', 'Preferencial - Discapacitado 02', 'DISCAPACITADOS', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000003', NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000018', 'P-03', 'Preferencial - Discapacitado 03', 'DISCAPACITADOS', true, 'DISPONIBLE', '44444444-0000-0000-0000-000000000003', NOW(), NOW());
