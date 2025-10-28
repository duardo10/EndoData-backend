/**
 * Controller de usuários.
 *
 * Expõe endpoints REST para cadastro e consulta de usuários. As rotas são
 * protegidas por padrão via JwtAuthGuard global, com exceção das rotas
 * explicitamente marcadas com @Public().
 */
import { Controller, Get, Post, Patch, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('bearer')
export class UsersController {
  /**
   * Controlador responsável pelas rotas de usuários.
   * Expõe endpoints para criar, listar, buscar e remover usuários.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Retorna o perfil do usuário autenticado (médico).
   *
   * Usa o decorator `CurrentUser` para extrair os dados do token JWT
   * e retornar informações básicas do médico logado.
   *
   * @returns Dados do médico autenticado
   */
  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  getProfile(@CurrentUser() user: CurrentUserData) {
    return user;
  }

  /**
   * Atualiza o perfil do usuário autenticado (nome, email, telefone).
   */
  @Patch('profile')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async updateProfile(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateUserProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  /**
   * Atualiza a senha do usuário autenticado.
   */
  @Patch('password')
  @ApiOperation({ summary: 'Alterar senha do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async updatePassword(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateUserPasswordDto) {
    return this.usersService.updatePassword(user.id, dto);
  }

  /**
   * Cria um novo usuário.
   * @param createUserDto Dados de criação do usuário
   */
  @Post()
  @Public() // Rota pública para criação de usuários (registro)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'Email ou CRM já cadastrado.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Lista todos os usuários cadastrados.
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  findAll(@CurrentUser() user: CurrentUserData) {
    // Exemplo de como acessar dados do usuário autenticado
    console.log('Usuário autenticado:', user.name);
    return this.usersService.findAll();
  }

  /**
   * Busca um usuário pelo seu ID.
   * @param id ID do usuário
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Remove um usuário pelo seu ID.
   * @param id ID do usuário
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}