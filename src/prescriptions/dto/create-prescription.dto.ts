import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PrescriptionStatus } from '../entities/prescription.entity';

/**
 * DTO para criação de um medicamento dentro de uma prescrição.
 * 
 * Contém as informações específicas de um medicamento prescrito,
 * incluindo nome, dosagem, frequência e duração do tratamento.
 * 
 * @class CreatePrescriptionMedicationDto
 */
export class CreatePrescriptionMedicationDto {
  /**
   * Nome do medicamento a ser prescrito.
   * Pode ser o nome comercial ou princípio ativo.
   * 
   * @type {string}
   * @required
   * @example "Paracetamol"
   */
  @IsString()
  @IsNotEmpty()
  medicationName: string;

  /**
   * Dosagem do medicamento.
   * Especifica a quantidade e unidade de medida.
   * 
   * @type {string}
   * @required
   * @example "500mg"
   */
  @IsString()
  @IsNotEmpty()
  dosage: string;

  /**
   * Frequência de administração do medicamento.
   * Define como e quando o medicamento deve ser tomado.
   * 
   * @type {string}
   * @required
   * @example "3x ao dia"
   */
  @IsString()
  @IsNotEmpty()
  frequency: string;

  /**
   * Duração do tratamento com este medicamento.
   * Especifica por quanto tempo o medicamento deve ser usado.
   * 
   * @type {string}
   * @required
   * @example "7 dias"
   */
  @IsString()
  @IsNotEmpty()
  duration: string;
}

/**
 * DTO para criação de uma nova prescrição médica.
 * 
 * Contém todas as informações necessárias para criar uma prescrição,
 * incluindo referências ao paciente e médico, status, observações
 * e lista de medicamentos prescritos.
 * 
 * @class CreatePrescriptionDto
 */
export class CreatePrescriptionDto {
  /**
   * Identificador único do paciente para quem a prescrição será emitida.
   * Deve ser um UUID válido de um paciente existente.
   * 
   * @type {string}
   * @required
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  /**
   * Identificador único do médico responsável pela prescrição.
   * Deve ser um UUID válido de um usuário/médico existente.
   * 
   * @type {string}
   * @required
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174001"
   */
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  /**
   * Status inicial da prescrição.
   * Define o estado da prescrição no momento da criação.
   * 
   * @type {PrescriptionStatus}
   * @required
   * @enum DRAFT, ACTIVE, SUSPENDED, COMPLETED
   * @example "active"
   */
  @IsEnum(PrescriptionStatus)
  status: PrescriptionStatus;

  /**
   * Observações adicionais sobre a prescrição.
   * Campo opcional para notas do médico sobre o tratamento.
   * 
   * @type {string}
   * @optional
   * @example "Tomar com alimentos para evitar irritação gástrica"
   */
  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * Lista de medicamentos a serem prescritos.
   * Array de objetos contendo as especificações de cada medicamento.
   * 
   * @type {CreatePrescriptionMedicationDto[]}
   * @required
   * @minItems 1
   * @example [{"medicationName": "Paracetamol", "dosage": "500mg", "frequency": "3x ao dia", "duration": "7 dias"}]
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionMedicationDto)
  medications: CreatePrescriptionMedicationDto[];
}


