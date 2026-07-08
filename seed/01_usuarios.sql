-- ============================================================
-- SEED: UsuariosDB (gestion_usuarios)
-- Roles, Personas, Usuarios y asignación de roles
-- UUIDs fijos para referencia desde otros servicios
-- Contraseñas: admin1/Admin123!, super1/Super123!,
--              jpropiet/Prop123!, emple1/Emple123!
-- ============================================================

-- ── 1. ROLES ────────────────────────────────────────────────
INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at) VALUES
  ('11111111-0000-0000-0000-000000000001', 'admin',        'Administrador del sistema con acceso total excepto borrado físico', true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000002', 'super_user',   'Super usuario con acceso absoluto incluyendo borrado físico',       true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000003', 'propietario',  'Propietario de vehículo: gestiona sus vehículos y asignaciones',    true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000004', 'empleado',     'Empleado del parqueadero: gestiona zonas, espacios y tickets',      true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ── 2. PERSONAS ─────────────────────────────────────────────
INSERT INTO personas (id, active, first_name, last_name, dni, email, phone, address, nationality, tipo, created_at, updated_at) VALUES
  ('22222222-0000-0000-0000-000000000001', true, 'Admin',   'Principal',   '1000000001', 'admin@parqueadero.ec',    '0999000001', 'Av. Principal 100', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000002', true, 'Super',   'Usuario',     '1000000002', 'super@parqueadero.ec',    '0999000002', 'Av. Principal 200', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000003', true, 'Jorge',   'Propietario', '1000000003', 'jpropiet@parqueadero.ec', '0999000003', 'Av. Principal 300', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000004', true, 'Luis',    'Empleado',    '1000000004', 'lempleado@parqueadero.ec','0999000004', 'Av. Principal 400', 'ecuatoriana', 'natural', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 3. USUARIOS ─────────────────────────────────────────────
INSERT INTO usuarios (id, username, "passwordHash", active, created_at, updated_at) VALUES
  ('22222222-0000-0000-0000-000000000001', 'admin1',
   'd7c1de1fc30976ec3af4e00a112af7db:facafca2ddb942745a27a1984d24f3829c529cab4e8cd207d09b78e658099f4f1af8598ae442ceafddd9c68a87853049d019f463af83dafaa3ddb1238da09497',
   true, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000002', 'super1',
   'e7a89b300ee9870d0ce88471ed06045e:281ade89764530c06c17fc5be3aa547e5d8d4c3c912d300b568981543f226455985c894ba155cc4484bfad9a29eaf1e856456d64d19432c4f51a5ad4423f2039',
   true, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000003', 'jpropiet',
   '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf',
   true, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000004', 'emple1',
   'e4016ea5973ae2620338d9fde2baffe5:84c01520f55b80563bee9d254b42e8f299c9f66d0d4defadf5cc0c6678f0f721d2b18436867ce748db2a3ef8572a11d806ee130c6239011b4695ee4f58075844',
   true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  username       = EXCLUDED.username,
  "passwordHash" = EXCLUDED."passwordHash",
  active         = EXCLUDED.active,
  updated_at     = NOW();

-- ── 4. ASIGNACIÓN DE ROLES ──────────────────────────────────
INSERT INTO roles_usuario (id_rol, id_usuario, activo, assigned_at, updated_at) VALUES
  ('11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', true, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
