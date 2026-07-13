-- ============================================================
-- SEED: VehiculosDB (vehiculos)
-- 3 vehículos para el propietario jpropiet
-- UUIDs fijos para referencia desde asignaciones
-- ============================================================

-- Table inheritance: todos insertan en vehiculo, con tipo como
-- discriminator (auto, motocicleta, camioneta) y sus columnas
-- específicas van en la misma fila.

-- ── AUTO: Toyota Corolla 2020 ───────────────────────────────
INSERT INTO vehiculo (id, placa, marca, modelo, color, anio, clasificacion, tipo,
                      "numeroPuertas", "capacidadMaletero")
VALUES ('33333333-0000-0000-0000-000000000001',
        'PBC-1234', 'Toyota', 'Corolla', 'Blanco', 2020, 'Gasolina', 'auto',
        4, 470);

-- ── AUTO: Honda Civic 2022 (Híbrido) ────────────────────────
INSERT INTO vehiculo (id, placa, marca, modelo, color, anio, clasificacion, tipo,
                      "numeroPuertas", "capacidadMaletero")
VALUES ('33333333-0000-0000-0000-000000000002',
        'PBC-5678', 'Honda', 'Civic', 'Negro', 2022, 'Hibrido', 'auto',
        4, 420);

-- ── MOTO: Yamaha MT-07 2023 ─────────────────────────────────
INSERT INTO vehiculo (id, placa, marca, modelo, color, anio, clasificacion, tipo,
                      "tipoMoto")
VALUES ('33333333-0000-0000-0000-000000000003',
        'MA-1111', 'Yamaha', 'MT-07', 'Azul', 2023, 'Gasolina', 'motocicleta',
        'Deportiva');
