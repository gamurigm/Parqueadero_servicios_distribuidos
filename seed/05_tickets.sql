-- ============================================================
-- SEED: TicketsDB (tickets)
-- ============================================================

INSERT INTO tickets (id, codigo_ticket, id_espacio, cedula, placa, estado,
                     fecha_ingreso, fecha_salida, id_empleado,
                     id_empleado_pago, valor_recaudado, created_at, updated_at)
VALUES
  ('99999999-9999-4999-8999-999999999001', 'TCK-000001',
   '88888888-8888-4888-8888-888888888101',
   '1000000003', 'PBC-1234', 'ACTIVO',
   NOW() - INTERVAL '2 hours', NULL,
   '44444444-4444-4444-8444-444444444444',
   NULL, NULL, NOW(), NOW()),
  ('99999999-9999-4999-8999-999999999002', 'TCK-000002',
   '88888888-8888-4888-8888-888888888201',
   '1000000003', 'PBC-5678', 'ACTIVO',
   NOW() - INTERVAL '1 hour', NULL,
   '44444444-4444-4444-8444-444444444444',
   NULL, NULL, NOW(), NOW()),
  ('99999999-9999-4999-8999-999999999003', 'TCK-000003',
   '88888888-8888-4888-8888-888888888209',
   '1000000003', 'MA-1111', 'PAGADO',
   NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours',
   '44444444-4444-4444-8444-444444444444',
   '44444444-4444-4444-8444-444444444444', 3.50, NOW(), NOW()),
  ('99999999-9999-4999-8999-999999999004', 'TCK-000004',
   '88888888-8888-4888-8888-888888888102',
   NULL, 'XYZ-9876', 'PAGADO',
   NOW() - INTERVAL '8 hours', NOW() - INTERVAL '6 hours',
   '44444444-4444-4444-8444-444444444444',
   '44444444-4444-4444-8444-444444444444', 5.00, NOW(), NOW()),
  ('99999999-9999-4999-8999-999999999005', 'TCK-000005',
   '88888888-8888-4888-8888-888888888210',
   NULL, 'MB-4321', 'PAGADO',
   NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour',
   '44444444-4444-4444-8444-444444444444',
   '44444444-4444-4444-8444-444444444444', 2.00, NOW(), NOW())
ON CONFLICT (codigo_ticket) DO UPDATE SET
  id_espacio = EXCLUDED.id_espacio,
  cedula = EXCLUDED.cedula,
  placa = EXCLUDED.placa,
  estado = EXCLUDED.estado,
  fecha_ingreso = EXCLUDED.fecha_ingreso,
  fecha_salida = EXCLUDED.fecha_salida,
  id_empleado = EXCLUDED.id_empleado,
  id_empleado_pago = EXCLUDED.id_empleado_pago,
  valor_recaudado = EXCLUDED.valor_recaudado,
  updated_at = NOW();
