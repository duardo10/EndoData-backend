import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({ 
    description: 'Nome completo do usuário',
    example: 'João Silva'
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@exemplo.com'
  })
  @IsEmail({}, { message: 'E-mail deve ter um formato válido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email: string;

  @ApiProperty({ 
    description: 'CPF do usuário',
    example: '123.456.789-00'
  })
  @IsString({ message: 'CPF deve ser uma string' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;

  @ApiProperty({ 
    description: 'CRM do médico (4-10 dígitos)',
    example: '123456'
  })
  @IsString({ message: 'CRM deve ser uma string' })
  @IsNotEmpty({ message: 'CRM é obrigatório' })
  // @Matches(/^[\d]{4,10}$/,{ message: 'CRM deve conter apenas números e ter entre 4 e 10 dígitos.' })
  crm: string;

  @ApiProperty({ 
    description: 'Senha do usuário (mín. 8 caracteres, maiúscula, minúscula, número e caractere especial)',
    example: 'MinhaSenh@123'
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
  //   message: 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
  // })
  senha: string;

  @ApiPropertyOptional({ 
    description: 'Login do usuário (opcional)',
    example: 'joao.silva'
  })
  @IsString()
  @IsOptional()
  login?: string;

  @ApiPropertyOptional({ 
    description: 'Especialidade médica (opcional)',
    example: 'endocrinologia'
  })
  @IsString()
  @IsOptional()
  especialidade?: string;

  @ApiPropertyOptional({ 
    description: 'Se o usuário é administrador (opcional)',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isAdministrador?: boolean;
}