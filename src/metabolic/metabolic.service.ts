import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetabolicCalculation } from './entities/metabolic-calculation.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CreateCalculationDto } from './dto/create-calculation.dto';

/**
 * Serviço responsável pela orquestração de persistência e leitura de cálculos metabólicos.
 * Não implementa a lógica matemática dos cálculos (IMC/BMR/TDEE) nesta etapa.
 */
@Injectable()
export class MetabolicService {
  constructor(
    @InjectRepository(MetabolicCalculation)
    private readonly calculationRepo: Repository<MetabolicCalculation>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Cria um cálculo para um paciente específico, associando o usuário executor. */
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

  /** Lista cálculos de um paciente em ordem decrescente de criação. */
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


