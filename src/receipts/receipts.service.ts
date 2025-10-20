/**
 * Serviço de Recibos Médicos
 * 
 * Serviço responsável pela lógica de negócio do sistema de recibos médicos.
 * Implementa operações CRUD completas, relatórios financeiros e validações
 * de dados para o gerenciamento de faturamento médico.
 * 
 * @service ReceiptsService
 * 
 * @features
 * - CRUD completo de recibos médicos
 * - Filtros avançados por período, status e paciente
 * - Cálculo automático de totais
 * - Relatórios financeiros mensais
 * - Validação de relacionamentos
 * - Paginação de resultados
 * 
 * @businessRules
 * - Recibos devem ter pelo menos um item
 * - Totais calculados automaticamente
 * - Validação de existência de pacientes
 * - Controle de status do faturamento
 * 
 * @dependencies
 * - Repository<Receipt>: Persistência de recibos
 * - Repository<ReceiptItem>: Persistência de itens
 * - PatientsService: Validação de pacientes
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 * @injectable
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { PatientsService } from '../patients/patients.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';
import { ReceiptStatus } from './enums/receipt-status.enum';

/**
 * Interface para relatório mensal de faturamento.
 * 
 * @interface MonthlyReport
 */
export interface MonthlyReport {
  /** Mês do relatório (1-12) */
  month: number;
  /** Ano do relatório */
  year: number;
  /** Receita total do mês */
  totalRevenue: number;
  /** Número total de recibos */
  totalReceipts: number;
  /** Número de recibos pendentes */
  pendingReceipts: number;
  /** Número de recibos pagos */
  paidReceipts: number;
  /** Número de recibos cancelados */
  cancelledReceipts: number;
  /** Valor médio por recibo */
  averageReceiptValue: number;
}

/**
 * Interface para resultados paginados.
 * 
 * @interface PaginatedResult
 * @template T Tipo dos dados paginados
 */
export interface PaginatedResult<T> {
  /** Dados da página atual */
  data: T[];
  /** Total de registros */
  total: number;
  /** Página atual */
  page: number;
  /** Limite de itens por página */
  limit: number;
  /** Total de páginas */
  totalPages: number;
}

/**
 * Serviço de Recibos Médicos
 * 
 * Implementa toda a lógica de negócio para gerenciamento de recibos médicos.
 */
@Injectable()
export class ReceiptsService {
  /**
   * Construtor do serviço de recibos.
   * 
   * @param receiptRepository - Repository para entidade Receipt
   * @param receiptItemRepository - Repository para entidade ReceiptItem
   * @param patientsService - Serviço para validação de pacientes
   */
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    
    @InjectRepository(ReceiptItem)
    private readonly receiptItemRepository: Repository<ReceiptItem>,
    
