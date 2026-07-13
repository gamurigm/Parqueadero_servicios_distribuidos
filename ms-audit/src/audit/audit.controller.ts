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
import { Resource } from '../opa/decorators/resource.decorator';
import { Action } from '../opa/decorators/action.decorator';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Resource('audit.create')
  @Action('create')
  create(@Body() dto: CreateAuditEventDto) {
    return this.auditService.create(dto);
  }

  @Get()
  @Resource('audit.read')
  @Action('read')
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  @Resource('audit.read')
  @Action('read')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const event = await this.auditService.findOne(id);

    if (!event) {
      throw new NotFoundException(`Audit event ${id} not found`);
    }

    return event;
  }
}
