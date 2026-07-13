import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { CreateAuditEventDto } from './dto/create-audit.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Resource } from '../opa/decorators/resource.decorator.js';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAuditEventDto) {
    return this.auditService.create(dto);
  }

  @Get()
  @Resource('audit.read')
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  @Resource('audit.detail')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const event = await this.auditService.findOne(id);

    if (!event) {
      throw new NotFoundException(`Audit event ${id} not found`);
    }

    return event;
  }
}
