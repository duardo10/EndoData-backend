import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MetabolicService } from './metabolic.service';
import { BMICalculatorService } from './services/bmi-calculator.service';
import { BMRCalculatorService } from './services/bmr-calculator.service';
import { MetabolicCalculation } from './entities/metabolic-calculation.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CalculationType } from './enums/calculation-type.enum';
import { createMockRepository } from '../../test/mocks/typeorm-mocks';

describe('MetabolicService', () => {
  let service: MetabolicService;
  let calculationRepository: any;
  let patientRepository: any;
  let userRepository: any;
  let bmiCalculator: BMICalculatorService;
  let bmrCalculator: BMRCalculatorService;

  beforeEach(async () => {
    const mockCalculationRepository = createMockRepository<MetabolicCalculation>();
    const mockPatientRepository = createMockRepository<Patient>();
    const mockUserRepository = createMockRepository<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetabolicService,
        {
          provide: getRepositoryToken(MetabolicCalculation),
          useValue: mockCalculationRepository,
        },
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: BMICalculatorService,
          useValue: {
            calculate: jest.fn(),
          },
        },
        {
          provide: BMRCalculatorService,
          useValue: {
            calculate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MetabolicService>(MetabolicService);
    calculationRepository = module.get(getRepositoryToken(MetabolicCalculation));
    patientRepository = module.get(getRepositoryToken(Patient));
    userRepository = module.get(getRepositoryToken(User));
    bmiCalculator = module.get<BMICalculatorService>(BMICalculatorService);
    bmrCalculator = module.get<BMRCalculatorService>(BMRCalculatorService);
  });

  afterEach(() => {
    calculationRepository.resetMocks();
    patientRepository.resetMocks();
    userRepository.resetMocks();
  });

  describe('createForPatient', () => {
    it('deve criar cálculo metabólico com sucesso', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      const mockUser = { id: 'user-1', name: 'Médico Teste' };
      const mockCalculation = {
        id: 'calc-1',
        patient: mockPatient,
        user: mockUser,
        calculationType: CalculationType.BMI,
        inputData: { weight: 70, height: 1.75 },
        results: {},
      };

      patientRepository.findOne.mockResolvedValue(mockPatient);
      userRepository.findOne.mockResolvedValue(mockUser);
      calculationRepository.create.mockReturnValue(mockCalculation);
      calculationRepository.save.mockResolvedValue(mockCalculation);

      const result = await service.createForPatient(
        'patient-1',
        {
          calculationType: CalculationType.BMI,
          inputData: { weight: 70, height: 1.75 },
        },
        'user-1'
      );

      expect(result).toEqual(mockCalculation);
      expect(patientRepository.findOne).toHaveBeenCalledWith({ where: { id: 'patient-1' } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(calculationRepository.create).toHaveBeenCalledWith({
        patient: mockPatient,
        user: mockUser,
        calculationType: CalculationType.BMI,
        inputData: { weight: 70, height: 1.75 },
        results: {},
      });
    });

    it('deve falhar quando paciente não encontrado', async () => {
      patientRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createForPatient(
          'patient-inexistente',
          {
            calculationType: CalculationType.BMI,
            inputData: { weight: 70, height: 1.75 },
          },
          'user-1'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar quando usuário não encontrado', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      patientRepository.findOne.mockResolvedValue(mockPatient);
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createForPatient(
          'patient-1',
          {
            calculationType: CalculationType.BMI,
            inputData: { weight: 70, height: 1.75 },
          },
          'user-inexistente'
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listByPatient', () => {
    it('deve listar cálculos de um paciente', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      const mockCalculations = [
        {
          id: 'calc-1',
          calculationType: CalculationType.BMI,
          inputData: { weight: 70, height: 1.75 },
          results: { bmi: 22.86, classification: 'Peso normal' },
        },
        {
          id: 'calc-2',
          calculationType: CalculationType.BMR,
          inputData: { weight: 70, height: 1.75, age: 30, sex: 'M' },
          results: { bmr: 1695.36 },
        },
      ];

      patientRepository.findOne.mockResolvedValue(mockPatient);
      calculationRepository.find.mockResolvedValue(mockCalculations);

      const result = await service.listByPatient('patient-1');

      expect(result).toEqual(mockCalculations);
      expect(patientRepository.findOne).toHaveBeenCalledWith({ where: { id: 'patient-1' } });
      expect(calculationRepository.find).toHaveBeenCalledWith({
        where: { patient: { id: 'patient-1' } },
        order: { createdAt: 'DESC' },
      });
    });

    it('deve falhar quando paciente não encontrado', async () => {
      patientRepository.findOne.mockResolvedValue(null);

      await expect(service.listByPatient('patient-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculate', () => {
    it('deve calcular BMI e persistir resultado', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      const mockCalculation = {
        id: 'calc-1',
        patient: mockPatient,
        calculationType: CalculationType.BMI,
        inputData: { weight: 70, height: 1.75 },
        results: { bmi: 22.86, classification: 'Peso normal' },
      };

      patientRepository.findOne.mockResolvedValue(mockPatient);
      bmiCalculator.calculate.mockReturnValue({ bmi: 22.86, classification: 'Peso normal' });
      calculationRepository.create.mockReturnValue(mockCalculation);
      calculationRepository.save.mockResolvedValue(mockCalculation);

      const result = await service.calculate(
        CalculationType.BMI,
        'patient-1',
        { weight: 70, height: 1.75 }
      );

      expect(result).toEqual(mockCalculation);
      expect(bmiCalculator.calculate).toHaveBeenCalledWith(70, 1.75);
      expect(calculationRepository.create).toHaveBeenCalledWith({
        patient: mockPatient,
        user: null,
        calculationType: CalculationType.BMI,
        inputData: { weight: 70, height: 1.75 },
        results: { bmi: 22.86, classification: 'Peso normal' },
      });
    });

    it('deve calcular BMR e persistir resultado', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      const mockCalculation = {
        id: 'calc-1',
        patient: mockPatient,
        calculationType: CalculationType.BMR,
        inputData: { weight: 70, height: 1.75, age: 30, sex: 'M' },
        results: { bmr: 1695.36 },
      };

      patientRepository.findOne.mockResolvedValue(mockPatient);
      bmrCalculator.calculate.mockReturnValue(1695.36);
      calculationRepository.create.mockReturnValue(mockCalculation);
      calculationRepository.save.mockResolvedValue(mockCalculation);

      const result = await service.calculate(
        CalculationType.BMR,
        'patient-1',
        { weight: 70, height: 1.75, age: 30, sex: 'M' }
      );

      expect(result).toEqual(mockCalculation);
      expect(bmrCalculator.calculate).toHaveBeenCalledWith(70, 1.75, 30, 'M');
      expect(calculationRepository.create).toHaveBeenCalledWith({
        patient: mockPatient,
        user: null,
        calculationType: CalculationType.BMR,
        inputData: { weight: 70, height: 1.75, age: 30, sex: 'M' },
        results: { bmr: 1695.36 },
      });
    });

    it('deve calcular TDEE e persistir resultado', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      const mockCalculation = {
        id: 'calc-1',
        patient: mockPatient,
        calculationType: CalculationType.TDEE,
        inputData: { weight: 70, height: 1.75, age: 30, sex: 'M', activityLevel: 1.5 },
        results: { tdee: 2543.04 },
      };

      patientRepository.findOne.mockResolvedValue(mockPatient);
      bmrCalculator.calculate.mockReturnValue(1695.36);
      calculationRepository.create.mockReturnValue(mockCalculation);
      calculationRepository.save.mockResolvedValue(mockCalculation);

      const result = await service.calculate(
        CalculationType.TDEE,
        'patient-1',
        { weight: 70, height: 1.75, age: 30, sex: 'M', activityLevel: 1.5 }
      );

      expect(result).toEqual(mockCalculation);
      expect(bmrCalculator.calculate).toHaveBeenCalledWith(70, 1.75, 30, 'M');
      expect(calculationRepository.create).toHaveBeenCalledWith({
        patient: mockPatient,
        user: null,
        calculationType: CalculationType.TDEE,
        inputData: { weight: 70, height: 1.75, age: 30, sex: 'M', activityLevel: 1.5 },
        results: { tdee: 2543.04 },
      });
    });

    it('deve falhar quando paciente não encontrado', async () => {
      patientRepository.findOne.mockResolvedValue(null);

      await expect(
        service.calculate(
          CalculationType.BMI,
          'patient-inexistente',
          { weight: 70, height: 1.75 }
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('deve calcular TDEE corretamente com activityLevel', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      const bmrValue = 1695.36;
      const activityLevel = 1.5;
      const expectedTdee = bmrValue * activityLevel;

      patientRepository.findOne.mockResolvedValue(mockPatient);
      bmrCalculator.calculate.mockReturnValue(bmrValue);
      calculationRepository.create.mockReturnValue({});
      calculationRepository.save.mockResolvedValue({});

      await service.calculate(
        CalculationType.TDEE,
        'patient-1',
        { weight: 70, height: 1.75, age: 30, sex: 'M', activityLevel }
      );

      expect(calculationRepository.create).toHaveBeenCalledWith({
        patient: mockPatient,
        user: null,
        calculationType: CalculationType.TDEE,
        inputData: { weight: 70, height: 1.75, age: 30, sex: 'M', activityLevel },
        results: { tdee: expectedTdee },
      });
    });
  });
});
