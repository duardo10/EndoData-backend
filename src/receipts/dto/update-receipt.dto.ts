/**
 * DTO para atualização de recibos
 * 
 * Permite atualização completa ou parcial dos dados do recibo,
 * incluindo status, itens e informações do paciente.
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateReceiptDto } from './create-receipt.dto';

/**
 * DTO para atualização completa de um recibo.
 * 
 * Herda de CreateReceiptDto tornando todos os campos opcionais.
 * Permite atualização parcial ou completa do recibo.
 * 
 * @class UpdateReceiptDto
 * @extends PartialType<CreateReceiptDto>
 */
export class UpdateReceiptDto extends PartialType(CreateReceiptDto) {}