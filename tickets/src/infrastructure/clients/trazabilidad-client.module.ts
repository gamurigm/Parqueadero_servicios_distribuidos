import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TrazabilidadClientService } from './trazabilidad-client.service';
import { TRAZABILIDAD_CLIENT } from '../../application/ports/trazabilidad-client.interface';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [
    {
      provide: TRAZABILIDAD_CLIENT,
      useClass: TrazabilidadClientService,
    },
  ],
  exports: [TRAZABILIDAD_CLIENT],
})
export class TrazabilidadClientModule {}
