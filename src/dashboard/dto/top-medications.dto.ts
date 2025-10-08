import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para um medicamento no ranking dos mais prescritos.
 * Representa as informações estatísticas de um medicamento específico.
 */
export class TopMedicationDto {
  /**
   * Nome do medicamento.
   * 
   * @example "Paracetamol"
   */
  @ApiProperty({
    description: 'Nome do medicamento',
    example: 'Paracetamol',
  })
  medicationName: string;

  /**
   * Número total de prescrições deste medicamento.
   * 
   * @example 45
   */
  @ApiProperty({
    description: 'Número total de prescrições deste medicamento',
    example: 45,
  })
  prescriptionCount: number;

  /**
   * Percentual em relação ao total de prescrições.
   * Valor entre 0 e 100.
   * 
   * @example 12.5
   */
  @ApiProperty({
    description: 'Percentual em relação ao total de prescrições',
    example: 12.5,
    minimum: 0,
    maximum: 100,
  })
  percentage: number;
}

/**
 * DTO para a resposta do ranking dos medicamentos mais prescritos.
 * Contém a lista dos medicamentos mais prescritos e metadados estatísticos.
 */
export class TopMedicationsDto {
  /**
   * Lista dos medicamentos mais prescritos, ordenados por frequência.
   */
  @ApiProperty({
    description: 'Lista dos medicamentos mais prescritos, ordenados por frequência',
    type: [TopMedicationDto],
    example: [
      {
        medicationName: 'Paracetamol',
        prescriptionCount: 45,
        percentage: 12.5,
      },
      {
        medicationName: 'Ibuprofeno',
        prescriptionCount: 38,
        percentage: 10.6,
      },
      {
        medicationName: 'Amoxicilina',
        prescriptionCount: 32,
        percentage: 8.9,
      },
    ],
  })
  medications: TopMedicationDto[];

  /**
   * Número total de prescrições de medicamentos consideradas.
   * 
   * @example 360
   */
  @ApiProperty({
    description: 'Número total de prescrições de medicamentos consideradas',
    example: 360,
  })
  totalPrescriptions: number;

  /**
   * Período analisado para gerar o ranking.
   * 
   * @example "Últimos 6 meses"
   */
  @ApiProperty({
    description: 'Período analisado para gerar o ranking',
    example: 'Últimos 6 meses',
  })
  period: string;

  /**
   * Data e hora da geração do relatório.
   * 
   * @example "2024-01-15T10:30:00Z"
   */
  @ApiProperty({
    description: 'Data e hora da geração do relatório',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt: string;
}