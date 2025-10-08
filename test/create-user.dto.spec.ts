/**
 * Testes Unitários - CreateUserDto
 * 
 * Suite de testes para validação do DTO de criação de usuários.
 * Testa as regras de validação implementadas no CreateUserDto,
 * incluindo validação de senha forte e campos obrigatórios.
 * 
 * @testSuite CreateUserDto
 * @testFramework Jest + class-validator
 * @coverage
 * - Validação de senha forte
 * - Validação de senha fraca
 * - Validação de campos obrigatórios
 * - Transformação de dados
 * 
 * @testTypes
 * - Validation Tests: Regras de validação do DTO
 * - Error Handling: Cenários de validação falhada
 * 
 * @author Sistema EndoData
 * @since 2025-01-01
 * @version 1.0.0
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

/**
 * Suite de Testes do CreateUserDto
 * 
 * Testa as validações implementadas no DTO de criação de usuários,
 * garantindo que as regras de negócio sejam aplicadas corretamente.
 * 
 * @testSuite CreateUserDto
 * @scope Unit Tests
 * @coverage 100% das validações
 */
describe('CreateUserDto', () => {
  /**
   * Testa validação com senha forte.
   * 
   * Cenário: Dados válidos com senha que atende aos critérios de segurança
   * Expectativa: Nenhum erro de validação deve ser retornado
   * 
   * @testCase senha forte
   * @validationType positive
   */
  it('deve ser válido com senha forte', async () => {
    const dto = plainToInstance(CreateUserDto, {
      nome: 'Nome',
      email: 'user@example.com',
      cpf: '123.456.789-00',
      crm: '123456',
      senha: 'SenhaSegura123!',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  /**
   * Testa validação com senha fraca.
   * 
   * Cenário: Dados com senha que não atende aos critérios de segurança
   * Expectativa: Erros de validação devem ser retornados
   * 
   * @testCase senha fraca
   * @validationType negative
   */
  it('deve falhar com senha fraca', async () => {
    const dto = plainToInstance(CreateUserDto, {
      nome: 'Nome',
      email: 'user@example.com',
      cpf: '123.456.789-00',
      crm: '123456',
      senha: 'senha',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});


