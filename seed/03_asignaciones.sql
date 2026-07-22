-- ============================================================
-- SEED: TrazabilidadDB (trazabilidad)
-- Asignación de vehículos al propietario jpropiet
-- UUIDs obtenidos de UsuariosDB y VehiculosDB
-- ============================================================

INSERT INTO asignaciones (user_id, vehicle_id, estado, descripcion, fecha_asignacion, fecha_modificacion) VALUES
  ('b3558ca4-36ea-4ba7-964a-661144ebd027', 'c1836ff8-6a17-4582-90e2-77357f497d55',
   1, 'Vehículo principal - Jorge Propietario', NOW(), NOW()),
  ('b3558ca4-36ea-4ba7-964a-661144ebd027', 'a3bbce86-06b8-453a-8021-7fae13ccfae6',
   1, 'Vehículo secundario - Jorge Propietario', NOW(), NOW()),
  ('b3558ca4-36ea-4ba7-964a-661144ebd027', '067e4525-543b-4bdc-93cd-164fe2a90ef3',
   1, 'Motocicleta - Jorge Propietario', NOW(), NOW())
ON CONFLICT (user_id, vehicle_id) DO UPDATE SET
  estado             = EXCLUDED.estado,
  descripcion        = EXCLUDED.descripcion,
  fecha_modificacion = NOW();
