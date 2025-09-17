import { IsEmail, IsEnum, IsOptional, IsString, IsDateString, Length, Matches, IsUUID } from 'class-validator';
import { IsCpf } from '../../common/decorators/is-cpf.decorator';
import { BloodType, PatientGender } from '../entities/patient.entity';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsCpf({ message: 'CPF inválido' })
  cpf?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(PatientGender)
  gender?: PatientGender;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{10,15}$/,{ message: 'Telefone deve conter apenas dígitos, com DDI/DDDs, e ter 10-15 dígitos.' })
  phone?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Estado deve ser a sigla com 2 letras maiúsculas (ex: SP, RJ).' })
  state?: string;

  @IsOptional()
  @Matches(/^\d{1,3}(\.\d{1,2})?$/,{ message: 'Peso deve ser número com até 2 casas decimais.' })
  weight?: string;

  @IsOptional()
  @Matches(/^\d{1,3}(\.\d)?$/,{ message: 'Altura deve ser número com até 1 casa decimal.' })
  height?: string;

  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}


