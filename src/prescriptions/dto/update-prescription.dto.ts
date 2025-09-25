import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescriptionDto } from './create-prescription.dto';

/**
 * DTO para atualização completa de uma prescrição.
 * 
 * Herda de CreatePrescriptionDto tornando todos os campos opcionais.
 * Permite atualização parcial ou completa da prescrição.
 * 
 * @class UpdatePrescriptionDto
 * @extends PartialType<CreatePrescriptionDto>
 */
export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}