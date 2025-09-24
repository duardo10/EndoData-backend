import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetabolicCalculation } from './entities/metabolic-calculation.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CreateCalculationDto } from './dto/create-calculation.dto';
import { BMICalculatorService } from './services/bmi-calculator.service';
import { BMRCalculatorService } from './services/bmr-calculator.service';
import { CalculationType } from './enums/calculation-type.enum';

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
    private readonly bmiCalculator: BMICalculatorService,
    private readonly bmrCalculator: BMRCalculatorService,
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

  async calculate(tipo: CalculationType, patientId: string, dados: Record<string, any>) {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    let results: Record<string, any> = {};
    if (tipo === CalculationType.BMI) {
      results = this.bmiCalculator.calculate(dados.weight, dados.height);
    } else if (tipo === CalculationType.BMR) {
      results = { bmr: this.bmrCalculator.calculate(dados.weight, dados.height, dados.age, dados.sex) };
    } else if (tipo === CalculationType.TDEE) {
      const bmr = this.bmrCalculator.calculate(dados.weight, dados.height, dados.age, dados.sex);
      results = { tdee: bmr * dados.activityLevel };
    }

    const entity = this.calculationRepo.create({
      patient,
      user: null, // Usuário não é relevante neste contexto
      calculationType: tipo,
      inputData: dados,
      results,
    });
    return await this.calculationRepo.save(entity);
  }
}


