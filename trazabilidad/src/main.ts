import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS - mismo patrón que practica_clase
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
            /\.vercel\.app$/,
            /\.netlify\.app$/,
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Auth-Token',
        exposedHeaders: 'X-Auth-Token',
        credentials: true,
    });

    // Swagger - con servidor Kong Gateway
    const config = new DocumentBuilder()
        .setTitle('API Trazabilidad')
        .setDescription('Microservicio de Asignacion de Vehiculos y Trazabilidad (Auditoria)')
        .setVersion('1.0')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Pega aqui el access_token JWT',
            in: 'header',
        }, 'JWT-auth')
        .addServer('http://localhost:3002', 'Local - Directo')
        .addServer('http://host.docker.internal:3002', 'Docker - Host')
        .addServer('http://localhost:8000/trazabilidad', 'Kong Gateway')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            docExpansion: 'list',
        },
        customSiteTitle: 'API Trazabilidad',
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.listen(process.env.PORT ?? 3002, '0.0.0.0');
    console.log(`🚀 Trazabilidad Service corriendo en: http://localhost:${process.env.PORT ?? 3002}`);
    console.log(`📚 Swagger UI: http://localhost:${process.env.PORT ?? 3002}/docs`);
}
bootstrap();
