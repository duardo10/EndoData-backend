import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Observable } from 'rxjs';

/**
 * Interceptor de cache personalizado para endpoints do dashboard.
 * 
 * Extende o CacheInterceptor padrão para incluir o ID do usuário autenticado
 * na chave do cache, garantindo que cada médico tenha seu próprio cache
 * isolado de dados.
 * 
 * Funcionalidades:
 * - TTL configurado para 1 hora (3600 segundos)
 * - Chave do cache inclui URL + ID do usuário
 * - Isolamento automático de dados por médico
 * - Performance otimizada para estatísticas que não mudam frequentemente
 */
@Injectable()
export class DashboardCacheInterceptor extends CacheInterceptor {
  /**
   * Gera uma chave de cache única baseada na URL e no ID do usuário.
   * 
   * Formato da chave: `/dashboard/endpoint:userId`
   * Exemplo: `/dashboard/summary:550e8400-e29b-41d4-a716-446655440000`
   * 
   * @param context Contexto de execução da requisição
   * @returns Chave única para o cache incluindo ID do usuário
   */
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    
    // Se não há usuário autenticado, não aplicar cache
    if (!userId) {
      return undefined;
    }
    
    // Construir chave única com URL e ID do usuário
    const url = request.url;
    return `${url}:${userId}`;
  }
}