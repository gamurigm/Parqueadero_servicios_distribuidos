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
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://host.docker.internal:3000',
      'http://localhost:5000',
      'http://localhost:8080',
      'http://localhost:8000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Vehiculos')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addServer('http://localhost:3000', 'Local - Directo')
    .addServer('http://host.docker.internal:3000', 'Docker - Host')
    .addServer('http://localhost:8000/vehiculos', 'Kong Gateway')
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