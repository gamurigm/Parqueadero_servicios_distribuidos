-- ============================================================
-- SEED: UsuariosDB (gestion_usuarios)
-- Roles, Personas, Usuarios y asignación de roles
-- ============================================================
-- CREDENCIALES (username / password / rol):
--   admin1    / Admin123!   / admin
--   super1    / Super123!   / super_user
--   jpropiet  / Prop123!    / propietario
--   emple1    / Emple123!   / empleado
--   auditor1  / Audit123!   / auditor
-- ============================================================

-- ── 1. ROLES ────────────────────────────────────────────────
INSERT INTO roles (nombre, descripcion, activo, created_at, updated_at) VALUES
  ('admin',        'Administrador del sistema con acceso total excepto borrado físico', true, NOW(), NOW()),
  ('super_user',   'Super usuario con acceso absoluto incluyendo borrado físico',       true, NOW(), NOW()),
  ('propietario',  'Propietario de vehículo: gestiona sus vehículos y asignaciones',    true, NOW(), NOW()),
  ('empleado',     'Empleado del parqueadero: gestiona zonas, espacios y tickets',      true, NOW(), NOW()),
  ('auditor',      'Auditor del sistema: consulta logs de auditoría',                   true, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ── 2. PERSONAS + USUARIOS ──────────────────────────────────
-- usuarios.id = personas.id (1:1, PrimaryColumn coincide con PrimaryGeneratedColumn)
WITH inserted_personas AS (
  INSERT INTO personas (active, first_name, last_name, dni, email, phone, address, nationality, tipo, created_at, updated_at)
  VALUES
    (true, 'Admin',   'Principal',   '1000000001', 'admin@parqueadero.ec',    '0999000001', 'Av. Principal 100', 'ecuatoriana', 'natural', NOW(), NOW()),
    (true, 'Super',   'Usuario',     '1000000002', 'super@parqueadero.ec',    '0999000002', 'Av. Principal 200', 'ecuatoriana', 'natural', NOW(), NOW()),
    (true, 'Jorge',   'Propietario', '1000000003', 'jpropiet@parqueadero.ec', '0999000003', 'Av. Principal 300', 'ecuatoriana', 'natural', NOW(), NOW()),
    (true, 'Luis',    'Empleado',    '1000000004', 'lempleado@parqueadero.ec','0999000004', 'Av. Principal 400', 'ecuatoriana', 'natural', NOW(), NOW()),
    (true, 'Auditor', 'Sistema',     '1000000005', 'auditor@parqueadero.ec',  '0999000005', 'Av. Principal 500', 'ecuatoriana', 'natural', NOW(), NOW())
  ON CONFLICT (dni) DO NOTHING
  RETURNING id, dni
)
INSERT INTO usuarios (id, username, "passwordHash", active, created_at, updated_at)
SELECT
  ip.id,
  CASE ip.dni
    WHEN '1000000001' THEN 'admin1'
    WHEN '1000000002' THEN 'super1'
    WHEN '1000000003' THEN 'jpropiet'
    WHEN '1000000004' THEN 'emple1'
    WHEN '1000000005' THEN 'auditor1'
  END,
  CASE ip.dni
    WHEN '1000000001' THEN 'd7c1de1fc30976ec3af4e00a112af7db:facafca2ddb942745a27a1984d24f3829c529cab4e8cd207d09b78e658099f4f1af8598ae442ceafddd9c68a87853049d019f463af83dafaa3ddb1238da09497'
    WHEN '1000000002' THEN 'e7a89b300ee9870d0ce88471ed06045e:281ade89764530c06c17fc5be3aa547e5d8d4c3c912d300b568981543f226455985c894ba155cc4484bfad9a29eaf1e856456d64d19432c4f51a5ad4423f2039'
    WHEN '1000000003' THEN '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf'
    WHEN '1000000004' THEN 'e4016ea5973ae2620338d9fde2baffe5:84c01520f55b80563bee9d254b42e8f299c9f66d0d4defadf5cc0c6678f0f721d2b18436867ce748db2a3ef8572a11d806ee130c6239011b4695ee4f58075844'
    WHEN '1000000005' THEN 'c1b86815d885d611f92a2ba39931047d:543e71bac3711fdfedeb2f86f98229b26793749fe5a1523a8098ad7c6bf3711570461da2432263b08303fd7fa2ac480c82b7d9716cac000373ea7cb96f93b95e'
  END,
  true, NOW(), NOW()
FROM inserted_personas ip
ON CONFLICT (id) DO NOTHING;

-- ── 3. ASIGNACIÓN DE ROLES ──────────────────────────────────
INSERT INTO roles_usuario (id_rol, id_usuario, activo, assigned_at, updated_at)
SELECT r.id, u.id, true, NOW(), NOW()
FROM usuarios u
JOIN personas p ON p.id = u.id
JOIN roles r ON r.nombre = (
  CASE p.dni
    WHEN '1000000001' THEN 'admin'
    WHEN '1000000002' THEN 'super_user'
    WHEN '1000000003' THEN 'propietario'
    WHEN '1000000004' THEN 'empleado'
    WHEN '1000000005' THEN 'auditor'
  END
)
ON CONFLICT DO NOTHING;
