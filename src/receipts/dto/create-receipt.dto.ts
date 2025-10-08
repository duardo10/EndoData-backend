/**
 * DTO para Criação de Recibo
 * 
 * Define a estrutura de dados necessária para criar um novo recibo médico.
 * Inclui validações automáticas e documentação Swagger para API.
 * 
 * @dto CreateReceiptDto
 * 
 * @validation
 * - patientId: UUID válido obrigatório
 * - items: Array de itens validado e aninhado
 * - status: Enum opcional com valor padrão
 * 
 * @swagger
 * - Documentação completa da API
 * - Exemplos de uso
 * - Tipos de dados especificados
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 */

import { IsUUID, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateReceiptItemDto } from './create-receipt-item.dto';
import { ReceiptStatus } from '../enums/receipt-status.enum';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de um novo recibo médico.
 * 
 * Usado no endpoint POST /receipts para criar recibos
 * com validação automática e transformação de dados.
 * 
 * @class CreateReceiptDto
 */
export class CreateReceiptDto {
  /**
   * O ID do paciente associado a este recibo.
   * @type {string}
   * @example 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
   */
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'O ID do paciente associado a este recibo.',
  })
  @IsUUID()
  patientId: string;

  /**
   * Os itens incluídos neste recibo.
   * @type {CreateReceiptItemDto[]}
   */
  @ApiProperty({ type: () => [CreateReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];

  /**
   * O status do recibo. O padrão é 'pending'.
   * @type {ReceiptStatus}
   * @example 'pending'
   */
  @ApiProperty({
    example: 'pending',
    description: "O status do recibo. O padrão é 'pending'.",
    enum: ReceiptStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReceiptStatus)
  status?: ReceiptStatus;
}