import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

describe('CreateUserDto', () => {
  it('deve ser válido com senha forte', async () => {
    const dto = plainToInstance(CreateUserDto, {
      nome: 'Nome',
      email: 'user@example.com',
      senha: 'SenhaSegura123!',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar com senha fraca', async () => {
    const dto = plainToInstance(CreateUserDto, {
      nome: 'Nome',
      email: 'user@example.com',
      senha: 'senha',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});


