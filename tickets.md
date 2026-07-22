como implemntear el servicio de tickers con

segregacionde interfaces

micro: emission de ticket (Tambien sale por al api gateway)
los tickets tienes un codico unico (al igual que la cedula (ejemplo), que se genere automaticamente: ()ej zona-espacio-fecha_timestamp de 16 digitos ) (en dto: )
se va a verificar usando la cedula del cliente o la placa del vehicyulo como ya esta asignado se hace un cruce y se toma la clave compuesta.
si ingresa por cedula, iingreso la placa del vehiculo
pero si ingreso por placa ya me trae la cedula.

ticket:
id_ticket
id_espacio
id_usuario - id_vehiculo
fecha_hora_ingreso
fecha hora salida
estado del ticket (ACTIVO, PAGADO, ANULADO)
id_empleado(sesion)
valor recaudado ((*tipo vehiculo - tipo espacio), -fecha ini + fecha fin* tarifa) y dependiento del tipo de espacio (definir tarifas)

puede ser una tabla de tarifas en  un .env (para optimizar tiempo, considerar la tarifa para el espacio reservado)

notas:
se hara el pago como hora o fraccion (pago total)

operaciones por detras:
emito el ticket, que pasa con el espacio? el estado del espacio cambia a Ocupado y ya no se podra ocupar el mismo
cuando pago el ticket el espacio ya se libera.
no borradado del ticket
si error humano  (validar y no permitir)

como se validara:
se registra un empleado
se emite el ticket
validacioes:
quiero emitir el mismo ticket en el mismo espacio y con el mismo vehiculo (y combinaciones de todas estas), No deberia valer
nota:  tampoco deben existir placas duplicadas...
todas las posibles validaciones:
sanitizar las entradas de lso ids (no espacios en blanco, ids validos)
las fechas validad que sean validas
validadar tambien el el dto.

si usuario tiene mas de un auto debe enviarse la placa ya no la cedula
