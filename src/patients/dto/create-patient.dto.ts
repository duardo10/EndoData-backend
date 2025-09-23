import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, Length, Matches, IsUUID } from 'class-validator';
import { IsCpf } from '../../common/decorators/is-cpf.decorator';
import { BloodType, PatientGender } from '../entities/patient.entity';

/**
 * DTO para criação de pacientes.
 * Define e valida todos os campos necessários para cadastrar um novo paciente no sistema.
 */
export class CreatePatientDto {
  /**
   * Nome completo do paciente.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * CPF do paciente (obrigatório e validado).
   */
  @IsString()
  @IsNotEmpty()
  @IsCpf({ message: 'CPF inválido' })
  cpf: string;

  /**
   * Data de nascimento do paciente (formato ISO).
   */
  @IsDateString()
  birthDate: string;

  /**
   * Gênero do paciente (enum: MASCULINO, FEMININO, OUTRO).
   */
  @IsEnum(PatientGender)
  gender: PatientGender;

  /**
   * E-mail do paciente (opcional).
   */
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * Telefone do paciente (opcional, com DDI/DDDs, 10-15 dígitos).
   */
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{10,15}$/, { message: 'Telefone deve conter apenas dígitos, com DDI/DDDs, e ter 10-15 dígitos.' })
  phone?: string;

  /**
   * Bairro de residência do paciente (opcional).
   */
  @IsOptional()
  @IsString()
  neighborhood?: string;

  /**
   * Cidade de residência do paciente (opcional).
   */
  @IsOptional()
  @IsString()
  city?: string;

  /**
   * Estado de residência do paciente (opcional, sigla com 2 letras maiúsculas).
   */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Estado deve ser a sigla com 2 letras maiúsculas (ex: SP, RJ).' })
  state?: string;

  /**
   * Peso do paciente (opcional, número com até 2 casas decimais).
   */
  @IsOptional()
  @Matches(/^\d{1,3}(\.\d{1,2})?$/, { message: 'Peso deve ser número com até 2 casas decimais.' })
  weight?: string;

  /**
   * Altura do paciente (opcional, número com até 1 casa decimal).
   */
  @IsOptional()
  @Matches(/^\d{1,3}(\.\d)?$/, { message: 'Altura deve ser número com até 1 casa decimal.' })
  height?: string;

  /**
   * Tipo sanguíneo do paciente (opcional, enum: A+, A-, B+, B-, AB+, AB-, O+, O-).
   */
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  /**
   * Histórico médico do paciente (opcional).
   */
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  /**
   * Alergias do paciente (opcional).
   */
  @IsOptional()
  @IsString()
  allergies?: string;

  /**
   * ID do usuário/médico responsável pelo paciente (obrigatório, UUID).
   */
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}


