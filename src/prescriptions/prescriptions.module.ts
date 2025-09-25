import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionMedication } from './entities/prescription-medication.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';

/**
 * Módulo de Prescrições Médicas
 * 
 * Este módulo é responsável por gerenciar todo o sistema de prescrições médicas,
 * incluindo a criação, consulta, atualização e exclusão de prescrições e seus
 * medicamentos associados.
 * 
 * @features
 * - CRUD completo de prescrições
 * - Gestão de medicamentos por prescrição
 * - Validação de relacionamentos (paciente/médico)
 * - Controle de status de prescrições
 * - Endpoints RESTful otimizados
 * 
 * @dependencies
 * - TypeORM: Para persistência e relacionamentos
 * - Patient: Entidade de pacientes
 * - User: Entidade de usuários/médicos
 * 
 * @endpoints
 * - POST /prescriptions - Criar nova prescrição
 * - GET /prescriptions/patient/:id - Buscar por paciente
 * - GET /prescriptions/:id - Buscar prescrição específica
 * - PUT /prescriptions/:id - Atualizar prescrição completa
 * - PATCH /prescriptions/:id/status - Alterar apenas status
 * - DELETE /prescriptions/:id - Remover prescrição
 * 
 * @author Sistema EndoData
 * @since 2025-09-24
 * @version 1.0.0
 * @module PrescriptionsModule
 */

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescription, 
      PrescriptionMedication, 
      Patient, 
      User
    ])
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}