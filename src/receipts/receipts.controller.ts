/**
 * Controller de Recibos Médicos
 * 
 * Controller REST responsável por expor endpoints HTTP para gerenciamento
 * completo de recibos médicos. Implementa padrão RESTful com validações
 * automáticas, relatórios financeiros e tratamento de erros.
 * 
 * @baseRoute /receipts
 * 
 * @endpoints
 * - POST   /receipts                    - Criar novo recibo
 * - GET    /receipts/patient/:id        - Buscar por paciente  
 * - GET    /receipts                    - Buscar com filtros
 * - GET    /receipts/:id                - Buscar por ID
 * - PUT    /receipts/:id                - Atualizar completo
 * - DELETE /receipts/:id                - Remover recibo
 * - GET    /receipts/reports/monthly    - Relatório mensal
 * 
 * @validation
 * - UUIDs validados automaticamente via ParseUUIDPipe
 * - DTOs validados com class-validator decorators
 * - Query parameters validados e transformados
 * - Códigos HTTP apropriados para cada operação
 * 
 * @security
 * - Autenticação JWT obrigatória (global guard)
 * - Validação de permissões via relacionamentos
 * - Sanitização automática de inputs
 * - Rate limiting para relatórios
 * 
 * @responseFormats
 * - JSON padronizado para todas as respostas
 * - Códigos HTTP semânticos (201, 200, 204, 404, 400)
 * - Mensagens de erro descritivas
 * - Paginação em consultas de lista
 * 
 * @dependencies
 * - ReceiptsService: Lógica de negócio
 * - CurrentUser: Decorator para usuário autenticado
 * - class-validator: Validação de DTOs
 * - class-transformer: Transformação de dados
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 * @controller receipts
 */

import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { MonthlyReport, PaginatedResult } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';
import { Receipt } from './entities/receipt.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

/**
 * Controller de Recibos Médicos
 */
@ApiTags('Recibos')
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  /**
   * Cria um novo recibo médico.
   * 
   * @route POST /receipts
   * @param createReceiptDto - Dados do recibo a ser criado
   * @param currentUser - Usuário autenticado
   * @returns Recibo criado com status 201
   * 
   * @example
   * POST /receipts
   * {
   *   "patientId": "123e4567-e89b-12d3-a456-426614174000",
   *   "status": "pending",
   *   "items": [
   *     {
   *       "description": "Consulta médica",
   *       "quantity": 1,
   *       "unitPrice": 150.00
   *     }
   *   ]
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo recibo médico' })
  @ApiResponse({ 
    status: 201, 
    description: 'Recibo criado com sucesso',
    type: Receipt 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  async create(
    @Body() createReceiptDto: CreateReceiptDto,
    @CurrentUser() currentUser: User
  ): Promise<Receipt> {
    return await this.receiptsService.create(createReceiptDto, currentUser.id);
  }

  /**
   * Busca todos os recibos de um paciente específico.
   * 
   * @route GET /receipts/patient/:id
   * @param patientId - ID do paciente (UUID)
   * @returns Array de recibos do paciente ordenados por data (mais recentes primeiro)
   * 
   * @example
   * GET /receipts/patient/123e4567-e89b-12d3-a456-426614174000
   */
  @Get('patient/:id')
  @ApiOperation({ summary: 'Buscar recibos por paciente' })
  @ApiParam({ name: 'id', description: 'ID do paciente', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de recibos do paciente',
    type: [Receipt] 
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  async findByPatient(
    @Param('id', ParseUUIDPipe) patientId: string
  ): Promise<Receipt[]> {
    return await this.receiptsService.findByPatient(patientId);
  }

  /**
   * Busca recibos com filtros avançados.
   * 
   * Permite filtrar por período, status, paciente e outros critérios.
   * Retorna resultado paginado.
   * 
   * @route GET /receipts
   * @param queryDto - Filtros de busca
   * @returns Resultado paginado de recibos
   * 
   * @example
   * GET /receipts?period=month&status=pending&page=1&limit=10
   * GET /receipts?period=custom&startDate=2025-09-01&endDate=2025-09-30
   */
  @Get()
  @ApiOperation({ summary: 'Buscar recibos com filtros' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year', 'custom'] })
  @ApiQuery({ name: 'startDate', required: false, type: 'string', description: 'Data início (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string', description: 'Data fim (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'paid', 'cancelled'] })
  @ApiQuery({ name: 'patientId', required: false, type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista paginada de recibos',
  })
  async findAll(
    @Query() queryDto: QueryReceiptsDto
  ): Promise<PaginatedResult<Receipt>> {
    return await this.receiptsService.findAll(queryDto);
  }

  /**
   * Busca um recibo específico pelo ID.
   * 
   * @route GET /receipts/:id
   * @param id - ID do recibo (UUID)
   * @returns Dados completos do recibo
   * 
   * @example
   * GET /receipts/123e4567-e89b-12d3-a456-426614174002
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar recibo por ID' })
  @ApiParam({ name: 'id', description: 'ID do recibo', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados do recibo',
    type: Receipt 
  })
  @ApiResponse({ status: 404, description: 'Recibo não encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Receipt> {
    return await this.receiptsService.findOne(id);
  }

  /**
   * Atualiza completamente um recibo existente.
   * 
   * @route PUT /receipts/:id
   * @param id - ID do recibo a ser atualizado (UUID)
   * @param updateReceiptDto - Dados para atualização do recibo
   * @returns Recibo atualizado
   * 
   * @example
   * PUT /receipts/123e4567-e89b-12d3-a456-426614174002
   * {
   *   "status": "paid",
   *   "items": [
   *     {
   *       "description": "Consulta médica + retorno",
   *       "quantity": 1,
   *       "unitPrice": 200.00
   *     }
   *   ]
   * }
   */
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar recibo' })
  @ApiParam({ name: 'id', description: 'ID do recibo', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recibo atualizado com sucesso',
    type: Receipt 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Recibo não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReceiptDto: UpdateReceiptDto
  ): Promise<Receipt> {
    return await this.receiptsService.update(id, updateReceiptDto);
  }

  /**
   * Remove um recibo do sistema.
   * 
   * @route DELETE /receipts/:id
   * @param id - ID do recibo a ser removido (UUID)
   * @returns Status 204 (No Content) em caso de sucesso
   * 
   * @example
   * DELETE /receipts/123e4567-e89b-12d3-a456-426614174002
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover recibo' })
  @ApiParam({ name: 'id', description: 'ID do recibo', type: 'string' })
  @ApiResponse({ status: 204, description: 'Recibo removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Recibo não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.receiptsService.remove(id);
  }

  /**
   * Gera relatório de faturamento mensal.
   * 
   * Retorna métricas financeiras detalhadas para um mês específico,
   * incluindo receita total, número de recibos por status, etc.
   * 
   * @route GET /receipts/reports/monthly
   * @param month - Mês (1-12)
   * @param year - Ano
   * @returns Relatório mensal completo
   * 
   * @example
   * GET /receipts/reports/monthly?month=9&year=2025
   */
  @Get('reports/monthly')
  @ApiOperation({ summary: 'Relatório de faturamento mensal' })
  @ApiQuery({ name: 'month', type: 'number', description: 'Mês (1-12)' })
  @ApiQuery({ name: 'year', type: 'number', description: 'Ano' })
  @ApiResponse({ 
    status: 200, 
    description: 'Relatório mensal de faturamento',
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async getMonthlyReport(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number
  ): Promise<MonthlyReport> {
    return await this.receiptsService.getMonthlyReport(month, year);
  }
}