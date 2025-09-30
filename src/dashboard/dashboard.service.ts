import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';

/**
 * Estrutura de retorno com estatísticas agregadas do dashboard.
 *
 * - totalPatients: Quantidade total de pacientes do médico
 * - patientsRegisteredToday: Quantos pacientes foram cadastrados hoje
 * - patientsRegisteredThisWeek: Quantos pacientes foram cadastrados na semana corrente
 */
export interface DashboardSummary {
  totalPatients: number;
  patientsRegisteredToday: number;
  patientsRegisteredThisWeek: number;
}

/**
 * Serviço do Dashboard.
 *
 * Responsável por calcular estatísticas agregadas de pacientes para a tela
 * inicial. Este serviço não retorna dados sensíveis; apenas contagens e
 * valores agregados baseados em períodos de tempo.
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
  ) {}

  /**
   * Calcula estatísticas básicas do dashboard para um médico.
   *
   * Períodos considerados:
   * - Hoje: entre 00:00:00 e 23:59:59 do dia corrente (fuso do servidor)
   * - Semana atual: segunda-feira 00:00:00 até domingo 23:59:59
   *
   * Observações de implementação:
   * - Usa `Between` do TypeORM para realizar filtros por intervalo de datas.
   * - As consultas são executadas em paralelo via `Promise.all` para melhor desempenho.
   * - Filtra exclusivamente por `user.id` correspondente ao médico autenticado.
   *
   * @param userId ID do médico autenticado
   * @returns Estatísticas de pacientes agregadas por período
   *
   * @example
   * const summary = await dashboardService.getSummary('user-uuid');
   * console.log(summary.totalPatients);
   */
  async getSummary(userId: string): Promise<DashboardSummary> {
    const now = new Date();

    // Início e fim do dia atual
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Início e fim da semana (segunda-feira a domingo)
    const day = now.getDay(); // 0=Domingo, 1=Segunda, ...
    const diffToMonday = (day === 0 ? -6 : 1) - day; // Ajusta para segunda
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [totalPatients, patientsToday, patientsThisWeek] = await Promise.all([
      this.patientsRepository.count({ where: { user: { id: userId } } }),
      this.patientsRepository.count({
        where: {
          user: { id: userId },
          createdAt: Between(startOfToday, endOfToday),
        },
      }),
      this.patientsRepository.count({
        where: {
          user: { id: userId },
          createdAt: Between(startOfWeek, endOfWeek),
        },
      }),
    ]);

    return {
      totalPatients,
      patientsRegisteredToday: patientsToday,
      patientsRegisteredThisWeek: patientsThisWeek,
    };
  }
}


