-- ============================================================
-- SEED: VehiculosDB (vehiculos)
-- ============================================================

INSERT INTO vehiculo (id, placa, marca, modelo, color, anio, clasificacion, tipo,
                      "numeroPuertas", "capacidadMaletero")
VALUES
  ('66666666-6666-4666-8666-666666666601', 'PBC-1234', 'Toyota', 'Corolla', 'Blanco', 2020, 'Gasolina', 'auto', 4, 470),
  ('66666666-6666-4666-8666-666666666602', 'PBC-5678', 'Honda',  'Civic',   'Negro',  2022, 'Hibrido',  'auto', 4, 420)
ON CONFLICT (placa) DO UPDATE SET
  id = EXCLUDED.id,
  marca = EXCLUDED.marca,
  modelo = EXCLUDED.modelo,
  color = EXCLUDED.color,
  anio = EXCLUDED.anio,
  clasificacion = EXCLUDED.clasificacion,
  tipo = EXCLUDED.tipo,
  "numeroPuertas" = EXCLUDED."numeroPuertas",
  "capacidadMaletero" = EXCLUDED."capacidadMaletero";

INSERT INTO vehiculo (id, placa, marca, modelo, color, anio, clasificacion, tipo,
                      "tipoMoto")
VALUES
  ('66666666-6666-4666-8666-666666666603', 'MA-1111', 'Yamaha', 'MT-07', 'Azul', 2023, 'Gasolina', 'motocicleta', 'Deportiva')
ON CONFLICT (placa) DO UPDATE SET
  id = EXCLUDED.id,
  marca = EXCLUDED.marca,
  modelo = EXCLUDED.modelo,
  color = EXCLUDED.color,
  anio = EXCLUDED.anio,
  clasificacion = EXCLUDED.clasificacion,
  tipo = EXCLUDED.tipo,
  "tipoMoto" = EXCLUDED."tipoMoto";
