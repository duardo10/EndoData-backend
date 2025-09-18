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
     * Valida as credenciais do usuário e retorna o token JWT
     * @param loginDto Dados de login (email e senha)
     * @returns Token JWT e informações do usuário
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
     * Valida um usuário pelo ID (usado pelo JWT Strategy)
     * @param userId ID do usuário
     * @returns Dados do usuário sem a senha
     */
    async validateUser(userId: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'isAdministrador', 'crm', 'especialidade', 'createdAt'],
        });

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        return user;
    }

    /**
     * Verifica se o token JWT é válido
     * @param token Token JWT
     * @returns Dados decodificados do token
     */
    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }
}
