import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Função principal que inicializa a aplicação NestJS.
 * - Configura CORS, validação global, prefixo de API e inicia o servidor.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Filtro global de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Pipes de validação global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        value: error.value,
        constraints: error.constraints,
      }));
      return new HttpException({
        message: 'Dados inválidos',
        details: result,
      }, HttpStatus.BAD_REQUEST);
    },
  }));

  // Prefixo global para API
  app.setGlobalPrefix('api');

  // Configuração do Swagger (depois do prefixo global)
  const config = new DocumentBuilder()
    .setTitle('EndoData API')
    .setDescription('API para gerenciamento de dados endocrinológicos')
    .setVersion('1.0')
    .addTag('users', 'Operações relacionadas aos usuários')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();