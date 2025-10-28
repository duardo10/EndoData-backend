import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';


/**
 * Serviço responsável por operações relacionadas ao usuário.
 * Fornece métodos para criar, listar, buscar e remover usuários.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Atualiza o perfil do usuário autenticado (nome, email, telefone).
   */
  async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Verifica se o email está sendo alterado e se já existe
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (existingEmail) throw new ConflictException('E-mail já cadastrado');
    }

    // Verifica se o CRM está sendo alterado e se já existe
    if (dto.crm && dto.crm !== user.crm) {
      const existingCrm = await this.usersRepository.findOne({ where: { crm: dto.crm } });
      if (existingCrm) throw new ConflictException('CRM já cadastrado');
    }

    // Verifica se todos os campos enviados são iguais aos já salvos
    const isSame =
      (dto.name === undefined || dto.name === user.name) &&
      (dto.email === undefined || dto.email === user.email) &&
      (dto.phone === undefined || dto.phone === user.phone) &&
      (dto.crm === undefined || dto.crm === user.crm) &&
      (dto.especialidade === undefined || dto.especialidade === user.especialidade);
    if (isSame) {
      // Retorna 204 No Content se não houve alteração
      return { __NO_CONTENT: true };
    }

    user.name = dto.name ?? user.name;
    user.email = dto.email ?? user.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.crm !== undefined) user.crm = dto.crm;
    if (dto.especialidade !== undefined) user.especialidade = dto.especialidade;
    await this.usersRepository.save(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      crm: user.crm,
      especialidade: user.especialidade,
    };
  }

  /**
   * Atualiza a senha do usuário autenticado.
   */
  async updatePassword(userId: string, dto: UpdateUserPasswordDto): Promise<any> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('Usuário não encontrado');
  if (!dto.password || !dto.confirmPassword) throw new BadRequestException('Senha e confirmação são obrigatórias');
  if (dto.password.trim() === '' || dto.confirmPassword.trim() === '') throw new BadRequestException('Senha e confirmação não podem ser vazias');
  if (dto.password !== dto.confirmPassword) throw new BadRequestException('As senhas não coincidem');
  if (dto.password.length < 6) throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
  // Verifica se a nova senha é igual à atual
    const isSamePassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (isSamePassword) {
      // Retorna 204 No Content se a senha for igual à atual
      return { __NO_CONTENT: true };
    }
  user.passwordHash = await bcrypt.hash(dto.password, 10);
  await this.usersRepository.save(user);
  return { message: 'Senha alterada com sucesso.' };
  }

  /**
   * Cria um novo usuário com senha criptografada.
   * Valida unicidade de e-mail, CPF e CRM.
   * @param createUserDto Dados para criação do usuário
   * @returns Usuário criado (campos públicos)
   */
  async create(createUserDto: CreateUserDto): Promise<Pick<User, 'id' | 'name' | 'email' | 'cpf' | 'crm' | 'createdAt' | 'updatedAt'>> {
    // Verificar e-mail duplicado
    const existingEmail = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Verificar CPF duplicado
    const existingCpf = await this.usersRepository.findOne({ where: { cpf: createUserDto.cpf } });
    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Verificar CRM duplicado
    const existingCrm = await this.usersRepository.findOne({ where: { crm: createUserDto.crm } });
    if (existingCrm) {
      throw new ConflictException('CRM já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);
    const user = this.usersRepository.create({
      name: createUserDto.nome,
      email: createUserDto.email,
      cpf: createUserDto.cpf,
      crm: createUserDto.crm,
      passwordHash: hashedPassword,
    });

    const saved = await this.usersRepository.save(user);
    const { id, name, email, cpf, crm, createdAt, updatedAt } = saved;
    return { id, name, email, cpf, crm, createdAt, updatedAt };
  }

  /**
   * Retorna todos os usuários cadastrados (campos públicos).
   * @returns Lista de usuários
   */
  async findAll(): Promise<Array<Pick<User, 'id' | 'name' | 'email' | 'cpf' | 'crm' | 'createdAt' | 'updatedAt'>>> {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'cpf', 'crm', 'createdAt', 'updatedAt'],
    });
    return users.map(({ id, name, email, cpf, crm, createdAt, updatedAt }) => ({ id, name, email, cpf, crm, createdAt, updatedAt }));
  }

  /**
   * Busca um usuário pelo ID (campos públicos).
   * @param id ID do usuário
   * @returns Usuário encontrado ou null
   */
  async findOne(id: string): Promise<Pick<User, 'id' | 'name' | 'email' | 'cpf' | 'crm' | 'createdAt' | 'updatedAt'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'cpf', 'crm', 'createdAt', 'updatedAt'],
    });
    if (!user) return null as any;
    const { name, email, cpf, crm, createdAt, updatedAt } = user;
    return { id, name, email, cpf, crm, createdAt, updatedAt };
  }

  /**
   * Remove um usuário pelo ID.
   * @param id ID do usuário
   */
  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}