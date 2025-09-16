import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Pick<User, 'id' | 'name' | 'email' | 'cpf' | 'crm' | 'createdAt' | 'updatedAt'>> {
    const existing = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);

    const user = this.usersRepository.create({
      name: createUserDto.nome,
      email: createUserDto.email,
      cpf: createUserDto.cpf ?? null,
      crm: createUserDto.crm ?? null,
      passwordHash: hashedPassword,
    });

    const saved = await this.usersRepository.save(user);
    const { id, name, email, cpf, crm, createdAt, updatedAt } = saved;
    return { id, name, email, cpf, crm, createdAt, updatedAt };
  }

  async findAll(): Promise<Array<Pick<User, 'id' | 'name' | 'email' | 'cpf' | 'crm' | 'createdAt' | 'updatedAt'>>> {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'cpf', 'crm', 'createdAt', 'updatedAt'],
    });
    return users.map(({ id, name, email, cpf, crm, createdAt, updatedAt }) => ({ id, name, email, cpf, crm, createdAt, updatedAt }));
  }

  async findOne(id: string): Promise<Pick<User, 'id' | 'name' | 'email' | 'cpf' | 'crm' | 'createdAt' | 'updatedAt'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'cpf', 'crm', 'createdAt', 'updatedAt'],
    });
    if (!user) return null as any;
    const { name, email, cpf, crm, createdAt, updatedAt } = user;
    return { id, name, email, cpf, crm, createdAt, updatedAt };
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}