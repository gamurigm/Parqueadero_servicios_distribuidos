import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    BadRequestException,
    Headers,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { TrazabilidadService } from './trazabilidad.service';
import { RegistrarEventoDto } from './dto/registrar-evento.dto';
import { Microservicio } from './entities/trazabilidad.entity';

/**
 * Controlador de Trazabilidad.
 * Expone endpoints para registrar y consultar eventos de auditoría
 * de todos los microservicios del sistema.
 */
@ApiTags('Trazabilidad')
@Controller('trazabilidad')
export class TrazabilidadController {
    constructor(
        private readonly trazabilidadService: TrazabilidadService,
    ) {}

    // ──────────────────────────────────────────────────
    // Registro de eventos desde cualquier microservicio
    // ──────────────────────────────────────────────────

    @Post('registrar')
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Registrar evento de trazabilidad desde cualquier microservicio',
        description: 'Endpoint receptor para que cualquier microservicio (Usuarios, Vehículos, Zonas, Tickets) ' +
            'pueda registrar un evento de auditoría. Recibe información del microservicio de origen, ' +
            'endpoint, acción, descripción legible y payloads opcionales.',
    })
    @ApiResponse({ status: 201, description: 'Evento de trazabilidad registrado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    async registrarEvento(@Body() dto: RegistrarEventoDto) {
        return this.trazabilidadService.registrarEvento(dto);
    }

    // ──────────────────────────────────────────────────
    // Consultas de trazabilidad
    // ──────────────────────────────────────────────────

    @Get('historial')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Obtener historial completo de auditoría (todos los microservicios)',
        description: 'Retorna todos los eventos de trazabilidad del sistema, ' +
            'enriquecidos con datos legibles (nombres de usuario, placas de vehículo).',
    })
    @ApiResponse({ status: 200, description: 'Historial completo de auditoría enriquecido' })
    async listarTodos(@Headers('authorization') authHeader: string) {
        console.log('--- AUTH HEADER RECEIVED IN TRAZABILIDAD ---', authHeader);
        return this.trazabilidadService.listarTodos(authHeader);
    }

    @Get('microservicio/:nombre')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Filtrar trazabilidad por microservicio',
        description: 'Retorna eventos de un microservicio específico (USUARIOS, VEHICULOS, ZONAS, TICKETS, TRAZABILIDAD).',
    })
    @ApiParam({
        name: 'nombre',
        description: 'Nombre del microservicio',
        enum: Microservicio,
        example: 'VEHICULOS',
    })
    @ApiResponse({ status: 200, description: 'Eventos filtrados por microservicio' })
    @ApiResponse({ status: 400, description: 'Nombre de microservicio inválido' })
    async listarPorMicroservicio(
        @Param('nombre') nombre: string,
        @Headers('authorization') authHeader: string,
    ) {
        const microservicioUpper = nombre.toUpperCase() as Microservicio;
        if (!Object.values(Microservicio).includes(microservicioUpper)) {
            throw new BadRequestException(
                `Microservicio inválido: "${nombre}". Valores válidos: ${Object.values(Microservicio).join(', ')}`,
            );
        }
        return this.trazabilidadService.listarPorMicroservicio(microservicioUpper, authHeader);
    }

    @Get('propietario/:userId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Historial de auditoría de un propietario',
        description: 'Retorna todos los eventos de trazabilidad asociados a un propietario, ' +
            'enriquecidos con datos legibles.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiResponse({ status: 200, description: 'Eventos de trazabilidad del propietario' })
    async listarPorPropietario(
        @Param('userId') userId: string,
        @Headers('authorization') authHeader: string,
    ) {
        return this.trazabilidadService.listarPorPropietario(userId, authHeader);
    }

    @Get(':userId/:vehicleId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Historial de auditoría de una asignación específica',
        description: 'Retorna los eventos de trazabilidad de una asignación (userId + vehicleId), ' +
            'enriquecidos con datos legibles.',
    })
    @ApiParam({ name: 'userId', description: 'UUID del propietario' })
    @ApiParam({ name: 'vehicleId', description: 'UUID del vehículo' })
    @ApiResponse({ status: 200, description: 'Eventos de trazabilidad de la asignación' })
    async listarPorAsignacion(
        @Param('userId') userId: string,
        @Param('vehicleId') vehicleId: string,
        @Headers('authorization') authHeader: string,
    ) {
        return this.trazabilidadService.listarPorAsignacion(userId, vehicleId, authHeader);
    }
}
