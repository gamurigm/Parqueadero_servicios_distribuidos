import { Module } from '@nestjs/common';
import { OpaService } from './opa.service.js';

@Module({
  providers: [OpaService],
  exports: [OpaService],
})
export class OpaModule {}
