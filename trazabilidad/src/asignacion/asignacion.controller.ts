import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    UseGuards,
    Headers,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AsignacionService } from './asignacion.service';
import { TrazabilidadService } from '../trazabilidad/trazabilidad.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Resource } from '../opa/decorators/resource.decorator';

@ApiTags('Asignaciones')
@Controller('asignaciones')
@UseGuards(JwtAuthGuard)
export class AsignacionController {
    constructor(
        private readonly asignacionService: AsignacionService,
        private readonly trazabilidadService: TrazabilidadService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('JWT-auth')
    @Resource('asignaciones.create')
    @ApiOperation({
        summary: 'RF1 - Crear asignacion vehiculo-propietario',
        description: 'Asocia un vehiculo a un propietario usando clave compuesta (userId + vehicleId). ' +
            'Un vehiculo solo puede tener una asignacion activa a la vez. ' +
            'Genera automaticamente un evento de trazabilidad CREACION.',
    })
    @ApiResponse({ status: 201, description: 'Asignacion creada exitosamente' })
    @ApiResponse({ status: 400, description: 'UUID invalido o datos incorrectos' })
    @ApiResponse({ status: 409, description: 'El vehiculo ya esta asignado activamente' })
    crear(
        @Body() dto: CreateAsignacionDto,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.asignacionService.crear(dto, authHeader);
    }

    @Get()
    @ApiBearerAuth('JWT-auth')
    @Resource('asignaciones.read')
    @ApiOperation({ summary: 'Listar todas las asignaciones' })
    @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
    listar(@Headers('authorization') authHeader?: string) {
        return this.asignacionService.listar(authHeader);
    }

    @Get('propietario/:userId')
    @ApiBearerAuth('JWT-auth')
    @Resource('asignaciones.read')
    @ApiOperation({
        summary: 'RF3 - Obtener flota de vehiculos de un propietario',
        description: 'Retorna la lista de vehiculos asignados al propietario, ' +
            'enriquecida con tipo y categoria obtenidos del Microservicio de Vehiculos.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario', example: 'a3f1b2c4-1234-4abc-89de-1234567890ab' })
    @ApiResponse({ status: 200, description: 'Lista de vehiculos asignados con tipo y categoria' })
    @ApiResponse({ status: 400, description: 'UUID invalido' })
    obtenerFlota(
        @Param('userId') userId: string,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.asignacionService.obtenerFlotaPorPropietario(userId, authHeader);
    }

    @ApiTags('Trazabilidad')
    @Get('trazabilidad/historial')
    @ApiBearerAuth('JWT-auth')
    @Resource('trazabilidad.read')
    @ApiOperation({
        summary: 'RF2 - Obtener historial completo de auditoria (enriquecido)',
        description: 'Retorna todos los eventos de auditoria con informacion amigable ' +
            '(nombres de usuario, datos de vehiculos). Endpoint principal: GET /trazabilidad/historial',
    })
    @ApiResponse({ status: 200, description: 'Todos los eventos de auditoria enriquecidos' })
    listarTrazabilidad(@Headers('authorization') authHeader?: string) {
        return this.trazabilidadService.listarTodos(authHeader);
    }

    @ApiTags('Trazabilidad')
    @Get('trazabilidad/propietario/:userId')
    @ApiBearerAuth('JWT-auth')
    @Resource('trazabilidad.read')
    @ApiOperation({
        summary: 'RF2 - Historial de auditoria de un propietario (enriquecido)',
        description: 'Retorna eventos de un propietario con datos legibles.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    listarTrazabilidadPorPropietario(
        @Param('userId') userId: string,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.trazabilidadService.listarPorPropietario(userId, authHeader);
    }

    @ApiTags('Trazabilidad')
    @Get('trazabilidad/:userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @Resource('trazabilidad.read')
    @ApiOperation({
        summary: 'RF2 - Historial de auditoria de una asignacion especifica (enriquecido)',
        description: 'Retorna eventos de una asignacion con datos legibles.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehiculo' })
    listarTrazabilidadPorAsignacion(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.trazabilidadService.listarPorAsignacion(userId, vehicleId, authHeader);
    }

    @Get(':userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @Resource('asignaciones.read')
    @ApiOperation({ summary: 'RF1 - Buscar asignacion por clave compuesta (userId + vehicleId)' })
    @ApiParam({ name: 'userId', description: 'UUID del propietario', example: 'a3f1b2c4-1234-4abc-89de-1234567890ab' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehiculo', example: 'b4e2c3d5-5678-4def-90ef-234567890bcd' })
    @ApiResponse({ status: 200, description: 'Asignacion encontrada' })
    @ApiResponse({ status: 404, description: 'Asignacion no encontrada' })
    buscarPorClave(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.asignacionService.buscarPorClave(userId, vehicleId, authHeader);
    }

    @Put(':userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @Resource('asignaciones.update')
    @ApiOperation({
        summary: 'RF1 - Actualizar asignacion (estado/notas)',
        description: 'Actualiza el estado o notas de una asignacion. ' +
            'Genera automaticamente un evento de trazabilidad MODIFICACION.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehiculo' })
    @ApiResponse({ status: 200, description: 'Asignacion actualizada' })
    @ApiResponse({ status: 400, description: 'Sin cambios detectados o datos invalidos' })
    @ApiResponse({ status: 404, description: 'Asignacion no encontrada' })
    actualizar(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
        @Body() dto: UpdateAsignacionDto,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.asignacionService.actualizar(userId, vehicleId, dto, authHeader);
    }

    @Delete(':userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @Resource('asignaciones.delete')
    @ApiOperation({
        summary: 'RF1 - Eliminar asignacion',
        description: 'Elimina una asignacion por su clave compuesta. ' +
            'Genera automaticamente un evento de trazabilidad ELIMINACION.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehiculo' })
    @ApiResponse({ status: 200, description: 'Asignacion eliminada' })
    @ApiResponse({ status: 404, description: 'Asignacion no encontrada' })
    eliminar(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
        @Headers('authorization') authHeader?: string,
    ) {
        return this.asignacionService.eliminar(userId, vehicleId, authHeader);
    }
}