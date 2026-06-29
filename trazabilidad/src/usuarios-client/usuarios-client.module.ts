import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosClientService } from './usuarios-client.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                baseURL: configService.get('USUARIOS_SERVICE_URL', 'http://localhost:5000'),
                timeout: 5000,
                maxRedirects: 5,
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [UsuariosClientService],
    exports: [UsuariosClientService],
})
export class UsuariosClientModule {}
