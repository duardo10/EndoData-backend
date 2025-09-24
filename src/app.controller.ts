import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

/**
 * Controller principal da aplicação.
 * Responsável por gerenciar as rotas principais e de saúde do sistema.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Retorna mensagem de boas-vindas.
   * @returns String de saudação
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Endpoint de verificação de saúde da aplicação.
   * @returns Status, timestamp e uptime
   */
  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}