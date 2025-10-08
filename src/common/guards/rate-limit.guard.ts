import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

/**
 * Guard de rate limiting simples em memória por usuário.
 * Limite: 100 requisições por janela de 1 minuto (por `user.id` ou IP).
 * Obs.: Para produção/ambiente distribuído, use um store compartilhado (Redis).
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs = 60_000; // 1 minuto
  private readonly max = 100; // 100 req/min

  private readonly userBuckets = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const userId: string | undefined = req.user?.id;
    const clientKey = userId || req.ip || 'anonymous';

    const now = Date.now();
    const bucket = this.userBuckets.get(clientKey);

    if (!bucket || now >= bucket.resetAt) {
      this.userBuckets.set(clientKey, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (bucket.count >= this.max) {
      throw new HttpException('Limite de requisições excedido. Tente novamente em instantes.', HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
    return true;
  }
}


