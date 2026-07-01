-- ============================================================
-- SEED: Parqueadero - Microservicio Usuarios
-- Contraseñas:
--   testadmin  -> Admin123!
--   superusr   -> Super123!
--   jpropiet   -> Prop123!
--   mgomez     -> Prop123!
--   ezona1     -> Zona123!
-- ============================================================

-- Extensión UUID (por si acaso)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. ROLES ────────────────────────────────────────────────
INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at) VALUES
  ('11111111-0000-0000-0000-000000000001', 'admin',          'Administrador del sistema con acceso total excepto borrado físico', true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000002', 'super_user',     'Super usuario con acceso absoluto incluyendo borrado físico',       true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000003', 'propietario',    'Propietario de vehículo: gestiona sus vehículos y asignaciones',   true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000004', 'encargado_zona', 'Encargado de zona: gestiona zonas y espacios del parqueadero',     true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ── 2. PERSONAS ─────────────────────────────────────────────
INSERT INTO personas (id, active, first_name, middle_name, last_name, dni, email, phone, address, nationality, tipo, created_at, updated_at) VALUES
  -- Administrador
  ('22222222-0000-0000-0000-000000000001', true, 'Test',    NULL,    'Admin',   '1000000001', 'testadmin@parqueadero.ec',  '0991000001', 'Av. Admin 100',    'ecuatoriana', 'empleado',    NOW(), NOW()),
  -- Super User
  ('22222222-0000-0000-0000-000000000002', true, 'Super',   NULL,    'User',    '1000000002', 'superusr@parqueadero.ec',   '0991000002', 'Av. Super 200',    'ecuatoriana', 'empleado',    NOW(), NOW()),
  -- Propietarios
  ('22222222-0000-0000-0000-000000000003', true, 'Juan',    'Carlos','Perez',   '1000000003', 'jpropiet@parqueadero.ec',   '0991000003', 'Calle Prop 300',   'ecuatoriana', 'propietario', NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000004', true, 'Maria',   NULL,    'Gomez',   '1000000004', 'mgomez@parqueadero.ec',     '0991000004', 'Calle Prop 400',   'ecuatoriana', 'propietario', NOW(), NOW()),
  -- Encargado de Zona
  ('22222222-0000-0000-0000-000000000005', true, 'Ernesto', NULL,    'Zona',    '1000000005', 'ezona1@parqueadero.ec',     '0991000005', 'Av. Zona 500',     'ecuatoriana', 'empleado',    NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 3. USUARIOS ─────────────────────────────────────────────
-- Contraseñas hasheadas con crypto.scryptSync(pass, salt, 64)
-- formato: salt:hash
INSERT INTO usuarios (id, username, "passwordHash", active, created_at, updated_at) VALUES
  ('22222222-0000-0000-0000-000000000001', 'testadmin',
   'd7c1de1fc30976ec3af4e00a112af7db:facafca2ddb942745a27a1984d24f3829c529cab4e8cd207d09b78e658099f4f1af8598ae442ceafddd9c68a87853049d019f463af83dafaa3ddb1238da09497',
   true, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000002', 'superusr',
   'e7a89b300ee9870d0ce88471ed06045e:281ade89764530c06c17fc5be3aa547e5d8d4c3c912d300b568981543f226455985c894ba155cc4484bfad9a29eaf1e856456d64d19432c4f51a5ad4423f2039',
   true, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000003', 'jpropiet',
   '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf',
   true, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000004', 'mgomez',
   '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf',
   true, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000005', 'ezona1',
   'e4016ea5973ae2620338d9fde2baffe5:84c01520f55b80563bee9d254b42e8f299c9f66d0d4defadf5cc0c6678f0f721d2b18436867ce748db2a3ef8572a11d806ee130c6239011b4695ee4f58075844',
   true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  username     = EXCLUDED.username,
  "passwordHash" = EXCLUDED."passwordHash",
  active       = EXCLUDED.active,
  updated_at   = NOW();

-- ── 4. ASIGNACIÓN DE ROLES ──────────────────────────────────
INSERT INTO roles_usuario (id_rol, id_usuario, activo, assigned_at, updated_at) VALUES
  ('11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', true, NOW(), NOW()),  -- testadmin  -> admin
  ('11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', true, NOW(), NOW()),  -- superusr   -> super_user
  ('11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', true, NOW(), NOW()),  -- jpropiet   -> propietario
  ('11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', true, NOW(), NOW()),  -- mgomez     -> propietario (también encargado)
  ('11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000005', true, NOW(), NOW())   -- ezona1     -> encargado_zona
ON CONFLICT DO NOTHING;

-- ── 5. VERIFICACIÓN ─────────────────────────────────────────
SELECT u.username, r.nombre as rol, p.first_name || ' ' || p.last_name as nombre
FROM usuarios u
JOIN roles_usuario ru ON u.id = ru.id_usuario
JOIN roles r ON ru.id_rol = r.id
JOIN personas p ON p.id = u.id
ORDER BY r.nombre, u.username;
