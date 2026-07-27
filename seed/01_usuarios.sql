-- ============================================================
-- SEED: UsuariosDB (gestion_usuarios)
-- Credenciales compatibles:
--   admin1    / Admin123!  / admin
--   testadmin / Admin123!  / admin
--   super1    / Super123!  / super_user
--   superusr  / Super123!  / super_user
--   jpropiet  / Prop123!   / propietario
--   mgomez    / Prop123!   / propietario
--   emple1    / Zona123!   / empleado
--   ezona1    / Zona123!   / encargado_zona
--   auditor1  / Audit123!  / auditor
-- ============================================================

DELETE FROM roles_usuario
WHERE id_usuario IN (
  SELECT id FROM usuarios
  WHERE username IN ('admin1', 'testadmin', 'super1', 'superusr', 'jpropiet', 'mgomez', 'emple1', 'ezona1', 'auditor1')
  UNION
  SELECT id FROM personas
  WHERE dni IN ('1000000001', '1000000002', '1000000003', '1000000004', '1000000005', '1726549830', '1715678901', '1723456784', '1712345678', '1700000001')
     OR email IN ('admin@parqueadero.ec', 'testadmin@parqueadero.ec', 'super@parqueadero.ec', 'superusr@parqueadero.ec', 'jpropiet@parqueadero.ec', 'mgomez@parqueadero.ec', 'lempleado@parqueadero.ec', 'ezona1@parqueadero.ec', 'auditor@parqueadero.ec')
);

DELETE FROM refresh_tokens
WHERE usuario_id IN (
  SELECT id FROM usuarios
  WHERE username IN ('admin1', 'testadmin', 'super1', 'superusr', 'jpropiet', 'mgomez', 'emple1', 'ezona1', 'auditor1')
  UNION
  SELECT id FROM personas
  WHERE dni IN ('1000000001', '1000000002', '1000000003', '1000000004', '1000000005', '1726549830', '1715678901', '1723456784', '1712345678', '1700000001')
     OR email IN ('admin@parqueadero.ec', 'testadmin@parqueadero.ec', 'super@parqueadero.ec', 'superusr@parqueadero.ec', 'jpropiet@parqueadero.ec', 'mgomez@parqueadero.ec', 'lempleado@parqueadero.ec', 'ezona1@parqueadero.ec', 'auditor@parqueadero.ec')
);

DELETE FROM active_tokens
WHERE user_id IN (
  SELECT id::text FROM usuarios
  WHERE username IN ('admin1', 'testadmin', 'super1', 'superusr', 'jpropiet', 'mgomez', 'emple1', 'ezona1', 'auditor1')
  UNION
  SELECT id::text FROM personas
  WHERE dni IN ('1000000001', '1000000002', '1000000003', '1000000004', '1000000005', '1726549830', '1715678901', '1723456784', '1712345678', '1700000001')
     OR email IN ('admin@parqueadero.ec', 'testadmin@parqueadero.ec', 'super@parqueadero.ec', 'superusr@parqueadero.ec', 'jpropiet@parqueadero.ec', 'mgomez@parqueadero.ec', 'lempleado@parqueadero.ec', 'ezona1@parqueadero.ec', 'auditor@parqueadero.ec')
);

DELETE FROM usuarios
WHERE username IN ('admin1', 'testadmin', 'super1', 'superusr', 'jpropiet', 'mgomez', 'emple1', 'ezona1', 'auditor1')
   OR id IN (
     SELECT id FROM personas
     WHERE dni IN ('1000000001', '1000000002', '1000000003', '1000000004', '1000000005', '1726549830', '1715678901', '1723456784', '1712345678', '1700000001')
        OR email IN ('admin@parqueadero.ec', 'testadmin@parqueadero.ec', 'super@parqueadero.ec', 'superusr@parqueadero.ec', 'jpropiet@parqueadero.ec', 'mgomez@parqueadero.ec', 'lempleado@parqueadero.ec', 'ezona1@parqueadero.ec', 'auditor@parqueadero.ec')
   );

DELETE FROM personas
WHERE dni IN ('1000000001', '1000000002', '1000000003', '1000000004', '1000000005', '1726549830', '1715678901', '1723456784', '1712345678', '1700000001')
   OR email IN ('admin@parqueadero.ec', 'testadmin@parqueadero.ec', 'super@parqueadero.ec', 'superusr@parqueadero.ec', 'jpropiet@parqueadero.ec', 'mgomez@parqueadero.ec', 'lempleado@parqueadero.ec', 'ezona1@parqueadero.ec', 'auditor@parqueadero.ec');

INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'admin',          'Administrador del sistema con acceso total excepto borrado fisico', true, NOW(), NOW()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'super_user',     'Super usuario con acceso absoluto incluyendo borrado fisico', true, NOW(), NOW()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'propietario',    'Propietario de vehiculo', true, NOW(), NOW()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'empleado',       'Empleado del parqueadero', true, NOW(), NOW()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'auditor',        'Auditor del sistema', true, NOW(), NOW()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'encargado_zona', 'Encargado de zona', true, NOW(), NOW())
ON CONFLICT (nombre) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  activo = EXCLUDED.activo,
  updated_at = NOW();

