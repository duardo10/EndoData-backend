import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({ 
    description: 'Nome completo do usuário',
    example: 'João Silva'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'CRM do médico (4-10 dígitos)',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4,10}$/,{ message: 'CRM deve conter apenas números e ter entre 4 e 10 dígitos.' })
  crm: string;

  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@exemplo.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Senha do usuário (mín. 8 caracteres, maiúscula, minúscula, número e caractere especial)',
    example: 'MinhaSenh@123'
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.'
  })
  password: string;

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