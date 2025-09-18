import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    isAdministrador: boolean;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        });
    }

    /**
     * Valida o payload do JWT e retorna os dados do usuário
     * @param payload Payload decodificado do JWT
     * @returns Dados do usuário autenticado
     */
    async validate(payload: JwtPayload) {
        try {
            const user = await this.authService.validateUser(payload.sub);

            if (!user) {
                throw new UnauthorizedException('Usuário não encontrado');
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdministrador: user.isAdministrador,
                crm: user.crm,
                especialidade: user.especialidade,
                createdAt: user.createdAt,
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido ou usuário não encontrado');
        }
    }
}
