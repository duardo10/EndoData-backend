import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Realizar login',
        description: 'Autentica um usuário e retorna um token JWT',
    })
    @ApiBody({
        type: LoginDto,
        description: 'Credenciais de login',
    })
    @ApiResponse({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    description: 'Token JWT para autenticação',
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        isAdministrador: { type: 'boolean' },
                        crm: { type: 'string' },
                        especialidade: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciais inválidas',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Credenciais inválidas' },
                statusCode: { type: 'number', example: 401 },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Dados inválidos' },
                details: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            property: { type: 'string' },
                            value: { type: 'string' },
                            constraints: { type: 'object' },
                        },
                    },
                },
                statusCode: { type: 'number', example: 400 },
            },
        },
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
