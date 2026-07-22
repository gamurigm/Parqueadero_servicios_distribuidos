-- ============================================================
-- SEED: Parqueadero - Microservicio Usuarios
-- ============================================================
-- CREDENCIALES (username / password / rol):
--   admin1  / Admin123!  / admin
--   superusr   / Super123!  / super_user
--   jpropiet   / Prop123!   / propietario
--   mgomez     / Prop123!   / propietario
--   emple1    / Zona123!   / encargado_zona
--   auditor1   / Audit123!  / auditor
-- ============================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. ROLES ────────────────────────────────────────────────
INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at) VALUES
  ('e5b7c8d9-0f1a-42b3-8c4d-5e6f7a8b9c0d', 'admin',          'Administrador del sistema con acceso total excepto borrado físico', true, NOW(), NOW()),
  ('f6c8d9e0-1a2b-43c4-9d5e-6f7a8b9c0d1e', 'super_user',     'Super usuario con acceso absoluto incluyendo borrado físico',       true, NOW(), NOW()),
  ('a7d9e0f1-2b3c-44d5-a6f7-8b9c0d1e2f3a', 'propietario',    'Propietario de vehículo: gestiona sus vehículos y asignaciones',   true, NOW(), NOW()),
  ('b8e0f1a2-3c4d-45e6-b7a8-9c0d1e2f3a4b', 'encargado_zona', 'Encargado de zona: gestiona zonas y espacios del parqueadero',     true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ── 2. PERSONAS ─────────────────────────────────────────────
INSERT INTO personas (id, active, first_name, middle_name, last_name, dni, email, phone, address, nationality, tipo, created_at, updated_at) VALUES
  -- Administrador
  ('c9f1a2b3-4d5e-46f7-8a9b-0c1d2e3f4a5b', true, 'Test',    NULL,    'Admin',   '1726549830', 'testadmin@parqueadero.ec',  '0991000001', 'Av. Admin 100',    'ecuatoriana', 'empleado',    NOW(), NOW()),
  -- Super User
  ('d0a2b3c4-5e6f-47a8-9b0c-1d2e3f4a5b6c', true, 'Super',   NULL,    'User',    '1715678901', 'superusr@parqueadero.ec',   '0991000002', 'Av. Super 200',    'ecuatoriana', 'empleado',    NOW(), NOW()),
  -- Propietarios
  ('e1b3c4d5-6f7a-48b9-0c1d-2e3f4a5b6c7d', true, 'Juan',    'Carlos','Perez',   '1723456784', 'jpropiet@parqueadero.ec',   '0991000003', 'Calle Prop 300',   'ecuatoriana', 'propietario', NOW(), NOW()),
  ('f2c4d5e6-7a8b-49c0-1d2e-3f4a5b6c7d8e', true, 'Maria',   NULL,    'Gomez',   '1712345678', 'mgomez@parqueadero.ec',     '0991000004', 'Calle Prop 400',   'ecuatoriana', 'propietario', NOW(), NOW()),
  -- Encargado de Zona
  ('a3d5e6f7-8b9c-40d1-2e3f-4a5b6c7d8e9f', true, 'Ernesto', NULL,    'Zona',    '1700000001', 'ezona1@parqueadero.ec',     '0991000005', 'Av. Zona 500',     'ecuatoriana', 'empleado',    NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 3. USUARIOS ─────────────────────────────────────────────
INSERT INTO usuarios (id, username, "passwordHash", active, created_at, updated_at) VALUES
  ('c9f1a2b3-4d5e-46f7-8a9b-0c1d2e3f4a5b', 'testadmin',
   'd7c1de1fc30976ec3af4e00a112af7db:facafca2ddb942745a27a1984d24f3829c529cab4e8cd207d09b78e658099f4f1af8598ae442ceafddd9c68a87853049d019f463af83dafaa3ddb1238da09497',
   true, NOW(), NOW()),
  ('d0a2b3c4-5e6f-47a8-9b0c-1d2e3f4a5b6c', 'superusr',
   'e7a89b300ee9870d0ce88471ed06045e:281ade89764530c06c17fc5be3aa547e5d8d4c3c912d300b568981543f226455985c894ba155cc4484bfad9a29eaf1e856456d64d19432c4f51a5ad4423f2039',
   true, NOW(), NOW()),
  ('e1b3c4d5-6f7a-48b9-0c1d-2e3f4a5b6c7d', 'jpropiet',
   '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf',
   true, NOW(), NOW()),
  ('f2c4d5e6-7a8b-49c0-1d2e-3f4a5b6c7d8e', 'mgomez',
   '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf',
   true, NOW(), NOW()),
  ('a3d5e6f7-8b9c-40d1-2e3f-4a5b6c7d8e9f', 'ezona1',
   'e4016ea5973ae2620338d9fde2baffe5:84c01520f55b80563bee9d254b42e8f299c9f66d0d4defadf5cc0c6678f0f721d2b18436867ce748db2a3ef8572a11d806ee130c6239011b4695ee4f58075844',
   true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  username     = EXCLUDED.username,
  "passwordHash" = EXCLUDED."passwordHash",
  active         = EXCLUDED.active,
  updated_at     = NOW();

-- ── 4. ASIGNACIÓN DE ROLES ──────────────────────────────────
INSERT INTO roles_usuario (id_rol, id_usuario, activo, assigned_at, updated_at) VALUES
  ('e5b7c8d9-0f1a-42b3-8c4d-5e6f7a8b9c0d', 'c9f1a2b3-4d5e-46f7-8a9b-0c1d2e3f4a5b', true, NOW(), NOW()),  -- testadmin  -> admin
  ('f6c8d9e0-1a2b-43c4-9d5e-6f7a8b9c0d1e', 'd0a2b3c4-5e6f-47a8-9b0c-1d2e3f4a5b6c', true, NOW(), NOW()),  -- superusr   -> super_user
  ('a7d9e0f1-2b3c-44d5-a6f7-8b9c0d1e2f3a', 'e1b3c4d5-6f7a-48b9-0c1d-2e3f4a5b6c7d', true, NOW(), NOW()),  -- jpropiet   -> propietario
  ('a7d9e0f1-2b3c-44d5-a6f7-8b9c0d1e2f3a', 'f2c4d5e6-7a8b-49c0-1d2e-3f4a5b6c7d8e', true, NOW(), NOW()),  -- mgomez     -> propietario
  ('b8e0f1a2-3c4d-45e6-b7a8-9c0d1e2f3a4b', 'a3d5e6f7-8b9c-40d1-2e3f-4a5b6c7d8e9f', true, NOW(), NOW())   -- ezona1     -> encargado_zona
ON CONFLICT DO NOTHING;

-- ── 5. VERIFICACIÓN ─────────────────────────────────────────
SELECT u.username, r.nombre as rol, p.first_name || ' ' || p.last_name as nombre
FROM usuarios u
JOIN roles_usuario ru ON u.id = ru.id_usuario
JOIN roles r ON ru.id_rol = r.id
JOIN personas p ON p.id = u.id
ORDER BY r.nombre, u.username;
