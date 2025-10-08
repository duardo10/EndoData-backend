import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import xss from 'xss';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

/**
 * Função principal que inicializa a aplicação NestJS.
 * Configura CORS, validação global, prefixo de API, Swagger e inicia o servidor.
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

  // Interceptor global de auditoria (ações críticas)
  app.useGlobalInterceptors(new AuditLogInterceptor());

  // Guard global de rate limiting (100 req/min por usuário)
  app.useGlobalGuards(new RateLimitGuard());

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

  // Sanitização simples de inputs (XSS) — aplica em bodies string
  app.use((req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      for (const key of Object.keys(req.body)) {
        const val = req.body[key];
        if (typeof val === 'string') {
          req.body[key] = xss(val);
        }
      }
    }
    next();
  });

  // Prefixo global para API
  app.setGlobalPrefix('api');

  // Configuração do Swagger (depois do prefixo global)
  const config = new DocumentBuilder()
    .setTitle('EndoData API')
    .setDescription('API para gerenciamento de dados endocrinológicos')
    .setVersion('1.0')
    .addTag('users', 'Operações relacionadas aos usuários')
    .addTag('dashboard', 'Estatísticas e dados da tela inicial')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Insira o token JWT no formato: Bearer <seu_token>',
        name: 'Authorization',
        in: 'header',
      },
      'bearer',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();