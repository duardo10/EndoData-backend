import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para comparação de receita mensal vs anterior.
 * Contém informações comparativas entre o mês atual e o mês anterior,
 * incluindo valores absolutos, diferenças e percentuais de crescimento.
 */
export class MonthlyRevenueComparisonDto {
  /**
   * Receita total do mês atual.
   * 
   * @example 15750.50
   */
  @ApiProperty({
    description: 'Receita total do mês atual em reais',
    example: 15750.50,
    type: 'number',
    minimum: 0,
  })
  currentMonthRevenue: number;

  /**
   * Receita total do mês anterior.
   * 
   * @example 12450.00
   */
  @ApiProperty({
    description: 'Receita total do mês anterior em reais',
    example: 12450.00,
    type: 'number',
    minimum: 0,
  })
  previousMonthRevenue: number;

  /**
   * Diferença absoluta entre mês atual e anterior.
   * Valor positivo indica crescimento, negativo indica queda.
   * 
   * @example 3300.50
   */
  @ApiProperty({
    description: 'Diferença absoluta entre mês atual e anterior (positivo = crescimento, negativo = queda)',
    example: 3300.50,
    type: 'number',
  })
  absoluteDifference: number;

  /**
   * Percentual de crescimento ou queda em relação ao mês anterior.
   * Valor positivo indica crescimento, negativo indica queda.
   * Null quando não há receita no mês anterior para comparação.
   * 
   * @example 26.5
   */
  @ApiProperty({
    description: 'Percentual de crescimento/queda em relação ao mês anterior (null se sem base de comparação)',
    example: 26.5,
    type: 'number',
    nullable: true,
  })
  percentageChange: number | null;

  /**
   * Descrição textual da tendência (crescimento, queda, estável).
   * 
   * @example "Crescimento"
   */
  @ApiProperty({
    description: 'Descrição textual da tendência',
    example: 'Crescimento',
    enum: ['Crescimento', 'Queda', 'Estável', 'Sem comparação'],
  })
  trend: 'Crescimento' | 'Queda' | 'Estável' | 'Sem comparação';

  /**
   * Nome do mês atual para exibição.
   * 
   * @example "Outubro 2025"
   */
  @ApiProperty({
    description: 'Nome do mês atual para exibição',
    example: 'Outubro 2025',
  })
  currentMonthName: string;

  /**
   * Nome do mês anterior para exibição.
   * 
   * @example "Setembro 2025"
   */
  @ApiProperty({
    description: 'Nome do mês anterior para exibição',
    example: 'Setembro 2025',
  })
  previousMonthName: string;

  /**
   * Número de receitas emitidas no mês atual.
   * 
   * @example 87
   */
  @ApiProperty({
    description: 'Número de receitas emitidas no mês atual',
    example: 87,
    type: 'number',
    minimum: 0,
  })
  currentMonthReceiptCount: number;

  /**
   * Número de receitas emitidas no mês anterior.
   * 
   * @example 69
   */
  @ApiProperty({
    description: 'Número de receitas emitidas no mês anterior',
    example: 69,
    type: 'number',
    minimum: 0,
  })
  previousMonthReceiptCount: number;

  /**
   * Valor médio por receita no mês atual.
   * 
   * @example 181.04
   */
  @ApiProperty({
    description: 'Valor médio por receita no mês atual',
    example: 181.04,
    type: 'number',
    minimum: 0,
  })
  currentMonthAverageReceipt: number;

  /**
   * Valor médio por receita no mês anterior.
   * 
   * @example 180.43
   */
  @ApiProperty({
    description: 'Valor médio por receita no mês anterior',
    example: 180.43,
    type: 'number',
    minimum: 0,
  })
  previousMonthAverageReceipt: number;

  /**
   * Data e hora da geração do relatório.
   * 
   * @example "2025-10-01T10:30:00Z"
   */
  @ApiProperty({
    description: 'Data e hora da geração do relatório',
    example: '2025-10-01T10:30:00Z',
  })
  generatedAt: string;
}