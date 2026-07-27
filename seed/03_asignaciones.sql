-- ============================================================
-- SEED: TrazabilidadDB (trazabilidad)
-- Asignaciones de vehiculos al propietario jpropiet
-- ============================================================

INSERT INTO asignaciones (user_id, vehicle_id, estado, descripcion, fecha_asignacion, fecha_modificacion) VALUES
  ('33333333-3333-4333-8333-333333333333', '66666666-6666-4666-8666-666666666601', 1, 'Vehiculo principal - Jorge Propietario', NOW(), NOW()),
  ('33333333-3333-4333-8333-333333333333', '66666666-6666-4666-8666-666666666602', 1, 'Vehiculo secundario - Jorge Propietario', NOW(), NOW()),
  ('33333333-3333-4333-8333-333333333333', '66666666-6666-4666-8666-666666666603', 1, 'Motocicleta - Jorge Propietario', NOW(), NOW())
ON CONFLICT (user_id, vehicle_id) DO UPDATE SET
  estado = EXCLUDED.estado,
  descripcion = EXCLUDED.descripcion,
  fecha_modificacion = NOW();
