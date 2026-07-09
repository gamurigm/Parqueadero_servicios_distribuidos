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
import { AuditService } from './audit.service';
import { CreateAuditEventDto } from './dto/create-audit.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAuditEventDto) {
    return this.auditService.create(dto);
  }

  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const event = await this.auditService.findOne(id);

    if (!event) {
      throw new NotFoundException(`Audit event ${id} not found`);
    }

    return event;
  }
}
