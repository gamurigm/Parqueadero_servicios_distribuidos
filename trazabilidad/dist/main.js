"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:8085',
            'http://127.0.0.1:8085',
            'http://localhost:3002',
            'http://host.docker.internal:3002',
            'http://localhost:3000',
            'http://localhost:5000',
            'http://localhost:8080',
            'http://localhost:8000',
            /\.vercel\.app$/,
            /\.netlify\.app$/,
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API Trazabilidad')
        .setDescription('Microservicio de Asignación de Vehículos y Trazabilidad (Auditoría)')
        .setVersion('1.0')
        .addServer('http://localhost:3002', 'Local - Directo')
        .addServer('http://host.docker.internal:3002', 'Docker - Host')
        .addServer('http://localhost:8000/trazabilidad', 'Kong Gateway')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
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
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.listen(process.env.PORT ?? 3002, '0.0.0.0');
    console.log(`🚀 Trazabilidad Service corriendo en: http://localhost:${process.env.PORT ?? 3002}`);
    console.log(`📚 Swagger UI: http://localhost:${process.env.PORT ?? 3002}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map