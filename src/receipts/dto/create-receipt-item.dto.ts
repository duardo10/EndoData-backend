/**
 * DTO para Criação de Item de Recibo
 * 
 * Define a estrutura de dados para itens individuais dentro de um recibo.
 * Usado como DTO aninhado em CreateReceiptDto com validações específicas.
 * 
 * @dto CreateReceiptItemDto
 * 
 * @validation
 * - description: String obrigatória, mínimo 3 caracteres
 * - quantity: Número positivo obrigatório
 * - unitPrice: Número positivo obrigatório
 * 
 * @businessRules
 * - Descrição deve ser informativa e clara
 * - Quantidade deve ser inteira e positiva
 * - Preço unitário com precisão decimal
 * - Total calculado automaticamente no backend
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 */

import { IsString, IsNumber, IsPositive, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de um item individual de recibo.
 * 
 * Usado como DTO aninhado em CreateReceiptDto para definir
 * serviços ou produtos incluídos no recibo médico.
 * 
 * @class CreateReceiptItemDto
 */
export class CreateReceiptItemDto {
  /**
   * Uma descrição do item ou serviço.
   * @type {string}
   * @example 'Consulta Médica'
   */
  @ApiProperty({ example: 'Consulta Médica', description: 'Uma descrição do item ou serviço.' })
  @IsString()
  @MinLength(3)
  description: string;

  /**
   * A quantidade do item ou serviço.
   * @type {number}
   * @example 1
   */
  @ApiProperty({ example: 1, description: 'A quantidade do item ou serviço.' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  /**
   * O preço por unidade do item ou serviço.
   * @type {number}
   * @example 350.00
   */
  @ApiProperty({ example: 350.00, description: 'O preço por unidade do item ou serviço.' })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}