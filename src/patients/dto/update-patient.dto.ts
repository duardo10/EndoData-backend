import { IsEmail, IsEnum, IsOptional, IsString, IsDateString, Length, Matches, IsUUID } from 'class-validator';
import { IsCpf } from '../../common/decorators/is-cpf.decorator';
import { BloodType, PatientGender } from '../entities/patient.entity';

/**
 * DTO para atualização parcial de pacientes.
 * Permite atualizar um ou mais campos do paciente de forma flexível.
 */
export class UpdatePatientDto {
  /**
   * Nome completo do paciente.
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * CPF do paciente (opcional, validado).
   */
  @IsOptional()
  @IsString()
  @IsCpf({ message: 'CPF inválido' })
  cpf?: string;

  /**
   * Data de nascimento do paciente (formato ISO).
   */
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  /**
   * Gênero do paciente (enum: MASCULINO, FEMININO, OUTRO).
   */
  @IsOptional()
  @IsEnum(PatientGender)
  gender?: PatientGender;

  /**
   * E-mail do paciente.
   */
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * Telefone do paciente (com DDI/DDDs, 10-15 dígitos).
   */
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{10,15}$/, { message: 'Telefone deve conter apenas dígitos, com DDI/DDDs, e ter 10-15 dígitos.' })
  phone?: string;

  /**
   * Bairro de residência do paciente.
   */
  @IsOptional()
  @IsString()
  neighborhood?: string;

  /**
   * Cidade de residência do paciente.
   */
  @IsOptional()
  @IsString()
  city?: string;

  /**
   * Estado de residência do paciente (sigla com 2 letras maiúsculas).
   */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Estado deve ser a sigla com 2 letras maiúsculas (ex: SP, RJ).' })
  state?: string;

  /**
   * Peso do paciente (número com até 2 casas decimais).
   */
  @IsOptional()
  @Matches(/^\d{1,3}(\.\d{1,2})?$/, { message: 'Peso deve ser número com até 2 casas decimais.' })
  weight?: string;

  /**
   * Altura do paciente (número com até 1 casa decimal).
   */
  @IsOptional()
  @Matches(/^\d{1,3}(\.\d)?$/, { message: 'Altura deve ser número com até 1 casa decimal.' })
  height?: string;

  /**
   * Tipo sanguíneo do paciente (enum: A+, A-, B+, B-, AB+, AB-, O+, O-).
   */
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  /**
   * Histórico médico do paciente.
   */
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  /**
   * Alergias do paciente.
   */
  @IsOptional()
  @IsString()
  allergies?: string;

  /**
   * ID do usuário/médico responsável (UUID).
   */
  @IsOptional()
  @IsUUID()
  userId?: string;
}


