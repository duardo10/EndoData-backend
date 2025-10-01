import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para dados de um ponto no gráfico de novos pacientes por semana.
 */
export class WeeklyPatientsDataPointDto {
  /**
   * Data de início da semana no formato ISO (YYYY-MM-DD).
   * Representa sempre uma segunda-feira.
   * @type {string}
   */
  @ApiProperty({
    description: 'Data de início da semana (segunda-feira)',
    example: '2025-09-23',
    type: 'string',
    format: 'date',
  })
  weekStart: string;

  /**
   * Data de fim da semana no formato ISO (YYYY-MM-DD).
   * Representa sempre um domingo.
   * @type {string}
   */
  @ApiProperty({
    description: 'Data de fim da semana (domingo)',
    example: '2025-09-29',
    type: 'string',
    format: 'date',
  })
  weekEnd: string;

  /**
   * Número de novos pacientes registrados nesta semana.
   * @type {number}
   */
  @ApiProperty({
    description: 'Número de novos pacientes na semana',
    example: 5,
    type: 'number',
  })
  newPatients: number;

  /**
   * Rótulo legível da semana para exibição no gráfico.
   * Formato: "DD/MM - DD/MM"
   * @type {string}
   */
  @ApiProperty({
    description: 'Rótulo da semana para exibição',
    example: '23/09 - 29/09',
    type: 'string',
  })
  weekLabel: string;
}

/**
 * DTO para resposta do gráfico de novos pacientes por semana.
 */
export class WeeklyPatientsChartDto {
  /**
   * Array de dados das últimas semanas ordenados cronologicamente.
   * @type {WeeklyPatientsDataPointDto[]}
   */
  @ApiProperty({
    description: 'Dados das últimas semanas',
    type: [WeeklyPatientsDataPointDto],
    isArray: true,
  })
  data: WeeklyPatientsDataPointDto[];

  /**
   * Número total de semanas incluídas no gráfico.
   * @type {number}
   */
  @ApiProperty({
    description: 'Número de semanas no gráfico',
    example: 8,
    type: 'number',
  })
  totalWeeks: number;

  /**
   * Data de geração dos dados.
   * @type {string}
   */
  @ApiProperty({
    description: 'Data e hora de geração dos dados',
    example: '2025-10-01T14:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  generatedAt: string;
}