import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PrescriptionStatus } from '../entities/prescription.entity';

/**
 * DTO para filtros de busca de prescrições
 * 
 * @description Define os parâmetros opcionais para filtrar prescrições
 * na listagem do sistema
 */
export class FilterPrescriptionDto {
  /**
   * Filtrar por status da prescrição
   */
  @IsOptional()
  @IsEnum(PrescriptionStatus, { message: 'Status inválido' })
  status?: PrescriptionStatus;

  /**
   * Filtrar por ID do paciente
   */
  @IsOptional()
  @IsUUID('4', { message: 'ID do paciente deve ser um UUID válido' })
  patientId?: string;

  /**
   * Filtrar por ID do usuário/médico
   */
  @IsOptional()
  @IsUUID('4', { message: 'ID do usuário deve ser um UUID válido' })
  userId?: string;

  /**
   * Data inicial para filtro de período
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data inicial inválida' })
  startDate?: string;

  /**
   * Data final para filtro de período
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data final inválida' })
  endDate?: string;

  /**
   * Página para paginação
   */
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  /**
   * Limite de itens por página
   */
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
