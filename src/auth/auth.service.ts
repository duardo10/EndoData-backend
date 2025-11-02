/**
 * Serviço de autenticação.
 *
 * Encapsula a validação de credenciais de usuário, geração/validação de
 * tokens JWT e recuperação de dados de usuário para o fluxo de autenticação.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    /**
     * Valida as credenciais do usuário e retorna um token JWT assinado.
     *
     * - Busca usuário por email
     * - Compara a senha informada com o hash persistido
     * - Cria o payload e assina o token JWT
     *
     * @param loginDto Credenciais de login (email e senha)
     * @returns Objeto com `access_token` e os dados do usuário (sem senha)
     */
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Busca o usuário pelo email
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'passwordHash', 'isAdministrador', 'crm', 'especialidade'],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        // Gera o token JWT
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            isAdministrador: user.isAdministrador,
        };

        const token = this.jwtService.sign(payload);

        // Remove a senha do retorno
        const { passwordHash, ...userWithoutPassword } = user;

        return {
            access_token: token,
            user: userWithoutPassword,
        };
    }

    /**
     * Recupera e valida um usuário pelo seu ID.
     * Utilizado pela estratégia JWT na etapa de validação do token.
     *
     * @param userId Identificador do usuário (UUID)
     * @returns Dados essenciais do usuário (sem senha)
     */
    async validateUser(userId: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'isAdministrador', 'crm', 'especialidade', 'createdAt', 'phone'],
        });

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        return user;
    }

    /**
     * Verifica a validade de um token JWT.
     * Lança UnauthorizedException quando o token é inválido/expirado.
     *
     * @param token Token JWT em formato Bearer (sem o prefixo)
     * @returns Payload decodificado quando válido
     */
    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }
}
