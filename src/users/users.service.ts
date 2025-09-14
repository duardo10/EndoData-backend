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
   * @returns Usuário criado
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    return this.usersRepository.save(user);
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