import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Serviço responsável por operações relacionadas ao usuário.
 */
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Cria um novo usuário com senha criptografada.
   * @param createUserDto Dados para criação do usuário
   * @returns Usuário criado (sem passwordHash)
   */
  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    // Verifica se o e-mail já está cadastrado
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    // Verifica se o CRM já está cadastrado
    const existingCrm = await this.usersRepository.findOne({ where: { crm: createUserDto.crm } });
    if (existingCrm) {
      throw new Error('CRM já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);
    
    // Remove passwordHash da resposta
    const { passwordHash, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * Retorna todos os usuários cadastrados (campos públicos).
   * @returns Lista de usuários
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Busca um usuário pelo ID (campos públicos).
   * @param id ID do usuário
   * @returns Usuário encontrado ou undefined
   */
  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Remove um usuário pelo ID.
   * @param id ID do usuário
   */
  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}