[1mdiff --cc src/users/dto/create-user.dto.ts[m
[1mindex 384df1d,466ab0a..0000000[m
[1m--- a/src/users/dto/create-user.dto.ts[m
[1m+++ b/src/users/dto/create-user.dto.ts[m
[36m@@@ -1,66 -1,26 +1,74 @@@[m
[31m -import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';[m
[32m +import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsBoolean } from 'class-validator';[m
[32m +import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';[m
  [m
  export class CreateUserDto {[m
[32m +[m
[32m +  @ApiProperty({ [m
[32m +    description: 'Nome completo do usuário',[m
[32m +    example: 'João Silva'[m
[32m +  })[m
[31m-   @IsString()[m
[31m-   @IsNotEmpty()[m
[31m-   name: string;[m
[32m+   @IsString({ message: 'Nome deve ser uma string' })[m
[32m+   @IsNotEmpty({ message: 'Nome é obrigatório' })[m
[32m+   nome: string;[m
[32m+ [m
[32m++  @ApiProperty({ [m
[32m++    description: 'Email do usuário',[m
[32m++    example: 'joao@exemplo.com'[m
[32m++  })[m
[32m+   @IsEmail({}, { message: 'E-mail deve ter um formato válido' })[m
[32m+   @IsNotEmpty({ message: 'E-mail é obrigatório' })[m
[32m+   email: string;[m
[32m+ [m
[32m++  @ApiProperty({ [m
[32m++    description: 'CPF do usuário',[m
[32m++    example: '123.456.789-00'[m
[32m++  })[m
[32m+   @IsString({ message: 'CPF deve ser uma string' })[m
[32m+   @IsNotEmpty({ message: 'CPF é obrigatório' })[m
[32m+   cpf: string;[m
  [m
[32m +  @ApiProperty({ [m
[32m +    description: 'CRM do médico (4-10 dígitos)',[m
[32m +    example: '123456'[m
[32m +  })[m
[31m-   @IsString()[m
[31m-   @IsNotEmpty()[m
[32m+   @IsString({ message: 'CRM deve ser uma string' })[m
[32m+   @IsNotEmpty({ message: 'CRM é obrigatório' })[m
[32m +  @Matches(/^\d{4,10}$/,{ message: 'CRM deve conter apenas números e ter entre 4 e 10 dígitos.' })[m
    crm: string;[m
  [m
[31m-   @ApiProperty({ [m
[31m-     description: 'Email do usuário',[m
[31m-     example: 'joao@exemplo.com'[m
[31m-   })[m
[31m-   @IsEmail()[m
[31m-   @IsNotEmpty()[m
[31m-   email: string;[m
[31m- [m
[32m +  @ApiProperty({ [m
[32m +    description: 'Senha do usuário (mín. 8 caracteres, maiúscula, minúscula, número e caractere especial)',[m
[32m +    example: 'MinhaSenh@123'[m
[32m +  })[m
[31m-   @IsString()[m
[31m-   @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })[m
[31m-   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/, {[m
[31m-     message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.'[m
[32m+   @IsString({ message: 'Senha deve ser uma string' })[m
[32m+   @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })[m
[32m+   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {[m
[32m+     message: 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',[m
    })[m
[31m-   password: string;[m
[32m+   senha: string;[m
[32m +[m
[32m +  @ApiPropertyOptional({ [m
[32m +    description: 'Login do usuário (opcional)',[m
[32m +    example: 'joao.silva'[m
[32m +  })[m
[32m +  @IsString()[m
[32m +  @IsOptional()[m
[32m +  login?: string;[m
[32m +[m
[32m +  @ApiPropertyOptional({ [m
[32m +    description: 'Especialidade médica (opcional)',[m
[32m +    example: 'endocrinologia'[m
[32m +  })[m
[32m +  @IsString()[m
[32m +  @IsOptional()[m
[32m +  especialidade?: string;[m
[32m +[m
[32m +  @ApiPropertyOptional({ [m
[32m +    description: 'Se o usuário é administrador (opcional)',[m
[32m +    example: false,[m
[32m +    default: false[m
[32m +  })[m
[32m +  @IsBoolean()[m
[32m +  @IsOptional()[m
[32m +  isAdministrador?: boolean;[m
  }[m
