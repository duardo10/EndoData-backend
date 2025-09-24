import { IsEnum } from 'class-validator';
import { PrescriptionStatus } from '../entities/prescription.entity';

/**
 * DTO para atualização do status de uma prescrição.
 * 
 * Usado especificamente para o endpoint PATCH que altera apenas o status.
 * 
 * @class UpdatePrescriptionStatusDto
 */
export class UpdatePrescriptionStatusDto {
  /**
   * Novo status da prescrição.
   * Deve ser um dos valores válidos do enum PrescriptionStatus.
   * 
   * @type {PrescriptionStatus}
   * @required
   * @enum DRAFT, ACTIVE, SUSPENDED, COMPLETED
   * @example "active"
   */
  @IsEnum(PrescriptionStatus)
  status: PrescriptionStatus;
}