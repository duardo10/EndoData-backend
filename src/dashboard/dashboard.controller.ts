import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

/**
 * Controller do Dashboard.
 *
 * Responsável por expor endpoints de leitura com estatísticas agregadas
 * para a tela inicial do sistema. Todos os endpoints aqui definidos são
 * protegidos pelo guard JWT global e assumem que o contexto do usuário
 * autenticado representa um médico que possui pacientes cadastrados.
 *
 * Convenções e garantias:
 * - Requisições devem incluir cabeçalho `Authorization: Bearer <token>`.
 * - A identidade do usuário é extraída via decorator `CurrentUser`.
 * - Nenhum dado sensível de pacientes é retornado pelos endpoints; apenas
 *   contagens agregadas e estatísticas simples.
 */
@ApiTags('dashboard')
@ApiBearerAuth('bearer')
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
}


