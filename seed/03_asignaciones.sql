-- ============================================================
-- SEED: TrazabilidadDB (trazabilidad)
-- Asignación de vehículos al propietario jpropiet
-- Referencia: user_id → usuarios.id (UsuariosDB)
--             vehicle_id → vehiculo.id (VehiculosDB)
-- ============================================================

INSERT INTO asignaciones (user_id, vehicle_id, estado, descripcion, fecha_asignacion, fecha_modificacion) VALUES
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000001', 1,
   'Vehículo principal - Jorge Propietario', NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002', 1,
   'Vehículo secundario - Jorge Propietario', NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', 1,
   'Motocicleta - Jorge Propietario', NOW(), NOW())
ON CONFLICT (user_id, vehicle_id) DO UPDATE SET
  estado             = EXCLUDED.estado,
  descripcion        = EXCLUDED.descripcion,
  fecha_modificacion = NOW();
