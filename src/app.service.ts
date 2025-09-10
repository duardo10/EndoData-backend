import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! NestJS com PostgreSQL rodando no Docker 🚀';
  }
}