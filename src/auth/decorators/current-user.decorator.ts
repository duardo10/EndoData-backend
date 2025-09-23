import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
    id: string;
    email: string;
    name: string;
    isAdministrador: boolean;
    crm: string;
    especialidade: string;
    createdAt: Date;
}

/**
 * Decorator para extrair dados do usuário autenticado da requisição
 * @param data Propriedade específica do usuário (opcional)
 * @param ctx Contexto de execução
 * @returns Dados do usuário ou propriedade específica
 */
export const CurrentUser = createParamDecorator(
    (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);
