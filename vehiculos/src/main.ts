import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CreateVehiculoDto } from './vehiculos/dto/create-vehiculo.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: [
      'http://localhost:8085',
      'http://127.0.0.1:8085',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'http://host.docker.internal:8000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://host.docker.internal:5000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://host.docker.internal:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://host.docker.internal:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://host.docker.internal:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3003',
      'http://host.docker.internal:3003',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://host.docker.internal:8080',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'http://host.docker.internal:8081',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Auth-Token',
    exposedHeaders: 'X-Auth-Token',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Vehiculos')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addServer('http://localhost:8000/vehiculos', 'Kong Gateway')
    .addServer('http://localhost:3001', 'Local - Directo')
    .addServer('http://host.docker.internal:3001', 'Docker - Host')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions:{
        enableImplicitConversion: true,
      },
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();