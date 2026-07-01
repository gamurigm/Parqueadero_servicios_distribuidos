import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VehiculosClientService } from './vehiculos-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get('VEHICULOS_SERVICE_URL', 'http://localhost:3000'),
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [VehiculosClientService],
  exports: [VehiculosClientService],
})
export class VehiculosClientModule {}
