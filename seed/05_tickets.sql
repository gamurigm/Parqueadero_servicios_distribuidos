-- ============================================================
-- SEED: TicketsDB (tickets)
-- Tickets: 2 activos y 3 pagados
-- Los partial unique indexes permiten solo 1 activo
-- por espacio y por placa a la vez
-- ============================================================

-- ── TICKETS ACTIVOS ─────────────────────────────────────────
-- Toyota Corolla (PBC-1234) en VIP V-01
INSERT INTO tickets (id, codigo_ticket, id_espacio, cedula, placa, estado,
                     fecha_ingreso, id_empleado)
VALUES (gen_random_uuid(), 'TCK-000001',
        '55555555-0000-0000-0000-000000000001',
        '1000000003', 'PBC-1234', 'ACTIVO',
        NOW() - INTERVAL '2 hours',
        '22222222-0000-0000-0000-000000000004');

-- Honda Civic (PBC-5678) en Regular R-01
INSERT INTO tickets (id, codigo_ticket, id_espacio, cedula, placa, estado,
                     fecha_ingreso, id_empleado)
VALUES (gen_random_uuid(), 'TCK-000002',
        '55555555-0000-0000-0000-000000000006',
        '1000000003', 'PBC-5678', 'ACTIVO',
        NOW() - INTERVAL '1 hour',
        '22222222-0000-0000-0000-000000000004');

-- ── TICKETS PAGADOS ─────────────────────────────────────────
-- Yamaha MT-07 (MA-1111) en Regular M-01 — ya pagado
INSERT INTO tickets (id, codigo_ticket, id_espacio, cedula, placa, estado,
                     fecha_ingreso, fecha_salida,
                     id_empleado, id_empleado_pago, valor_recaudado)
VALUES (gen_random_uuid(), 'TCK-000003',
        '55555555-0000-0000-0000-000000000014',
        '1000000003', 'MA-1111', 'PAGADO',
        NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours',
        '22222222-0000-0000-0000-000000000004',
        '22222222-0000-0000-0000-000000000004', 3.50);

-- Auto desconocido en VIP V-02 — pagado
INSERT INTO tickets (id, codigo_ticket, id_espacio, placa, estado,
                     fecha_ingreso, fecha_salida,
                     id_empleado, id_empleado_pago, valor_recaudado)
VALUES (gen_random_uuid(), 'TCK-000004',
        '55555555-0000-0000-0000-000000000002',
        'XYZ-9876', 'PAGADO',
        NOW() - INTERVAL '8 hours', NOW() - INTERVAL '6 hours',
        '22222222-0000-0000-0000-000000000004',
        '22222222-0000-0000-0000-000000000004', 5.00);

-- Moto desconocida en Regular M-02 — pagado
INSERT INTO tickets (id, codigo_ticket, id_espacio, placa, estado,
                     fecha_ingreso, fecha_salida,
                     id_empleado, id_empleado_pago, valor_recaudado)
VALUES (gen_random_uuid(), 'TCK-000005',
        '55555555-0000-0000-0000-000000000015',
        'MB-4321', 'PAGADO',
        NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour',
        '22222222-0000-0000-0000-000000000004',
        '22222222-0000-0000-0000-000000000004', 2.00);
