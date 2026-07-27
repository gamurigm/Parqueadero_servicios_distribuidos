-- ============================================================
-- SEED: ZonasDB (zonas)
-- tipo_zona: 0=VIP, 1=REGULAR, 2=EXTERNO, 3=INTERNO, 4=PREFERENCIAL
-- ============================================================

INSERT INTO zonas (id, nombre, codigo, tipo_zona, descripcion, estado, capacidad, fecha_creacion, fecha_modificacion) VALUES
  ('77777777-7777-4777-8777-777777777701', 'VIP',          'VIP-01', 0, 'Zona VIP exclusiva', 1, 5, NOW(), NOW()),
  ('77777777-7777-4777-8777-777777777702', 'Regular',      'REG-01', 1, 'Zona regular general', 1, 10, NOW(), NOW()),
  ('77777777-7777-4777-8777-777777777703', 'Preferencial', 'PRE-01', 4, 'Zona preferencial', 1, 3, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo_zona = EXCLUDED.tipo_zona,
  descripcion = EXCLUDED.descripcion,
  estado = EXCLUDED.estado,
  capacidad = EXCLUDED.capacidad,
  fecha_modificacion = NOW();

INSERT INTO espacios (id, codigo, descripcion, tipo_espacio, activo, estado, id_zona, fecha_creacion, fecha_modificacion) VALUES
  ('88888888-8888-4888-8888-888888888101', 'V-01', 'VIP - Auto 01', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777701', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888102', 'V-02', 'VIP - Auto 02', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777701', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888103', 'V-03', 'VIP - Auto 03', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777701', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888104', 'V-04', 'VIP - Auto 04', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777701', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888105', 'V-05', 'VIP - Auto 05', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777701', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888201', 'R-01', 'Regular - Auto 01', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888202', 'R-02', 'Regular - Auto 02', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888203', 'R-03', 'Regular - Auto 03', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888204', 'R-04', 'Regular - Auto 04', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888205', 'R-05', 'Regular - Auto 05', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888206', 'R-06', 'Regular - Auto 06', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888207', 'R-07', 'Regular - Auto 07', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888208', 'R-08', 'Regular - Auto 08', 'AUTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888209', 'M-01', 'Regular - Moto 01', 'MOTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888210', 'M-02', 'Regular - Moto 02', 'MOTO', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777702', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888301', 'P-01', 'Preferencial - Discapacitado 01', 'DISCAPACITADOS', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777703', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888302', 'P-02', 'Preferencial - Discapacitado 02', 'DISCAPACITADOS', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777703', NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888303', 'P-03', 'Preferencial - Discapacitado 03', 'DISCAPACITADOS', true, 'DISPONIBLE', '77777777-7777-4777-8777-777777777703', NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
  id = EXCLUDED.id,
  descripcion = EXCLUDED.descripcion,
  tipo_espacio = EXCLUDED.tipo_espacio,
  activo = EXCLUDED.activo,
  estado = EXCLUDED.estado,
  id_zona = EXCLUDED.id_zona,
  fecha_modificacion = NOW();
