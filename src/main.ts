import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties without decorators
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types (string to number, etc.)
      },
      disableErrorMessages: true, // Show detailed error messages
      stopAtFirstError: false,
    }),
  );

  // Apply exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
  console.log('🚀 Application running on: http://localhost:3000');
}
bootstrap().catch((error) => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});
