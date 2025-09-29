/**
 * @file Define o DTO para a criação de um item de recibo.
 */

import { IsString, IsNumber, IsPositive, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para a criação de um item de recibo.
 * Usado como um DTO aninhado em CreateReceiptDto.
 * @class
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