import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { Prescription, PrescriptionStatus } from '../prescriptions/entities/prescription.entity';
import { PrescriptionMedication } from '../prescriptions/entities/prescription-medication.entity';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { WeeklyPatientsChartDto, WeeklyPatientsDataPointDto } from './dto/weekly-patients-chart.dto';
import { TopMedicationsDto, TopMedicationDto } from './dto/top-medications.dto';
import { MonthlyRevenueComparisonDto } from './dto/monthly-revenue-comparison.dto';

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
    @InjectRepository(Receipt)
    private readonly receiptsRepository: Repository<Receipt>,
    @InjectRepository(Prescription)
    private readonly prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionMedication)
    private readonly prescriptionMedicationsRepository: Repository<PrescriptionMedication>,
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

  /**
   * Calcula métricas avançadas do dashboard incluindo receitas e prescrições.
   *
   * Métricas incluídas:
   * - Estatísticas de pacientes (total, hoje, semana)
   * - Receita do mês atual (soma dos valores dos recibos)
   * - Número de prescrições ativas
   * - Número de recibos do mês
   * - Valor médio dos recibos
   *
   * @param userId ID do médico autenticado
   * @returns Métricas completas do dashboard
   */
  async getAdvancedMetrics(userId: string): Promise<DashboardMetricsDto> {
    const now = new Date();

    // Períodos de tempo
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Início e fim do mês atual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Executar todas as consultas em paralelo
    const [
      totalPatients,
      patientsToday,
      patientsThisWeek,
      activePrescriptions,
      monthlyReceipts,
      monthlyRevenueData,
    ] = await Promise.all([
      // Estatísticas de pacientes
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
      // Prescrições ativas
      this.prescriptionsRepository.count({
        where: {
          user: { id: userId },
          status: PrescriptionStatus.ACTIVE,
        },
      }),
      // Recibos do mês (contagem)
      this.receiptsRepository.count({
        where: {
          userId: userId,
          date: Between(startOfMonth, endOfMonth),
        },
      }),
      // Receita do mês (soma dos valores)
      this.receiptsRepository
        .createQueryBuilder('receipt')
        .select('COUNT(receipt.id)', 'count')
        .addSelect('SUM(receipt.totalAmount)', 'sum')
        .where('receipt.userId = :userId', { userId })
        .andWhere('receipt.date BETWEEN :startOfMonth AND :endOfMonth', {
          startOfMonth,
          endOfMonth,
        })
        .andWhere('receipt.status = :status', { status: 'paid' })
        .getRawOne(),
    ]);

    // Calcular métricas derivadas
    const monthlyRevenue = Number(monthlyRevenueData?.sum || 0);
    const receiptCount = Number(monthlyRevenueData?.count || 0);
    const averageReceiptValue = receiptCount > 0 ? monthlyRevenue / receiptCount : 0;

    return {
      totalPatients,
      patientsRegisteredToday: patientsToday,
      patientsRegisteredThisWeek: patientsThisWeek,
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      activePrescriptions,
      monthlyReceipts,
      averageReceiptValue: Number(averageReceiptValue.toFixed(2)),
    };
  }

  /**
   * Obtém dados para gráfico de novos pacientes por semana.
   *
   * Retorna dados das últimas N semanas mostrando quantos pacientes
   * foram registrados em cada semana. Útil para visualizar tendências
   * de crescimento da base de pacientes.
   *
   * Regras de negócio:
   * - Semana definida como segunda-feira 00:00 até domingo 23:59
   * - Dados ordenados cronologicamente (mais antigos primeiro)
   * - Inclui semanas com zero pacientes para continuidade do gráfico
   * - Filtra apenas pacientes do médico autenticado
   *
   * @param userId ID do médico autenticado
   * @param weeksCount Número de semanas a incluir (padrão: 8)
   * @returns Dados formatados para gráfico
   *
   * @example
   * const chartData = await service.getWeeklyPatientsChart('user-id', 12);
   * // Retorna dados das últimas 12 semanas
   */
  async getWeeklyPatientsChart(
    userId: string,
    weeksCount: number = 8,
  ): Promise<WeeklyPatientsChartDto> {
    const now = new Date();
    const data: WeeklyPatientsDataPointDto[] = [];

    // Gerar dados para cada uma das últimas N semanas
    for (let i = weeksCount - 1; i >= 0; i--) {
      // Calcular início da semana (segunda-feira)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (7 * i));
      const day = weekStart.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      weekStart.setDate(weekStart.getDate() + diffToMonday);
      weekStart.setHours(0, 0, 0, 0);

      // Calcular fim da semana (domingo)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Consultar pacientes desta semana
      const newPatients = await this.patientsRepository.count({
        where: {
          user: { id: userId },
          createdAt: Between(weekStart, weekEnd),
        },
      });

      // Formatar datas para exibição
      const weekStartFormatted = weekStart.toISOString().split('T')[0];
      const weekEndFormatted = weekEnd.toISOString().split('T')[0];
      const weekLabel = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')} - ${weekEnd.getDate().toString().padStart(2, '0')}/${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}`;

      data.push({
        weekStart: weekStartFormatted,
        weekEnd: weekEndFormatted,
        newPatients,
        weekLabel,
      });
    }

    return {
      data,
      totalWeeks: weeksCount,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Obtém o ranking dos medicamentos mais prescritos.
   *
   * Analisa todas as prescrições de medicamentos no período especificado
   * e retorna os medicamentos mais frequentemente prescritos, com suas
   * contagens e percentuais relativos.
   *
   * @param userId - ID do médico/usuário logado
   * @param limit - Número máximo de medicamentos a retornar (padrão: 10)
   * @param periodInMonths - Período em meses para análise (padrão: 6)
   * @returns Ranking dos medicamentos mais prescritos
   */
  async getTopMedications(
    userId: string,
    limit: number = 10,
    periodInMonths: number = 6,
  ): Promise<TopMedicationsDto> {
    // Calcular data de início do período
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodInMonths);

    // Query para obter o ranking de medicamentos
    // Usando query builder para fazer um GROUP BY com COUNT
    const medicationStats = await this.prescriptionMedicationsRepository
      .createQueryBuilder('pm')
      .select('pm.medicationName', 'medicationName')
      .addSelect('COUNT(pm.id)', 'prescription_count')
      .innerJoin('pm.prescription', 'prescription')
      .innerJoin('prescription.patient', 'patient')
      .where('patient.userId = :userId', { userId })
      .andWhere('prescription.createdAt >= :startDate', { startDate })
      .andWhere('prescription.createdAt <= :endDate', { endDate })
      .groupBy('pm.medicationName')
      .orderBy('prescription_count', 'DESC')
      .limit(limit)
      .getRawMany();

    // Calcular total de prescrições para calcular percentuais
    const totalResult = await this.prescriptionMedicationsRepository
      .createQueryBuilder('pm')
      .select('COUNT(pm.id)', 'total')
      .innerJoin('pm.prescription', 'prescription')
      .innerJoin('prescription.patient', 'patient')
      .where('patient.userId = :userId', { userId })
      .andWhere('prescription.createdAt >= :startDate', { startDate })
      .andWhere('prescription.createdAt <= :endDate', { endDate })
      .getRawOne();

    const totalPrescriptions = parseInt(totalResult.total) || 0;

    // Mapear resultados para DTOs e calcular percentuais
    const medications: TopMedicationDto[] = medicationStats.map((stat) => {
      const prescriptionCount = parseInt(stat.prescription_count);
      const percentage = totalPrescriptions > 0 
        ? Math.round((prescriptionCount / totalPrescriptions) * 100 * 10) / 10
        : 0;

      return {
        medicationName: stat.medicationName,
        prescriptionCount,
        percentage,
      };
    });

    // Determinar período de descrição
    const periodDescription = periodInMonths === 1 
      ? 'Último mês'
      : periodInMonths === 3 
      ? 'Últimos 3 meses'
      : periodInMonths === 6 
      ? 'Últimos 6 meses'
      : periodInMonths === 12 
      ? 'Último ano'
      : `Últimos ${periodInMonths} meses`;

    return {
      medications,
      totalPrescriptions,
      period: periodDescription,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Compara a receita do mês atual com a do mês anterior.
   *
   * Calcula a receita total de cada mês baseada nas receitas emitidas
   * e retorna informações comparativas incluindo diferença absoluta,
   * percentual de crescimento/queda e estatísticas adicionais.
   *
   * @param userId - ID do médico/usuário logado
   * @returns Comparação detalhada entre receita do mês atual e anterior
   */
  async getMonthlyRevenueComparison(
    userId: string,
  ): Promise<MonthlyRevenueComparisonDto> {
    const now = new Date();
    
    // Calcular início e fim do mês atual
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Calcular início e fim do mês anterior
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Query para receita do mês atual
    const currentMonthQuery = this.receiptsRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.totalAmount)', 'totalRevenue')
      .addSelect('COUNT(receipt.id)', 'receiptCount')
      .innerJoin('receipt.patient', 'patient')
      .where('patient.userId = :userId', { userId })
      .andWhere('receipt.date >= :startDate', { startDate: currentMonthStart })
      .andWhere('receipt.date <= :endDate', { endDate: currentMonthEnd })
      .andWhere('receipt.status = :status', { status: 'paid' });

    // Query para receita do mês anterior
    const previousMonthQuery = this.receiptsRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.totalAmount)', 'totalRevenue')
      .addSelect('COUNT(receipt.id)', 'receiptCount')
      .innerJoin('receipt.patient', 'patient')
      .where('patient.userId = :userId', { userId })
      .andWhere('receipt.date >= :startDate', { startDate: previousMonthStart })
      .andWhere('receipt.date <= :endDate', { endDate: previousMonthEnd })
      .andWhere('receipt.status = :status', { status: 'paid' });

    // Executar queries em paralelo
    const [currentMonthResult, previousMonthResult] = await Promise.all([
      currentMonthQuery.getRawOne(),
      previousMonthQuery.getRawOne(),
    ]);

    // Extrair valores com fallback para 0
    const currentMonthRevenue = Number(currentMonthResult?.totalRevenue) || 0;
    const previousMonthRevenue = Number(previousMonthResult?.totalRevenue) || 0;
    const currentMonthReceiptCount = parseInt(currentMonthResult?.receiptCount) || 0;
    const previousMonthReceiptCount = parseInt(previousMonthResult?.receiptCount) || 0;

    // Calcular diferença absoluta
    const absoluteDifference = currentMonthRevenue - previousMonthRevenue;

    // Calcular percentual de mudança
    let percentageChange: number | null = null;
    if (previousMonthRevenue > 0) {
      percentageChange = Math.round((absoluteDifference / previousMonthRevenue) * 100 * 10) / 10;
    }

    // Determinar tendência
    let trend: 'Crescimento' | 'Queda' | 'Estável' | 'Sem comparação';
    if (previousMonthRevenue === 0) {
      trend = 'Sem comparação';
    } else if (Math.abs(absoluteDifference) < 0.01) {
      trend = 'Estável';
    } else if (absoluteDifference > 0) {
      trend = 'Crescimento';
    } else {
      trend = 'Queda';
    }

    // Calcular valores médios por receita
    const currentMonthAverageReceipt = currentMonthReceiptCount > 0 
      ? Math.round((currentMonthRevenue / currentMonthReceiptCount) * 100) / 100
      : 0;
    const previousMonthAverageReceipt = previousMonthReceiptCount > 0 
      ? Math.round((previousMonthRevenue / previousMonthReceiptCount) * 100) / 100
      : 0;

    // Formatar nomes dos meses
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const currentMonthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthName = `${monthNames[previousMonth.getMonth()]} ${previousMonth.getFullYear()}`;

    return {
      currentMonthRevenue,
      previousMonthRevenue,
      absoluteDifference,
      percentageChange,
      trend,
      currentMonthName,
      previousMonthName,
      currentMonthReceiptCount,
      previousMonthReceiptCount,
      currentMonthAverageReceipt,
      previousMonthAverageReceipt,
      generatedAt: new Date().toISOString(),
    };
  }
}


