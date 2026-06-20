const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');

async function bootstrap() {
  console.log('Starting Nest application...');
  const app = await NestFactory.create(AppModule);
  console.log('App created, starting server...');
  await app.listen(3000);
  console.log('Server running on port 3000');
}
bootstrap().catch(e => console.error(e));