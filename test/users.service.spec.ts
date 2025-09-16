import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
    repo = moduleRef.get(getRepositoryToken(User));
  });

  it('deve criar usuário com sucesso e retornar sem senha', async () => {
    repo.findOne.mockResolvedValue(null);
    const saved: Partial<User> = {
      id: 'uuid-1',
      name: 'Nome do Usuário',
      email: 'usuario@exemplo.com',
      cpf: '123.456.789-00',
      crm: '12345',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repo.create.mockImplementation((u: any) => ({ ...u }));
    repo.save.mockResolvedValue(saved);

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
    repo.findOne.mockResolvedValue({ id: 'exists' });
    await expect(
      service.create({
        nome: 'Nome',
        email: 'ja@existe.com',
        senha: 'SenhaSegura123!',
      } as any),
    ).rejects.toThrow('E-mail já cadastrado');
  });
});


