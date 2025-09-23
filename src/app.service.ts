import { Injectable } from '@nestjs/common';

/**
 * Serviço principal da aplicação.
 * Fornece métodos utilitários e de status do sistema.
 */
export class AppService {
  /**
   * Retorna mensagem de boas-vindas.
   * @returns String de saudação
   */
  getHello(): string {
    return 'Hello World! NestJS com PostgreSQL rodando no Docker 🚀';
  }
}