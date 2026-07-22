-- ============================================================
-- SEED: Parqueadero - Microservicio Usuarios
-- ============================================================
-- CREDENCIALES (username / password / rol):
--   testadmin  / Admin123!  / admin
--   superusr   / Super123!  / super_user
--   jpropiet   / Prop123!   / propietario
--   mgomez     / Prop123!   / propietario
--   ezona1     / Zona123!   / encargado_zona
--   auditor1   / Audit123!  / auditor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. ROLES ────────────────────────────────────────────────
INSERT INTO roles (nombre, descripcion, activo, created_at, updated_at) VALUES
  ('admin',          'Administrador del sistema con acceso total excepto borrado físico', true, NOW(), NOW()),
  ('super_user',     'Super usuario con acceso absoluto incluyendo borrado físico',       true, NOW(), NOW()),
  ('propietario',    'Propietario de vehículo: gestiona sus vehículos y asignaciones',   true, NOW(), NOW()),
  ('encargado_zona', 'Encargado de zona: gestiona zonas y espacios del parqueadero',     true, NOW(), NOW()),
  ('auditor',        'Auditor del sistema: consulta logs de auditoría',                  true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ── 2. PERSONAS ─────────────────────────────────────────────
INSERT INTO personas (active, first_name, middle_name, last_name, dni, email, phone, address, nationality, tipo, created_at, updated_at)
SELECT true, v.fn, v.mn, v.ln, v.dni, v.email, v.phone, v.addr, 'ecuatoriana', v.tipo, NOW(), NOW()
FROM (VALUES
  ('Test',   NULL,    'Admin',   '1000000001', 'testadmin@parqueadero.ec', '0991000001', 'Av. Admin 100',  'empleado'),
  ('Super',  NULL,    'User',    '1000000002', 'superusr@parqueadero.ec',  '0991000002', 'Av. Super 200',  'empleado'),
  ('Juan',   'Carlos','Perez',   '1000000003', 'jpropiet@parqueadero.ec',  '0991000003', 'Calle Prop 300', 'propietario'),
  ('Maria',  NULL,    'Gomez',   '1000000004', 'mgomez@parqueadero.ec',    '0991000004', 'Calle Prop 400', 'propietario'),
  ('Ernesto',NULL,    'Zona',    '1000000005', 'ezona1@parqueadero.ec',    '0991000005', 'Av. Zona 500',   'empleado'),
  ('Auditor',NULL,    'Sistema', '1000000006', 'auditor1@parqueadero.ec',  '0991000006', 'Av. Auditor 600','empleado')
) AS v(fn, mn, ln, dni, email, phone, addr, tipo)
ON CONFLICT (dni) DO NOTHING;

-- ── 3. USUARIOS ─────────────────────────────────────────────
INSERT INTO usuarios (username, "passwordHash", active, created_at, updated_at)
SELECT v.username, v.hash, true, NOW(), NOW()
FROM personas p
JOIN (VALUES
  ('1000000001', 'testadmin', 'd7c1de1fc30976ec3af4e00a112af7db:facafca2ddb942745a27a1984d24f3829c529cab4e8cd207d09b78e658099f4f1af8598ae442ceafddd9c68a87853049d019f463af83dafaa3ddb1238da09497'),
  ('1000000002', 'superusr',  'e7a89b300ee9870d0ce88471ed06045e:281ade89764530c06c17fc5be3aa547e5d8d4c3c912d300b568981543f226455985c894ba155cc4484bfad9a29eaf1e856456d64d19432c4f51a5ad4423f2039'),
  ('1000000003', 'jpropiet',  '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf'),
  ('1000000004', 'mgomez',    '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf'),
  ('1000000005', 'ezona1',    'e4016ea5973ae2620338d9fde2baffe5:84c01520f55b80563bee9d254b42e8f299c9f66d0d4defadf5cc0c6678f0f721d2b18436867ce748db2a3ef8572a11d806ee130c6239011b4695ee4f58075844'),
  ('1000000006', 'auditor1',  'c1b86815d885d611f92a2ba39931047d:543e71bac3711fdfedeb2f86f98229b26793749fe5a1523a8098ad7c6bf3711570461da2432263b08303fd7fa2ac480c82b7d9716cac000373ea7cb96f93b95e')
) AS v(dni, username, hash) ON p.dni = v.dni
ON CONFLICT (username) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  active         = EXCLUDED.active,
  updated_at     = NOW();

-- ── 4. ASIGNACIÓN DE ROLES ──────────────────────────────────
INSERT INTO roles_usuario (id_rol, id_usuario, activo, assigned_at, updated_at)
SELECT r.id, u.id, true, NOW(), NOW()
FROM usuarios u
JOIN personas p ON p.dni = (
  SELECT dni FROM personas WHERE id = u.id
)
JOIN roles r ON r.nombre = (
  CASE p.dni
    WHEN '1000000001' THEN 'admin'
    WHEN '1000000002' THEN 'super_user'
    WHEN '1000000003' THEN 'propietario'
    WHEN '1000000004' THEN 'propietario'
    WHEN '1000000005' THEN 'encargado_zona'
    WHEN '1000000006' THEN 'auditor'
  END
)
ON CONFLICT DO NOTHING;

-- ── 5. VERIFICACIÓN ─────────────────────────────────────────
SELECT u.username, r.nombre as rol, p.first_name || ' ' || p.last_name as nombre
FROM usuarios u
JOIN roles_usuario ru ON u.id = ru.id_usuario
JOIN roles r ON ru.id_rol = r.id
JOIN personas p ON p.id = u.id
ORDER BY r.nombre, u.username;
