import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  HttpStatus,
  HttpCode,
  ParseUUIDPipe
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { UpdatePrescriptionStatusDto } from './dto/update-prescription-status.dto';
import { Prescription } from './entities/prescription.entity';

/**
 * Controller de Prescrições Médicas
 * 
 * Controller REST responsável por expor endpoints HTTP para gerenciamento
 * completo de prescrições médicas. Implementa padrão RESTful com validações
 * automáticas e tratamento de erros.
 * 
 * @baseRoute /prescriptions
 * 
 * @endpoints
 * - POST   /prescriptions              - Criar nova prescrição
 * - GET    /prescriptions/patient/:id  - Buscar por paciente  
 * - GET    /prescriptions/:id          - Buscar por ID
 * - PUT    /prescriptions/:id          - Atualizar completa
 * - PATCH  /prescriptions/:id/status   - Alterar status
 * - DELETE /prescriptions/:id          - Remover prescrição
 * 
 * @validation
 * - UUIDs validados automaticamente via ParseUUIDPipe
 * - DTOs validados com class-validator decorators
 * - Códigos HTTP apropriados para cada operação
 * - Tratamento automático de erros via exception filters
 * 
 * @security
 * - Autenticação JWT obrigatória (global guard)
 * - Validação de permissões via relacionamentos
 * - Sanitização automática de inputs
 * 
 * @responseFormats
 * - JSON padronizado para todas as respostas
 * - Códigos HTTP semânticos (201, 200, 204, 404, 400)
 * - Mensagens de erro descritivas
 * 
 * @dependencies
 * - PrescriptionsService: Lógica de negócio
 * - class-validator: Validação de DTOs
 * - class-transformer: Transformação de dados
 * 
 * @author Sistema EndoData
 * @since 2025-09-24
 * @version 1.0.0
 * @controller prescriptions
 */
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  /**
   * Cria uma nova prescrição médica.
   * 
   * @route POST /prescriptions
   * @param createPrescriptionDto - Dados da prescrição a ser criada
   * @returns Prescrição criada com status 201
   * 
   * @example
   * POST /prescriptions
   * {
   *   "patientId": "123e4567-e89b-12d3-a456-426614174000",
   *   "userId": "123e4567-e89b-12d3-a456-426614174001",
   *   "status": "active",
   *   "notes": "Tomar com alimentos",
   *   "medications": [
   *     {
   *       "medicationName": "Paracetamol",
   *       "dosage": "500mg",
   *       "frequency": "3x ao dia",
   *       "duration": "7 dias"
   *     }
   *   ]
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    return await this.prescriptionsService.create(createPrescriptionDto);
  }

  /**
   * Busca todas as prescrições de um paciente específico.
   * 
   * @route GET /prescriptions/patient/:id
   * @param patientId - ID do paciente (UUID)
   * @returns Array de prescrições do paciente ordenadas por data (mais recentes primeiro)
   * 
   * @example
   * GET /prescriptions/patient/123e4567-e89b-12d3-a456-426614174000
   */
  @Get('patient/:id')
  async findByPatient(
    @Param('id', ParseUUIDPipe) patientId: string
  ): Promise<Prescription[]> {
    return await this.prescriptionsService.findByPatient(patientId);
  }

  /**
   * Busca uma prescrição específica pelo ID.
   * 
   * @route GET /prescriptions/:id
   * @param id - ID da prescrição (UUID)
   * @returns Dados completos da prescrição
   * 
   * @example
   * GET /prescriptions/123e4567-e89b-12d3-a456-426614174002
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Prescription> {
    return await this.prescriptionsService.findOne(id);
  }

  /**
   * Atualiza completamente uma prescrição existente.
   * 
   * @route PUT /prescriptions/:id
   * @param id - ID da prescrição a ser atualizada (UUID)
   * @param updatePrescriptionDto - Dados para atualização da prescrição
   * @returns Prescrição atualizada
   * 
   * @example
   * PUT /prescriptions/123e4567-e89b-12d3-a456-426614174002
   * {
   *   "status": "suspended",
   *   "notes": "Suspender por 3 dias devido a efeitos adversos",
   *   "medications": [
   *     {
   *       "medicationName": "Paracetamol",
   *       "dosage": "250mg",
   *       "frequency": "2x ao dia",
   *       "duration": "5 dias"
   *     }
   *   ]
   * }
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto
  ): Promise<Prescription> {
    return await this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  /**
   * Altera apenas o status de uma prescrição.
   * 
   * @route PATCH /prescriptions/:id/status
   * @param id - ID da prescrição (UUID)
   * @param updateStatusDto - Novo status da prescrição
   * @returns Prescrição com status atualizado
   * 
   * @example
   * PATCH /prescriptions/123e4567-e89b-12d3-a456-426614174002/status
   * {
   *   "status": "completed"
   * }
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdatePrescriptionStatusDto
  ): Promise<Prescription> {
    return await this.prescriptionsService.updateStatus(id, updateStatusDto.status);
  }

  /**
   * Remove uma prescrição do sistema.
   * 
   * @route DELETE /prescriptions/:id
   * @param id - ID da prescrição a ser removida (UUID)
   * @returns Status 204 (No Content) em caso de sucesso
   * 
   * @example
   * DELETE /prescriptions/123e4567-e89b-12d3-a456-426614174002
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.prescriptionsService.remove(id);
  }
}