INSERT INTO personas (id, active, first_name, middle_name, last_name, dni, email, phone, address, nationality, tipo, created_at, updated_at) VALUES
  ('11111111-1111-4111-8111-111111111111', true, 'Admin',   NULL, 'Principal',   '1000000001', 'admin@parqueadero.ec',      '0999000001', 'Av. Principal 100', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('c9f1a2b3-4d5e-46f7-8a9b-0c1d2e3f4a5b', true, 'Test',    NULL, 'Admin',       '1726549830', 'testadmin@parqueadero.ec',  '0991000001', 'Av. Admin 100', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('22222222-2222-4222-8222-222222222222', true, 'Super',   NULL, 'Usuario',     '1000000002', 'super@parqueadero.ec',      '0999000002', 'Av. Principal 200', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('d0a2b3c4-5e6f-47a8-9b0c-1d2e3f4a5b6c', true, 'Super',   NULL, 'User',        '1715678901', 'superusr@parqueadero.ec',   '0991000002', 'Av. Super 200', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('33333333-3333-4333-8333-333333333333', true, 'Jorge',   NULL, 'Propietario', '1000000003', 'jpropiet@parqueadero.ec',   '0999000003', 'Av. Principal 300', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('f2c4d5e6-7a8b-49c0-9d2e-3f4a5b6c7d8e', true, 'Maria',   NULL, 'Gomez',       '1712345678', 'mgomez@parqueadero.ec',     '0991000004', 'Calle Prop 400', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('44444444-4444-4444-8444-444444444444', true, 'Luis',    NULL, 'Empleado',    '1000000004', 'lempleado@parqueadero.ec',  '0999000004', 'Av. Principal 400', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('a3d5e6f7-8b9c-40d1-ae3f-4a5b6c7d8e9f', true, 'Ernesto', NULL, 'Zona',        '1700000001', 'ezona1@parqueadero.ec',     '0991000005', 'Av. Zona 500', 'ecuatoriana', 'natural', NOW(), NOW()),
  ('55555555-5555-4555-8555-555555555555', true, 'Auditor', NULL, 'Sistema',     '1000000005', 'auditor@parqueadero.ec',    '0999000005', 'Av. Principal 500', 'ecuatoriana', 'natural', NOW(), NOW());

INSERT INTO usuarios (id, username, "passwordHash", active, created_at, updated_at) VALUES
  ('11111111-1111-4111-8111-111111111111', 'admin1',    'd7c1de1fc30976ec3af4e00a112af7db:facafca2ddb942745a27a1984d24f3829c529cab4e8cd207d09b78e658099f4f1af8598ae442ceafddd9c68a87853049d019f463af83dafaa3ddb1238da09497', true, NOW(), NOW()),
  ('c9f1a2b3-4d5e-46f7-8a9b-0c1d2e3f4a5b', 'testadmin', 'd7c1de1fc30976ec3af4e00a112af7db:facafca2ddb942745a27a1984d24f3829c529cab4e8cd207d09b78e658099f4f1af8598ae442ceafddd9c68a87853049d019f463af83dafaa3ddb1238da09497', true, NOW(), NOW()),
  ('22222222-2222-4222-8222-222222222222', 'super1',    'e7a89b300ee9870d0ce88471ed06045e:281ade89764530c06c17fc5be3aa547e5d8d4c3c912d300b568981543f226455985c894ba155cc4484bfad9a29eaf1e856456d64d19432c4f51a5ad4423f2039', true, NOW(), NOW()),
  ('d0a2b3c4-5e6f-47a8-9b0c-1d2e3f4a5b6c', 'superusr',  'e7a89b300ee9870d0ce88471ed06045e:281ade89764530c06c17fc5be3aa547e5d8d4c3c912d300b568981543f226455985c894ba155cc4484bfad9a29eaf1e856456d64d19432c4f51a5ad4423f2039', true, NOW(), NOW()),
  ('33333333-3333-4333-8333-333333333333', 'jpropiet',  '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf', true, NOW(), NOW()),
  ('f2c4d5e6-7a8b-49c0-9d2e-3f4a5b6c7d8e', 'mgomez',    '2978899a20250920e778ffa1683a7cf1:35a4b470661470e94212ca2d916033a8c62ea054932e4f259af2631421f28e8e0e38a90a8bd93a433f1730e8dbb0c9ed390522c9e18ca9ee6c61518387df2bbf', true, NOW(), NOW()),
  ('44444444-4444-4444-8444-444444444444', 'emple1',    'e4016ea5973ae2620338d9fde2baffe5:84c01520f55b80563bee9d254b42e8f299c9f66d0d4defadf5cc0c6678f0f721d2b18436867ce748db2a3ef8572a11d806ee130c6239011b4695ee4f58075844', true, NOW(), NOW()),
  ('a3d5e6f7-8b9c-40d1-ae3f-4a5b6c7d8e9f', 'ezona1',    'e4016ea5973ae2620338d9fde2baffe5:84c01520f55b80563bee9d254b42e8f299c9f66d0d4defadf5cc0c6678f0f721d2b18436867ce748db2a3ef8572a11d806ee130c6239011b4695ee4f58075844', true, NOW(), NOW()),
  ('55555555-5555-4555-8555-555555555555', 'auditor1',  'c1b86815d885d611f92a2ba39931047d:543e71bac3711fdfedeb2f86f98229b26793749fe5a1523a8098ad7c6bf3711570461da2432263b08303fd7fa2ac480c82b7d9716cac000373ea7cb96f93b95e', true, NOW(), NOW());

INSERT INTO roles_usuario (id_rol, id_usuario, activo, assigned_at, updated_at)
SELECT r.id, u.id, true, NOW(), NOW()
FROM (
  VALUES
    ('admin1', 'admin'),
    ('testadmin', 'admin'),
    ('super1', 'super_user'),
    ('superusr', 'super_user'),
    ('jpropiet', 'propietario'),
    ('mgomez', 'propietario'),
    ('emple1', 'empleado'),
    ('ezona1', 'encargado_zona'),
    ('auditor1', 'auditor')
) AS seed(username, role_name)
JOIN usuarios u ON u.username = seed.username
JOIN roles r ON r.nombre = seed.role_name
ON CONFLICT (id_rol, id_usuario) DO UPDATE SET
  activo = EXCLUDED.activo,
  updated_at = NOW();
