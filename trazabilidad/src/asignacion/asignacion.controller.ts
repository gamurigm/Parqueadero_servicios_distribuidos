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

/**
 * Controlador de Asignaciones y Trazabilidad.
 * Expone los endpoints RF1, RF2 y RF3.
 * SOLID - DIP: Depende de AsignacionService y TrazabilidadService (abstracciones).
 * Nota NestJS: El controlador se registra en el módulo, no como archivo individual.
 */
@ApiTags('Asignaciones')
@Controller('asignaciones')
export class AsignacionController {
    constructor(
        private readonly asignacionService: AsignacionService,
        private readonly trazabilidadService: TrazabilidadService,
    ) {}

    // ──────────────────────────────────────────────────
    // RF1 - Asignación de Vehículos a Propietarios
    // ──────────────────────────────────────────────────

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'RF1 - Crear asignación vehículo-propietario',
        description: 'Asocia un vehículo a un propietario usando clave compuesta (userId + vehicleId). ' +
            'Un vehículo solo puede tener una asignación activa a la vez. ' +
            'Genera automáticamente un evento de trazabilidad CREACION.',
    })
    @ApiResponse({ status: 201, description: 'Asignación creada exitosamente' })
    @ApiResponse({ status: 400, description: 'UUID inválido o datos incorrectos' })
    @ApiResponse({ status: 409, description: 'El vehículo ya está asignado activamente' })
    crear(@Body() dto: CreateAsignacionDto) {
        return this.asignacionService.crear(dto);
    }

    @Get()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Listar todas las asignaciones' })
    @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
    listar() {
        return this.asignacionService.listar();
    }

    // ──────────────────────────────────────────────────
    // RF3 - Consulta de Flota por Propietario
    // ──────────────────────────────────────────────────

    @Get('propietario/:userId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'RF3 - Obtener flota de vehículos de un propietario',
        description: 'Retorna la lista de vehículos asignados al propietario, ' +
            'enriquecida con tipo y categoría obtenidos del Microservicio de Vehículos.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario', example: 'a3f1b2c4-1234-4abc-89de-1234567890ab' })
    @ApiResponse({ status: 200, description: 'Lista de vehículos asignados con tipo y categoría' })
    @ApiResponse({ status: 400, description: 'UUID inválido' })
    obtenerFlota(@Param('userId') userId: string) {
        return this.asignacionService.obtenerFlotaPorPropietario(userId);
    }

    // ──────────────────────────────────────────────────
    // RF2 - Consultas de Trazabilidad (Auditoría)
    // ──────────────────────────────────────────────────

    @ApiTags('Trazabilidad')
    @Get('trazabilidad/historial')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'RF2 - Obtener historial completo de auditoría' })
    @ApiResponse({ status: 200, description: 'Todos los eventos de auditoría' })
    listarTrazabilidad() {
        return this.trazabilidadService.listarTodos();
    }

    @ApiTags('Trazabilidad')
    @Get('trazabilidad/propietario/:userId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'RF2 - Historial de auditoría de un propietario' })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    listarTrazabilidadPorPropietario(@Param('userId') userId: string) {
        return this.trazabilidadService.listarPorPropietario(userId);
    }

    @ApiTags('Trazabilidad')
    @Get('trazabilidad/:userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'RF2 - Historial de auditoría de una asignación específica' })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehículo' })
    listarTrazabilidadPorAsignacion(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
    ) {
        return this.trazabilidadService.listarPorAsignacion(userId, vehicleId);
    }

    // ──────────────────────────────────────────────────
    // Búsqueda y Operaciones por Clave Compuesta (Debe ir al final por los :dinamicos)
    // ──────────────────────────────────────────────────

    @Get(':userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'RF1 - Buscar asignación por clave compuesta (userId + vehicleId)' })
    @ApiParam({ name: 'userId', description: 'UUID del propietario', example: 'a3f1b2c4-1234-4abc-89de-1234567890ab' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehículo', example: 'b4e2c3d5-5678-4def-90ef-234567890bcd' })
    @ApiResponse({ status: 200, description: 'Asignación encontrada' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    buscarPorClave(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
    ) {
        return this.asignacionService.buscarPorClave(userId, vehicleId);
    }

    @Put(':userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'RF1 - Actualizar asignación (estado/notas)',
        description: 'Actualiza el estado o notas de una asignación. ' +
            'Genera automáticamente un evento de trazabilidad MODIFICACION.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehículo' })
    @ApiResponse({ status: 200, description: 'Asignación actualizada' })
    @ApiResponse({ status: 400, description: 'Sin cambios detectados o datos inválidos' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    actualizar(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
        @Body() dto: UpdateAsignacionDto,
    ) {
        return this.asignacionService.actualizar(userId, vehicleId, dto);
    }

    @Delete(':userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'RF1 - Eliminar asignación',
        description: 'Elimina una asignación por su clave compuesta. ' +
            'Genera automáticamente un evento de trazabilidad ELIMINACION.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehículo' })
    @ApiResponse({ status: 200, description: 'Asignación eliminada' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    eliminar(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
    ) {
        return this.asignacionService.eliminar(userId, vehicleId);
    }
}