    private readonly patientsService: PatientsService,
  ) {}

  /**
   * Cria um novo recibo médico.
   * 
   * Valida a existência do paciente, cria o recibo com seus itens
   * e calcula automaticamente o valor total.
   * 
   * @param createReceiptDto - Dados para criação do recibo
   * @param userId - ID do usuário que está criando o recibo
   * @returns Promise<Receipt> - Recibo criado com relacionamentos
   * 
   * @throws {NotFoundException} - Quando paciente não é encontrado
   * @throws {BadRequestException} - Quando recibo não tem itens
   * 
   * @example
   * ```typescript
   * const receipt = await service.create({
   *   patientId: 'uuid',
   *   items: [{ description: 'Consulta', quantity: 1, unitPrice: 150.00 }]
   * }, 'user-id');
   * ```
   */
  async create(createReceiptDto: CreateReceiptDto, userId: string): Promise<Receipt> {
    const { patientId, items, ...receiptData } = createReceiptDto;

    // Validar existência do paciente
    const patient = await this.patientsService.findOne(patientId);

    // Validar se há itens
    if (!items || items.length === 0) {
      throw new BadRequestException('O recibo deve conter pelo menos um item');
    }

    // Criar o recibo com itens
    const receipt = this.receiptRepository.create({
      ...receiptData,
      patientId,
      userId: userId,
      date: new Date(),
    });

    // Calcular total do recibo primeiro
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    receipt.totalAmount = totalAmount;

    // Salvar o recibo
    const savedReceipt = await this.receiptRepository.save(receipt);

    // Criar itens do recibo
    const receiptItems = items.map(item => {
      const receiptItem = this.receiptItemRepository.create({
        ...item,
        receiptId: savedReceipt.id,
        totalPrice: item.quantity * item.unitPrice
      });
      return receiptItem;
    });

    // Salvar os itens
    await this.receiptItemRepository.save(receiptItems);

    // Atualizar o totalAmount diretamente no banco após salvar os itens
    await this.receiptRepository.update(savedReceipt.id, { 
      totalAmount: totalAmount 
    });

    // Retornar recibo com relacionamentos
    return await this.findOne(savedReceipt.id);
  }

  /**
   * Busca todos os recibos de um paciente específico.
   * 
   * Retorna lista ordenada por data (mais recentes primeiro).
   * Valida a existência do paciente antes da busca.
   * 
   * @param patientId - ID do paciente
   * @returns Promise<Receipt[]> - Lista de recibos do paciente
   * 
   * @throws {NotFoundException} - Quando paciente não é encontrado
   * 
   * @example
   * ```typescript
   * const receipts = await service.findByPatient('patient-uuid');
   * ```
   */
  async findByPatient(patientId: string): Promise<Receipt[]> {
    // Validar se paciente existe
    await this.patientsService.findOne(patientId);

    return await this.receiptRepository.find({
      where: { patientId },
      relations: ['items', 'patient'],
      order: { date: 'DESC' }
    });
  }

  /**
   * Busca recibos com filtros avançados e paginação.
   * 
   * Permite filtrar por período, status, paciente e outros critérios.
   * Retorna resultado paginado com metadados de paginação.
   * 
   * @param queryDto - Filtros e opções de busca
   * @returns Promise<PaginatedResult<Receipt>> - Resultado paginado
   * 
   * @example
   * ```typescript
   * const result = await service.findAll({
   *   period: 'month',
   *   status: 'pending',
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async findAll(queryDto: QueryReceiptsDto): Promise<PaginatedResult<Receipt>> {
    const {
      period,
      startDate,
      endDate,
      status,
      patientId,
      page = 1,
      limit = 10
    } = queryDto;

    const query = this.receiptRepository.createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.items', 'items')
      .leftJoinAndSelect('receipt.patient', 'patient')
      .leftJoinAndSelect('receipt.user', 'user');

    // Filtro por período
    if (period && period !== 'custom') {
      const now = new Date();
      let filterStartDate: Date;

      switch (period) {
        case 'day':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          filterStartDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      if (filterStartDate) {
        query.andWhere('receipt.date >= :startDate', { startDate: filterStartDate });
      }
    }

    // Filtro por período customizado
    if (period === 'custom' && startDate && endDate) {
      query.andWhere('receipt.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    }

    // Filtro por status
    if (status) {
      query.andWhere('receipt.status = :status', { status });
    }

    // Filtro por paciente
    if (patientId) {
      // Validar se paciente existe
      await this.patientsService.findOne(patientId);
      query.andWhere('receipt.patientId = :patientId', { patientId });
    }

    // Ordenação e paginação
    query
      .orderBy('receipt.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [receipts, total] = await query.getManyAndCount();

    // Recalcular totalAmount para cada recibo baseado nos itens carregados
    const receiptsWithCorrectTotal = receipts.map(receipt => {
      if (receipt.items && receipt.items.length > 0) {
        const calculatedTotal = receipt.items.reduce((sum, item) => {
          const itemTotal = parseFloat(item.totalPrice.toString()) || 0;
          return sum + itemTotal;
        }, 0);
        receipt.totalAmount = Number(calculatedTotal.toFixed(2));
      }
      return receipt;
    });

    return {
      data: receiptsWithCorrectTotal,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Busca um recibo específico pelo ID.
   * 
   * Retorna o recibo com todos os relacionamentos carregados.
   * 
   * @param id - ID do recibo
   * @returns Promise<Receipt> - Dados completos do recibo
   * 
   * @throws {NotFoundException} - Quando recibo não é encontrado
   * 
   * @example
   * ```typescript
   * const receipt = await service.findOne('receipt-uuid');
   * ```
   */
  async findOne(id: string): Promise<Receipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['items', 'patient', 'user']
    });

    if (!receipt) {
      throw new NotFoundException(`Recibo com ID ${id} não encontrado`);
    }

    // Recalcular totalAmount baseado nos itens carregados
    if (receipt.items && receipt.items.length > 0) {
      const calculatedTotal = receipt.items.reduce((sum, item) => {
        const itemTotal = parseFloat(item.totalPrice.toString()) || 0;
        return sum + itemTotal;
      }, 0);
      
      // Atualizar o totalAmount com o valor calculado (garantir que seja number)
      receipt.totalAmount = Number(calculatedTotal.toFixed(2));
    }

    return receipt;
  }

  /**
   * Atualiza completamente um recibo existente.
   * 
   * Permite atualizar status, itens e recalcula totais automaticamente.
   * Remove itens antigos e cria novos se fornecidos.
   * 
   * @param id - ID do recibo a ser atualizado
   * @param updateReceiptDto - Dados para atualização
   * @returns Promise<Receipt> - Recibo atualizado
   * 
   * @throws {NotFoundException} - Quando recibo não é encontrado
   * 
   * @example
   * ```typescript
   * const updated = await service.update('receipt-uuid', {
   *   status: 'paid',
   *   items: [{ description: 'Nova consulta', quantity: 1, unitPrice: 200 }]
   * });
   * ```
   */
  async update(id: string, updateReceiptDto: UpdateReceiptDto): Promise<Receipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!receipt) {
      throw new NotFoundException(`Recibo com ID ${id} não encontrado`);
    }

    const { items, ...receiptData } = updateReceiptDto;

    // Atualizar dados básicos do recibo
    Object.assign(receipt, receiptData);

    // Se itens foram fornecidos, atualizar
    if (items && items.length > 0) {
      // Remover itens existentes
      if (receipt.items?.length > 0) {
        await this.receiptItemRepository.remove(receipt.items);
      }

      // Criar novos itens
      const newItems = items.map(item => {
        const receiptItem = this.receiptItemRepository.create({
          ...item,
          receiptId: id,
          totalPrice: item.quantity * item.unitPrice
        });
        return receiptItem;
      });

      // Salvar novos itens
      await this.receiptItemRepository.save(newItems);

      // Atualizar total do recibo
      receipt.totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    // Salvar recibo atualizado
    const savedReceipt = await this.receiptRepository.save(receipt);

    // Retornar com relacionamentos
    return await this.findOne(savedReceipt.id);
  }

  /**
   * Remove um recibo do sistema.
   * 
   * Remove permanentemente o recibo e todos os seus itens.
   * Validação prévia garante que o recibo existe.
   * 
   * @param id - ID do recibo a ser removido
   * @returns Promise<void>
   * 
   * @throws {NotFoundException} - Quando recibo não é encontrado
   * 
   * @example
   * ```typescript
   * await service.remove('receipt-uuid');
   * ```
   */
  async remove(id: string): Promise<void> {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!receipt) {
      throw new NotFoundException(`Recibo com ID ${id} não encontrado`);
    }

    // Remover itens primeiro se existirem (para lidar com foreign keys)
    if (receipt.items && receipt.items.length > 0) {
      await this.receiptItemRepository.remove(receipt.items);
    }

    // Remover o recibo
    await this.receiptRepository.remove(receipt);
  }

  /**
   * Gera relatório financeiro mensal detalhado.
   * 
   * Calcula métricas financeiras para um mês específico, incluindo
   * receita total, contadores por status e valor médio por recibo.
   * 
   * @param month - Mês (1-12)
   * @param year - Ano (>= 2000)
   * @returns Promise<MonthlyReport> - Relatório financeiro completo
   * 
   * @throws {BadRequestException} - Quando parâmetros são inválidos
   * 
   * @example
   * ```typescript
   * const report = await service.getMonthlyReport(9, 2025);
   * console.log(`Receita: R$ ${report.totalRevenue}`);
   * ```
   */
  async getMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
    // Validar parâmetros
    if (month < 1 || month > 12) {
      throw new BadRequestException('Mês deve estar entre 1 e 12');
    }
    
    if (year < 2000) {
      throw new BadRequestException('Ano deve ser maior ou igual a 2000');
    }

    // Calcular primeiro e último dia do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const baseQuery = this.receiptRepository.createQueryBuilder('receipt')
      .where('receipt.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });

    // Buscar todos os recibos do mês
    const [allReceipts, totalCount] = await baseQuery.getManyAndCount();

    // Calcular receita total
    const totalRevenue = allReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);

    // Contar por status
    const pendingCount = allReceipts.filter(r => r.status === ReceiptStatus.PENDING).length;
    const paidCount = allReceipts.filter(r => r.status === ReceiptStatus.PAID).length;
    const cancelledCount = allReceipts.filter(r => r.status === ReceiptStatus.CANCELLED).length;

    // Calcular valor médio
    const averageValue = totalCount > 0 ? totalRevenue / totalCount : 0;

    return {
      month,
      year,
      totalRevenue,
      totalReceipts: totalCount,
      pendingReceipts: pendingCount,
      paidReceipts: paidCount,
      cancelledReceipts: cancelledCount,
      averageReceiptValue: Number(averageValue.toFixed(2))
    };
  }
}