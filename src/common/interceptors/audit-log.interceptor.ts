import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/**
 * Interceptor que registra logs de auditoria para ações críticas.
 * Para produção, direcione para um logger/stream externo (ELK/SIEM) e evite dados sensíveis.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id ?? 'anonymous';
    const { method, originalUrl } = req;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startedAt;
          // Evitar logar bodies inteiros; registrar metadados essenciais
          console.log('[AUDIT]', {
            userId,
            method,
            url: originalUrl,
            status: 200,
            durationMs,
            ts: new Date().toISOString(),
          });
        },
        error: (err) => {
          const durationMs = Date.now() - startedAt;
          console.warn('[AUDIT][ERROR]', {
            userId,
            method,
            url: originalUrl,
            status: err?.status ?? 500,
            durationMs,
            ts: new Date().toISOString(),
          });
        },
      }),
    );
  }
}


