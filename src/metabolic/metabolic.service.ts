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
 * Serviço responsável pela orquestração de persistência, leitura e execução dos cálculos metabólicos (IMC, BMR, TDEE).
 * - Persiste registros de cálculos realizados para pacientes.
 * - Realiza cálculos de IMC (com classificação), Taxa Metabólica Basal (Harris-Benedict) e Gasto Energético Total.
 * - Utiliza serviços especializados para cada tipo de cálculo.
 * - Permite consultar o histórico de cálculos de um paciente.
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

  /**
   * Cria um cálculo para um paciente específico, associando o usuário executor.
   * Persiste o tipo de cálculo, dados de entrada e resultado.
   * @param patientId UUID do paciente
   * @param dto DTO contendo tipo, dados e usuário
   * @param userId UUID do usuário executor
   * @returns Registro de cálculo persistido
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
   * Lista cálculos de um paciente em ordem decrescente de criação.
   * @param patientId UUID do paciente
   * @returns Array de registros de cálculos
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

  /**
   * Realiza o cálculo metabólico solicitado (IMC, BMR, TDEE) e persiste o resultado.
   * Utiliza os serviços especializados para cada tipo de cálculo.
   * @param tipo Tipo de cálculo (BMI, BMR, TDEE)
   * @param patientId UUID do paciente
   * @param dados Dados de entrada necessários para o cálculo
   * @returns Registro de cálculo persistido com resultado
   */

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


