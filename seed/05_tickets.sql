-- ============================================================
-- SEED: TicketsDB (tickets)
-- Tickets: 2 activos y 3 pagados
-- id_espacio almacena el CÓDIGO del espacio (varchar)
-- id_empleado almacena el UUID del usuario (varchar)
-- ============================================================

-- ── TICKETS ACTIVOS ─────────────────────────────────────────
-- Toyota Corolla (PBC-1234) en VIP V-01
INSERT INTO tickets (codigo_ticket, id_espacio, cedula, placa, estado,
                     fecha_ingreso, id_empleado)
VALUES ('TCK-000001',
        'V-01',
        '1000000003', 'PBC-1234', 'ACTIVO',
        NOW() - INTERVAL '2 hours',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023');

-- Honda Civic (PBC-5678) en Regular R-01
INSERT INTO tickets (codigo_ticket, id_espacio, cedula, placa, estado,
                     fecha_ingreso, id_empleado)
VALUES ('TCK-000002',
        'R-01',
        '1000000003', 'PBC-5678', 'ACTIVO',
        NOW() - INTERVAL '1 hour',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023');

-- ── TICKETS PAGADOS ─────────────────────────────────────────
-- Yamaha MT-07 (MA-1111) en Regular M-01 — ya pagado
INSERT INTO tickets (codigo_ticket, id_espacio, cedula, placa, estado,
                     fecha_ingreso, fecha_salida,
                     id_empleado, id_empleado_pago, valor_recaudado)
VALUES ('TCK-000003',
        'M-01',
        '1000000003', 'MA-1111', 'PAGADO',
        NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023', 3.50);

-- Auto desconocido en VIP V-02 — pagado
INSERT INTO tickets (codigo_ticket, id_espacio, placa, estado,
                     fecha_ingreso, fecha_salida,
                     id_empleado, id_empleado_pago, valor_recaudado)
VALUES ('TCK-000004',
        'V-02',
        'XYZ-9876', 'PAGADO',
        NOW() - INTERVAL '8 hours', NOW() - INTERVAL '6 hours',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023', 5.00);

-- Moto desconocida en Regular M-02 — pagado
INSERT INTO tickets (codigo_ticket, id_espacio, placa, estado,
                     fecha_ingreso, fecha_salida,
                     id_empleado, id_empleado_pago, valor_recaudado)
VALUES ('TCK-000005',
        'M-02',
        'MB-4321', 'PAGADO',
        NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023',
        '85bff0b8-0ab9-4d0e-b9fe-56340fa76023', 2.00);
