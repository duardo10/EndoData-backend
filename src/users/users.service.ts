import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Serviço responsável por operações relacionadas ao usuário.
 * Fornece métodos para criar, listar, buscar e remover usuários.
 */
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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