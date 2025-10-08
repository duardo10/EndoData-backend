import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';
import { createMockRepository } from './mocks/typeorm-mocks';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;

  beforeEach(async () => {
    const mockUserRepository = createMockRepository<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    userRepository.resetMocks();
  });

  describe('create', () => {
    it('deve criar usuário com sucesso e retornar sem senha', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const saved: Partial<User> = {
        id: 'uuid-1',
        name: 'Nome do Usuário',
        email: 'usuario@exemplo.com',
        cpf: '123.456.789-00',
        crm: '12345',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userRepository.create.mockImplementation((u: any) => ({ ...u }));
      userRepository.save.mockResolvedValue(saved);

      const result = await service.create({
        nome: 'Nome do Usuário',
        email: 'usuario@exemplo.com',
        senha: 'SenhaSegura123!',
        cpf: '123.456.789-00',
        crm: '12345',
      });

      expect(result).toMatchObject({
        id: 'uuid-1',
        name: 'Nome do Usuário',
        email: 'usuario@exemplo.com',
        cpf: '123.456.789-00',
        crm: '12345',
      });
      // não deve conter passwordHash
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('deve falhar com e-mail duplicado', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'exists' });
      await expect(
        service.create({
          nome: 'Nome',
          email: 'ja@existe.com',
          senha: 'SenhaSegura123!',
          cpf: '123.456.789-00',
          crm: '12345',
        }),
      ).rejects.toThrow('E-mail já cadastrado');
    });

    it('deve falhar com CPF duplicado', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 'exists' }); // cpf check

      await expect(
        service.create({
          nome: 'Nome',
          email: 'novo@exemplo.com',
          senha: 'SenhaSegura123!',
          cpf: '123.456.789-00',
          crm: '12345',
        }),
      ).rejects.toThrow('CPF já cadastrado');
    });

    it('deve falhar com CRM duplicado', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null) // cpf check
        .mockResolvedValueOnce({ id: 'exists' }); // crm check

      await expect(
        service.create({
          nome: 'Nome',
          email: 'novo@exemplo.com',
          senha: 'SenhaSegura123!',
          cpf: '987.654.321-00',
          crm: '12345',
        }),
      ).rejects.toThrow('CRM já cadastrado');
    });

    it('deve chamar bcrypt.hash com a senha', async () => {
      const bcrypt = require('bcrypt');
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockImplementation((u: any) => ({ ...u }));
      userRepository.save.mockResolvedValue({
        id: 'uuid-1',
        name: 'Nome',
        email: 'test@example.com',
        cpf: '123.456.789-00',
        crm: '12345',
      });

      await service.create({
        nome: 'Nome',
        email: 'test@example.com',
        senha: 'SenhaSegura123!',
        cpf: '123.456.789-00',
        crm: '12345',
      });

      expect(hashSpy).toHaveBeenCalledWith('SenhaSegura123!', 10);
      hashSpy.mockRestore();
    });

    it('deve verificar unicidade de email primeiro', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockImplementation((u: any) => ({ ...u }));
      userRepository.save.mockResolvedValue({});

      await service.create({
        nome: 'Nome',
        email: 'test@example.com',
        senha: 'SenhaSegura123!',
        cpf: '123.456.789-00',
        crm: '12345',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('deve verificar unicidade de CPF em seguida', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null) // cpf check
        .mockResolvedValueOnce(null); // crm check
      userRepository.create.mockImplementation((u: any) => ({ ...u }));
      userRepository.save.mockResolvedValue({});

      await service.create({
        nome: 'Nome',
        email: 'test@example.com',
        senha: 'SenhaSegura123!',
        cpf: '123.456.789-00',
        crm: '12345',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { cpf: '123.456.789-00' } });
    });

    it('deve verificar unicidade de CRM por último', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null) // cpf check
        .mockResolvedValueOnce(null); // crm check
      userRepository.create.mockImplementation((u: any) => ({ ...u }));
      userRepository.save.mockResolvedValue({});

      await service.create({
        nome: 'Nome',
        email: 'test@example.com',
        senha: 'SenhaSegura123!',
        cpf: '123.456.789-00',
        crm: '12345',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { crm: '12345' } });
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários sem senha', async () => {
      const mockUsers = [
        {
          id: 'uuid-1',
          name: 'Usuário 1',
          email: 'user1@example.com',
          cpf: '123.456.789-00',
          crm: '12345',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'Usuário 2',
          email: 'user2@example.com',
          cpf: '987.654.321-00',
          crm: '54321',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      userRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'cpf', 'crm', 'createdAt', 'updatedAt'],
      });
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('deve retornar usuário encontrado sem senha', async () => {
      const mockUser = {
        id: 'uuid-1',
        name: 'Usuário',
        email: 'user@example.com',
        cpf: '123.456.789-00',
        crm: '12345',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        select: ['id', 'name', 'email', 'cpf', 'crm', 'createdAt', 'updatedAt'],
      });
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('uuid-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('deve remover usuário com sucesso', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('uuid-1');

      expect(userRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve chamar delete mesmo se usuário não existir', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 });

      await service.remove('uuid-inexistente');

      expect(userRepository.delete).toHaveBeenCalledWith('uuid-inexistente');
    });
  });
});


