import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetabolicCalculation } from './entities/metabolic-calculation.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CreateCalculationDto } from './dto/create-calculation.dto';

/**
 * Serviço responsável pela orquestração de persistência e leitura de cálculos metabólicos.
 * 
 * Gerencia a criação e consulta de registros de cálculos metabólicos (IMC, BMR, TDEE)
 * associados a pacientes específicos. Não implementa a lógica matemática dos cálculos,
 * apenas persiste os dados de entrada e resultados fornecidos.
 * 
 * @class MetabolicService
 * @injectable
 */
@Injectable()
export class MetabolicService {
  /**
   * Injeta os repositórios necessários para operações de persistência.
   * 
   * @param calculationRepo Repositório de cálculos metabólicos
   * @param patientRepo Repositório de pacientes
   * @param userRepo Repositório de usuários
   */
  constructor(
    @InjectRepository(MetabolicCalculation)
    private readonly calculationRepo: Repository<MetabolicCalculation>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Cria um novo registro de cálculo metabólico para um paciente específico.
   * 
   * Valida a existência do paciente e usuário antes de criar o registro.
   * Associa o cálculo ao paciente e ao usuário executor, armazenando os
   * dados de entrada e inicializando um objeto vazio para os resultados.
   * 
   * @param patientId Identificador único do paciente
   * @param dto Dados do cálculo a ser criado
   * @param userId Identificador do usuário executor
   * @returns Cálculo metabólico criado e persistido
   * 
   * @throws {NotFoundException} Quando paciente não for encontrado
   * @throws {NotFoundException} Quando usuário não for encontrado
   * 
   * @example
   * ```typescript
   * const calculation = await service.createForPatient(
   *   'patient-uuid',
   *   { calculationType: 'BMI', inputData: { weight: 70, height: 1.75 } },
   *   'user-uuid'
   * );
   * ```
   */
  async createForPatient(patientId: string, dto: CreateCalculationDto, userId: string) {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const entity = this.calculationRepo.create({
      patient,
      user,
      calculationType: dto.calculationType,
      inputData: dto.inputData,
      results: {},
    });
    return await this.calculationRepo.save(entity);
  }

  /**
   * Lista todos os cálculos metabólicos de um paciente específico.
   * 
   * Valida a existência do paciente antes de realizar a consulta.
   * Retorna os cálculos ordenados por data de criação em ordem decrescente
   * (mais recentes primeiro).
   * 
   * @param patientId Identificador único do paciente
   * @returns Array de cálculos metabólicos do paciente
   * 
   * @throws {NotFoundException} Quando paciente não for encontrado
   * 
   * @example
   * ```typescript
   * const calculations = await service.listByPatient('patient-uuid');
   * // Retorna: [{ id: 'calc-1', calculationType: 'BMI', ... }, ...]
   * ```
   */
  async listByPatient(patientId: string) {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return this.calculationRepo.find({
      where: { patient: { id: patientId } },
      order: { createdAt: 'DESC' },
    });
  }
}


