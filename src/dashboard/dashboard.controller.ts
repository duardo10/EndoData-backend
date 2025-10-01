import { Controller, Get, Query, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { DashboardCacheInterceptor } from './interceptors/dashboard-cache.interceptor';
import { DashboardService } from './dashboard.service';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { WeeklyPatientsChartDto } from './dto/weekly-patients-chart.dto';
import { TopMedicationsDto } from './dto/top-medications.dto';
import { MonthlyRevenueComparisonDto } from './dto/monthly-revenue-comparison.dto';

/**
 * Controller do Dashboard.
 *
 * Responsável por expor endpoints de leitura com estatísticas agregadas
 * para a tela inicial do sistema. Todos os endpoints aqui definidos são
 * protegidos pelo guard JWT global e assumem que o contexto do usuário
 * autenticado representa um médico que possui pacientes cadastrados.
 *
 * Performance e Cache:
 * - Configurado com cache de 1 hora (3600 segundos) para otimizar performance
 * - As respostas são automaticamente cacheadas baseadas na URL e usuário
 * - Ideal para dados estatísticos que não mudam frequentemente
 *
 * Convenções e garantias:
 * - Requisições devem incluir cabeçalho `Authorization: Bearer <token>`.
 * - A identidade do usuário é extraída via decorator `CurrentUser`.
 * - Nenhum dado sensível de pacientes é retornado pelos endpoints; apenas
 *   contagens agregadas e estatísticas simples.
 * - Cache considera o ID do usuário para isolamento de dados.
 */
@ApiTags('dashboard')
@ApiBearerAuth('bearer')
@UseInterceptors(DashboardCacheInterceptor)
@Controller('dashboard')
export class DashboardController {
  /**
   * Construtor do controlador de dashboard.
   *
   * @param dashboardService Serviço que calcula estatísticas agregadas
   */
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Retorna estatísticas básicas do sistema para o médico autenticado.
   *
   * As estatísticas incluem:
   * - totalPatients: total de pacientes associados ao médico
   * - patientsRegisteredToday: novos pacientes criados no dia atual (00:00–23:59)
   * - patientsRegisteredThisWeek: novos pacientes criados na semana corrente
   *   (de segunda-feira 00:00 até domingo 23:59)
   *
   * Regras de negócio:
   * - As contagens consideram apenas pacientes cujo campo `user.id` corresponde
   *   ao médico autenticado.
   * - A definição de semana segue padrão local: segunda a domingo.
   *
   * @param user Usuário autenticado extraído do token JWT
   * @returns Objeto com estatísticas agregadas do dashboard
   *
   * @example
   * // Requisição
   * GET /api/dashboard/summary
   * Authorization: Bearer <token>
   *
   * // Resposta (200)
   * {
   *   "totalPatients": 42,
   *   "patientsRegisteredToday": 3,
   *   "patientsRegisteredThisWeek": 11
   * }
   */
  @Get('summary')
  @ApiOperation({ summary: 'Obter estatísticas básicas do dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getSummary(@CurrentUser() user: CurrentUserData) {
    return this.dashboardService.getSummary(user.id);
  }

  /**
   * Retorna métricas avançadas do dashboard incluindo estatísticas financeiras.
   *
   * As métricas incluem todas as informações básicas do summary, além de:
   * - monthlyRevenue: receita total do mês atual (soma dos recibos)
   * - activePrescriptions: número de prescrições com status ativo
   * - monthlyReceipts: número de recibos emitidos no mês
   * - averageReceiptValue: valor médio dos recibos do mês
   *
   * Regras de negócio:
   * - Receita considera apenas recibos do médico autenticado
   * - Mês atual: do dia 1º às 23:59 do último dia do mês
   * - Prescrições ativas: status = 'active'
   * - Valor médio calculado como receita total / número de recibos
   *
   * @param user Usuário autenticado extraído do token JWT
   * @returns Objeto com métricas avançadas do dashboard
   *
   * @example
   * // Requisição
   * GET /api/dashboard/metrics
   * Authorization: Bearer <token>
   *
   * // Resposta (200)
   * {
   *   "totalPatients": 42,
   *   "patientsRegisteredToday": 3,
   *   "patientsRegisteredThisWeek": 11,
   *   "monthlyRevenue": 15500.75,
   *   "activePrescriptions": 28,
   *   "monthlyReceipts": 156,
   *   "averageReceiptValue": 99.36
   * }
   */
  @Get('metrics')
  @ApiOperation({ 
    summary: 'Obter métricas avançadas do dashboard',
    description: 'Retorna estatísticas completas incluindo receitas financeiras e prescrições ativas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas avançadas retornadas com sucesso.',
    type: DashboardMetricsDto
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getMetrics(@CurrentUser() user: CurrentUserData): Promise<DashboardMetricsDto> {
    return this.dashboardService.getAdvancedMetrics(user.id);
  }

  /**
   * Retorna dados para gráfico de novos pacientes por semana.
   *
   * Obtém dados das últimas N semanas mostrando o número de novos
   * pacientes registrados em cada período. Útil para visualizar tendências
   * de crescimento da base de pacientes e identificar padrões sazonais.
   *
   * Parâmetros:
   * - weeks: número de semanas a incluir (padrão: 8, máximo: 52)
   *
   * Características dos dados:
   * - Semanas definidas como segunda-feira 00:00 até domingo 23:59
   * - Dados ordenados cronologicamente (mais antigos primeiro)
   * - Inclui semanas com zero pacientes para continuidade
   * - Filtra apenas pacientes do médico autenticado
   * - Formato de data consistente (YYYY-MM-DD)
   *
   * @param user Usuário autenticado extraído do token JWT
   * @param weeks Número de semanas a incluir no gráfico
   * @returns Dados formatados para gráfico de linha/barras
   *
   * @example
   * // Requisição
   * GET /api/dashboard/weekly-patients?weeks=12
   * Authorization: Bearer <token>
   *
   * // Resposta (200)
   * {
   *   "data": [
   *     {
   *       "weekStart": "2025-08-19",
   *       "weekEnd": "2025-08-25",
   *       "newPatients": 3,
   *       "weekLabel": "19/08 - 25/08"
   *     },
   *     // ... mais semanas
   *   ],
   *   "totalWeeks": 12,
   *   "generatedAt": "2025-10-01T14:30:00.000Z"
   * }
   */
  @Get('weekly-patients')
  @ApiOperation({ 
    summary: 'Obter dados do gráfico de novos pacientes por semana',
    description: 'Retorna dados das últimas N semanas para visualização em gráfico de tendência'
  })
  @ApiQuery({
    name: 'weeks',
    required: false,
    type: 'number',
    description: 'Número de semanas a incluir (padrão: 8, máximo: 52)',
    example: 8,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados do gráfico retornados com sucesso.',
    type: WeeklyPatientsChartDto
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 400, description: 'Parâmetro weeks inválido.' })
  async getWeeklyPatientsChart(
    @CurrentUser() user: CurrentUserData,
    @Query('weeks') weeks?: string,
  ): Promise<WeeklyPatientsChartDto> {
    // Validar e limitar o parâmetro weeks
    let weeksCount = 8; // padrão
    if (weeks) {
      const parsed = parseInt(weeks, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 52) {
        throw new BadRequestException('Parâmetro weeks deve ser um número entre 1 e 52');
      }
      weeksCount = parsed;
    }

    return this.dashboardService.getWeeklyPatientsChart(user.id, weeksCount);
  }

  /**
   * Retorna o ranking dos medicamentos mais prescritos pelo médico.
   *
   * Analisa todas as prescrições de medicamentos do médico autenticado
   * e retorna os medicamentos mais frequentemente prescritos, ordenados
   * por número de prescrições de forma decrescente.
   *
   * O endpoint permite especificar:
   * - limit: quantos medicamentos incluir no ranking (padrão: 10)
   * - period: período em meses para análise (padrão: 6 meses)
   *
   * Dados retornados para cada medicamento:
   * - Nome do medicamento
   * - Número total de prescrições
   * - Percentual em relação ao total
   *
   * @param user Usuário autenticado extraído do token JWT
   * @param limit Número máximo de medicamentos a retornar (1-50, padrão: 10)
   * @param period Período em meses para análise (1-24, padrão: 6)
   * @returns Ranking dos medicamentos mais prescritos
   *
   * @example
   * GET /dashboard/top-medications?limit=15&period=12
   * Retorna os 15 medicamentos mais prescritos nos últimos 12 meses
   */
  @Get('top-medications')
  @ApiOperation({ 
    summary: 'Ranking dos medicamentos mais prescritos',
    description: 'Retorna os medicamentos mais frequentemente prescritos pelo médico no período especificado'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de medicamentos a retornar (1-50)',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Período em meses para análise (1-24)',
    type: Number,
    example: 6,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking dos medicamentos retornado com sucesso.',
    type: TopMedicationsDto
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 400, description: 'Parâmetros limit ou period inválidos.' })
  async getTopMedications(
    @CurrentUser() user: CurrentUserData,
    @Query('limit') limit?: string,
    @Query('period') period?: string,
  ): Promise<TopMedicationsDto> {
    // Validar e limitar o parâmetro limit
    let limitCount = 10; // padrão
    if (limit) {
      const parsed = parseInt(limit, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 50) {
        throw new BadRequestException('Parâmetro limit deve ser um número entre 1 e 50');
      }
      limitCount = parsed;
    }

    // Validar e limitar o parâmetro period
    let periodMonths = 6; // padrão
    if (period) {
      const parsed = parseInt(period, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 24) {
        throw new BadRequestException('Parâmetro period deve ser um número entre 1 e 24');
      }
      periodMonths = parsed;
    }

    return this.dashboardService.getTopMedications(user.id, limitCount, periodMonths);
  }

  /**
   * Compara a receita do mês atual com a do mês anterior.
   *
   * Retorna uma análise comparativa detalhada entre a receita gerada
   * no mês corrente versus o mês anterior, incluindo:
   *
   * Valores absolutos:
   * - Receita total de cada mês
   * - Número de receitas emitidas
   * - Valor médio por receita
   *
   * Análise comparativa:
   * - Diferença absoluta em reais
   * - Percentual de crescimento ou queda
   * - Classificação da tendência (crescimento/queda/estável)
   *
   * Útil para acompanhar a evolução financeira da prática médica
   * e identificar tendências de crescimento ou necessidade de ações
   * para aumentar a receita.
   *
   * @param user Usuário autenticado extraído do token JWT
   * @returns Comparação detalhada entre receita atual e anterior
   *
   * @example
   * GET /dashboard/monthly-revenue-comparison
   * Retorna comparação entre outubro 2025 e setembro 2025
   */
  @Get('monthly-revenue-comparison')
  @ApiOperation({ 
    summary: 'Comparação de receita mensal vs anterior',
    description: 'Compara a receita do mês atual com a do mês anterior, mostrando diferenças absolutas e percentuais'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Comparação de receita retornada com sucesso.',
    type: MonthlyRevenueComparisonDto
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getMonthlyRevenueComparison(
    @CurrentUser() user: CurrentUserData,
  ): Promise<MonthlyRevenueComparisonDto> {
    return this.dashboardService.getMonthlyRevenueComparison(user.id);
  }
}


