import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para métricas avançadas do dashboard.
 * 
 * Contém estatísticas agregadas sobre pacientes, receitas financeiras
 * e prescrições ativas do médico autenticado. Utilizado para fornecer
 * uma visão geral rápida da atividade clínica e financeira.
 */
export class DashboardMetricsDto {
  /**
   * Número total de pacientes cadastrados pelo médico.
   * @type {number}
   */
  @ApiProperty({
    description: 'Total de pacientes cadastrados',
    example: 42,
    type: 'number',
  })
  totalPatients: number;

  /**
   * Número de pacientes registrados no dia atual.
   * @type {number}
   */
  @ApiProperty({
    description: 'Pacientes registrados hoje',
    example: 3,
    type: 'number',
  })
  patientsRegisteredToday: number;

  /**
   * Número de pacientes registrados na semana atual.
   * @type {number}
   */
  @ApiProperty({
    description: 'Pacientes registrados nesta semana',
    example: 11,
    type: 'number',
  })
  patientsRegisteredThisWeek: number;

  /**
   * Valor total das receitas (recibos) do mês atual.
   * Soma dos valores de todos os recibos criados no mês corrente.
   * @type {number}
   */
  @ApiProperty({
    description: 'Receita total do mês atual em reais',
    example: 15500.75,
    type: 'number',
  })
  monthlyRevenue: number;

  /**
   * Número de prescrições com status ativo.
   * Prescrições que estão em uso pelos pacientes.
   * @type {number}
   */
  @ApiProperty({
    description: 'Número de prescrições ativas',
    example: 28,
    type: 'number',
  })
  activePrescriptions: number;

  /**
   * Número total de recibos emitidos no mês atual.
   * @type {number}
   */
  @ApiProperty({
    description: 'Total de recibos emitidos no mês',
    example: 156,
    type: 'number',
  })
  monthlyReceipts: number;

  /**
   * Valor médio dos recibos do mês atual.
   * Calculado como receita total / número de recibos.
   * @type {number}
   */
  @ApiProperty({
    description: 'Valor médio dos recibos do mês',
    example: 99.36,
    type: 'number',
  })
  averageReceiptValue: number;
}