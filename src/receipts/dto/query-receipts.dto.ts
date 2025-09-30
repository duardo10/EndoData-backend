/**
 * DTO para filtros de consulta de recibos
 * 
 * Permite filtrar recibos por diferentes critérios como período,
 * status, paciente e outras opções de busca.
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 */

import { IsOptional, IsEnum, IsDateString, IsUUID, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ReceiptStatus } from '../enums/receipt-status.enum';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para filtros de consulta de recibos.
 * 
 * Usado para filtrar recibos por período, status, paciente
 * e outras opções de busca avançada.
 * 
 * @class QueryReceiptsDto
 */
export class QueryReceiptsDto {
  /**
   * Período para filtrar recibos.
   * Opções: 'day', 'week', 'month', 'year', 'custom'
   * 
   * @type {string}
   * @optional
   * @example "month"
   */
  @ApiProperty({
    example: 'month',
    description: 'Período para filtrar recibos',
    enum: ['day', 'week', 'month', 'year', 'custom'],
    required: false,
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year', 'custom'])
  period?: string;

  /**
   * Data de início para filtro personalizado.
   * Usar formato ISO 8601 (YYYY-MM-DD)
   * 
   * @type {string}
   * @optional
   * @example "2025-09-01"
   */
  @ApiProperty({
    example: '2025-09-01',
    description: 'Data de início para filtro personalizado (formato YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /**
   * Data de fim para filtro personalizado.
   * Usar formato ISO 8601 (YYYY-MM-DD)
   * 
   * @type {string}
   * @optional
   * @example "2025-09-30"
   */
  @ApiProperty({
    example: '2025-09-30',
    description: 'Data de fim para filtro personalizado (formato YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /**
   * Status do recibo para filtrar.
   * 
   * @type {ReceiptStatus}
   * @optional
   * @example "pending"
   */
  @ApiProperty({
    example: 'pending',
    description: 'Status do recibo para filtrar',
    enum: ReceiptStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReceiptStatus)
  status?: ReceiptStatus;

  /**
   * ID do paciente para filtrar recibos.
   * 
   * @type {string}
   * @optional
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do paciente para filtrar recibos',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  /**
   * Página para paginação.
   * 
   * @type {number}
   * @optional
   * @default 1
   */
  @ApiProperty({
    example: 1,
    description: 'Página para paginação',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  /**
   * Limite de resultados por página.
   * 
   * @type {number}
   * @optional
   * @default 10
   */
  @ApiProperty({
    example: 10,
    description: 'Limite de resultados por página',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}