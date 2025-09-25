import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { PrescriptionMedication } from './entities/prescription-medication.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

/**
 * Serviço de Prescrições Médicas
 * 
 * Serviço principal responsável por gerenciar todas as operações relacionadas
 * a prescrições médicas, incluindo CRUD completo, validações de negócio e 
 * gestão de relacionamentos com entidades relacionadas.
 * 
 * @responsibilities
 * - Criação de prescrições com validação de medicamentos
 * - Consulta de prescrições por paciente ou ID específico
 * - Atualização completa ou parcial de prescrições
 * - Controle de ciclo de vida através de status
 * - Validação de relacionamentos (paciente/médico)
 * - Gestão automática de medicamentos associados
 * 
 * @businessRules
 * - Prescrição deve ter pelo menos 1 medicamento
 * - Paciente e médico devem existir no sistema
 * - Status deve seguir enum PrescriptionStatus
 * - Medicamentos são gerenciados via cascade do TypeORM
 * 
 * @dependencies
 * - PrescriptionRepository: Persistência de prescrições
 * - MedicationRepository: Gestão de medicamentos
 * - PatientRepository: Validação de pacientes
 * - UserRepository: Validação de médicos/usuários
 * 
 * @methods
 * - create(): Cria nova prescrição com medicamentos
 * - findByPatient(): Busca prescrições de um paciente
 * - findOne(): Busca prescrição específica por ID
 * - update(): Atualiza prescrição completa
 * - updateStatus(): Altera apenas o status
 * - remove(): Remove prescrição e medicamentos
 * 
 * @author Sistema EndoData
 * @since 2025-09-24
 * @version 1.0.0
 * @class PrescriptionsService
 */
@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    
    @InjectRepository(PrescriptionMedication)
    private readonly medicationRepository: Repository<PrescriptionMedication>,
    
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Cria uma nova prescrição médica.
   * 
   * Valida a existência do paciente e médico antes de criar a prescrição.
   * Cria os medicamentos associados automaticamente através do cascade.
   * 
   * @param createPrescriptionDto - Dados para criação da prescrição
   * @returns Prescrição criada com medicamentos
   * @throws NotFoundException - Se paciente ou médico não existir
   * @throws BadRequestException - Se dados inválidos
   */
  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const { patientId, userId, medications, ...prescriptionData } = createPrescriptionDto;

    // Validar existência do paciente
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Paciente com ID ${patientId} não encontrado`);
    }

    // Validar existência do médico/usuário
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário/Médico com ID ${userId} não encontrado`);
    }

    // Validar se há medicamentos
    if (!medications || medications.length === 0) {
      throw new BadRequestException('A prescrição deve conter pelo menos um medicamento');
    }

    // Criar a prescrição com medicamentos
    const prescription = this.prescriptionRepository.create({
      ...prescriptionData,
      patient,
      user,
      medications: medications.map(med => this.medicationRepository.create(med)),
    });

    return await this.prescriptionRepository.save(prescription);
  }

  /**
   * Busca todas as prescrições de um paciente específico.
   * 
   * Retorna as prescrições ordenadas por data de criação (mais recentes primeiro).
   * Inclui dados do médico e medicamentos associados.
   * 
   * @param patientId - ID do paciente
   * @returns Array de prescrições do paciente
   * @throws NotFoundException - Se paciente não existir
   */
  async findByPatient(patientId: string): Promise<Prescription[]> {
    // Validar existência do paciente
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Paciente com ID ${patientId} não encontrado`);
    }

    return await this.prescriptionRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'user', 'medications'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca uma prescrição específica pelo ID.
   * 
   * @param id - ID da prescrição
   * @returns Prescrição encontrada
   * @throws NotFoundException - Se prescrição não existir
   */
  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['patient', 'user', 'medications'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescrição com ID ${id} não encontrada`);
    }

    return prescription;
  }

  /**
   * Atualiza uma prescrição existente.
   * 
   * Permite atualizar todos os dados da prescrição, incluindo medicamentos.
   * Remove medicamentos antigos e cria os novos.
   * 
   * @param id - ID da prescrição a ser atualizada
   * @param updateData - Dados para atualização
   * @returns Prescrição atualizada
   * @throws NotFoundException - Se prescrição, paciente ou médico não existir
   */
  async update(id: string, updateData: Partial<CreatePrescriptionDto>): Promise<Prescription> {
    const prescription = await this.findOne(id);

    // Validar e atualizar referências se fornecidas
    if (updateData.patientId) {
      const patient = await this.patientRepository.findOne({ 
        where: { id: updateData.patientId } 
      });
      if (!patient) {
        throw new NotFoundException(`Paciente com ID ${updateData.patientId} não encontrado`);
      }
      prescription.patient = patient;
    }

    if (updateData.userId) {
      const user = await this.userRepository.findOne({ 
        where: { id: updateData.userId } 
      });
      if (!user) {
        throw new NotFoundException(`Usuário/Médico com ID ${updateData.userId} não encontrado`);
      }
      prescription.user = user;
    }

    // Atualizar campos básicos
    if (updateData.status !== undefined) {
      prescription.status = updateData.status;
    }
    
    if (updateData.notes !== undefined) {
      prescription.notes = updateData.notes;
    }

    // Atualizar medicamentos se fornecidos
    if (updateData.medications) {
      if (updateData.medications.length === 0) {
        throw new BadRequestException('A prescrição deve conter pelo menos um medicamento');
      }

      // Remover medicamentos antigos
      await this.medicationRepository.delete({ prescription: { id } });

      // Criar novos medicamentos
      prescription.medications = updateData.medications.map(med => 
        this.medicationRepository.create({ ...med, prescription })
      );
    }

    return await this.prescriptionRepository.save(prescription);
  }

  /**
   * Altera apenas o status de uma prescrição.
   * 
   * Método específico para mudanças de status, comum em fluxos médicos.
   * 
   * @param id - ID da prescrição
   * @param status - Novo status da prescrição
   * @returns Prescrição com status atualizado
   * @throws NotFoundException - Se prescrição não existir
   */
  async updateStatus(id: string, status: PrescriptionStatus): Promise<Prescription> {
    const prescription = await this.findOne(id);
    prescription.status = status;
    return await this.prescriptionRepository.save(prescription);
  }

  /**
   * Remove uma prescrição do sistema.
   * 
   * Remove também todos os medicamentos associados através do cascade.
   * 
   * @param id - ID da prescrição a ser removida
   * @throws NotFoundException - Se prescrição não existir
   */
  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionRepository.remove(prescription);
  }
}