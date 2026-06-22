import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: [
            'http://localhost:8085',
            'http://127.0.0.1:8085',
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            'http://host.docker.internal:5000',
            'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost:8000',
            /\.vercel\.app$/,
            /\.netlify\.app$/,
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('API Usuarios')
        .setDescription('Gestión de usuarios')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .addServer('http://localhost:5000', 'Local - Directo')
        .addServer('http://host.docker.internal:5000', 'Docker - Host')
        .addServer('http://localhost:8000/usuarios', 'Kong Gateway')
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
        customSiteTitle: 'API Usuarios',
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
bootstrap();