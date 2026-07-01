-- Limpiar datos viejos (solo en desarrollo)
DELETE FROM roles_usuario WHERE id_usuario IN (
  SELECT id FROM usuarios WHERE username IN ('testadmin','superusr','juan.perez','mfgomez','jpropiet','ezona1')
);
DELETE FROM refresh_tokens WHERE usuario_id IN (
  SELECT id FROM usuarios WHERE username IN ('testadmin','superusr','juan.perez','mfgomez','jpropiet','ezona1')
);
DELETE FROM usuarios WHERE username IN ('testadmin','superusr','juan.perez','mfgomez','jpropiet','ezona1');
DELETE FROM personas WHERE email LIKE '%@parqueadero%';
DELETE FROM roles WHERE nombre IN ('admin','super_user','propietario','encargado_zona');
