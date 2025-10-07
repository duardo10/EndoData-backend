import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { Patient } from '../patients/entities/patient.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { Prescription, PrescriptionStatus } from '../prescriptions/entities/prescription.entity';
import { PrescriptionMedication } from '../prescriptions/entities/prescription-medication.entity';
import { createMockRepository } from '../../test/mocks/typeorm-mocks';

describe('DashboardService', () => {
  let service: DashboardService;
  let patientsRepository: any;
  let receiptsRepository: any;
  let prescriptionsRepository: any;
  let prescriptionMedicationsRepository: any;

  beforeEach(async () => {
    const mockPatientsRepository = createMockRepository<Patient>();
    const mockReceiptsRepository = createMockRepository<Receipt>();
    const mockPrescriptionsRepository = createMockRepository<Prescription>();
    const mockPrescriptionMedicationsRepository = createMockRepository<PrescriptionMedication>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientsRepository,
        },
        {
          provide: getRepositoryToken(Receipt),
          useValue: mockReceiptsRepository,
        },
        {
          provide: getRepositoryToken(Prescription),
          useValue: mockPrescriptionsRepository,
        },
        {
          provide: getRepositoryToken(PrescriptionMedication),
          useValue: mockPrescriptionMedicationsRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    patientsRepository = module.get(getRepositoryToken(Patient));
    receiptsRepository = module.get(getRepositoryToken(Receipt));
    prescriptionsRepository = module.get(getRepositoryToken(Prescription));
    prescriptionMedicationsRepository = module.get(getRepositoryToken(PrescriptionMedication));
  });

  afterEach(() => {
    patientsRepository.resetMocks();
    receiptsRepository.resetMocks();
    prescriptionsRepository.resetMocks();
    prescriptionMedicationsRepository.resetMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return dashboard summary for user', async () => {
      const userId = 'user-1';
      const mockSummary = {
        totalPatients: 10,
        patientsRegisteredToday: 2,
        patientsRegisteredThisWeek: 5,
      };

      patientsRepository.count
        .mockResolvedValueOnce(10) // total patients
        .mockResolvedValueOnce(2) // patients today
        .mockResolvedValueOnce(5); // patients this week

      const result = await service.getSummary(userId);

      expect(result).toEqual(mockSummary);
      expect(patientsRepository.count).toHaveBeenCalledTimes(3);
    });

    it('should handle zero patients correctly', async () => {
      const userId = 'user-1';

      patientsRepository.count
        .mockResolvedValueOnce(0) // total patients
        .mockResolvedValueOnce(0) // patients today
        .mockResolvedValueOnce(0); // patients this week

      const result = await service.getSummary(userId);

      expect(result).toEqual({
        totalPatients: 0,
        patientsRegisteredToday: 0,
        patientsRegisteredThisWeek: 0,
      });
    });
  });

  describe('getAdvancedMetrics', () => {
    it('should return advanced metrics for user', async () => {
      const userId = 'user-1';
      const mockMetrics = {
        totalPatients: 10,
        patientsRegisteredToday: 2,
        patientsRegisteredThisWeek: 5,
        monthlyRevenue: 1500.00,
        activePrescriptions: 8,
        monthlyReceipts: 12,
        averageReceiptValue: 125.00,
      };

      patientsRepository.count
        .mockResolvedValueOnce(10) // total patients
        .mockResolvedValueOnce(2) // patients today
        .mockResolvedValueOnce(5); // patients this week

      prescriptionsRepository.count.mockResolvedValue(8); // active prescriptions
      receiptsRepository.count.mockResolvedValue(12); // monthly receipts

      receiptsRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          count: '12',
          sum: '1500.00',
        }),
      });

      const result = await service.getAdvancedMetrics(userId);

      expect(result).toEqual(mockMetrics);
    });

    it('should handle zero revenue correctly', async () => {
      const userId = 'user-1';

      patientsRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      prescriptionsRepository.count.mockResolvedValue(0);
      receiptsRepository.count.mockResolvedValue(0);

      receiptsRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          count: '0',
          sum: null,
        }),
      });

      const result = await service.getAdvancedMetrics(userId);

      expect(result.monthlyRevenue).toBe(0);
      expect(result.averageReceiptValue).toBe(0);
    });
  });

  describe('getWeeklyPatientsChart', () => {
    it('should return weekly patients chart data', async () => {
      const userId = 'user-1';
      const weeksCount = 4;

      patientsRepository.count
        .mockResolvedValueOnce(2) // week 1
        .mockResolvedValueOnce(1) // week 2
        .mockResolvedValueOnce(3) // week 3
        .mockResolvedValueOnce(0); // week 4

      const result = await service.getWeeklyPatientsChart(userId, weeksCount);

      expect(result.data).toHaveLength(4);
      expect(result.totalWeeks).toBe(4);
      expect(result.generatedAt).toBeDefined();
      expect(patientsRepository.count).toHaveBeenCalledTimes(4);
    });

    it('should handle default weeks count', async () => {
      const userId = 'user-1';

      patientsRepository.count.mockResolvedValue(0);

      const result = await service.getWeeklyPatientsChart(userId);

      expect(result.data).toHaveLength(8); // default weeks count
      expect(result.totalWeeks).toBe(8);
    });

    it('should format week labels correctly', async () => {
      const userId = 'user-1';
      const weeksCount = 1;

      patientsRepository.count.mockResolvedValue(1);

      const result = await service.getWeeklyPatientsChart(userId, weeksCount);

      expect(result.data[0]).toHaveProperty('weekStart');
      expect(result.data[0]).toHaveProperty('weekEnd');
      expect(result.data[0]).toHaveProperty('weekLabel');
      expect(result.data[0]).toHaveProperty('newPatients');
    });
  });

  describe('getTopMedications', () => {
    it('should return top medications for user', async () => {
      const userId = 'user-1';
      const limit = 5;
      const periodInMonths = 6;

      const mockMedicationStats = [
        { medicationName: 'Paracetamol', prescription_count: '10' },
        { medicationName: 'Ibuprofeno', prescription_count: '8' },
        { medicationName: 'Amoxicilina', prescription_count: '5' },
      ];

      const mockTotalResult = { total: '50' };

      prescriptionMedicationsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue(mockMedicationStats),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockTotalResult),
        });

      const result = await service.getTopMedications(userId, limit, periodInMonths);

      expect(result.medications).toHaveLength(3);
      expect(result.totalPrescriptions).toBe(50);
      expect(result.period).toBe('Últimos 6 meses');
      expect(result.generatedAt).toBeDefined();
    });

    it('should handle empty medications list', async () => {
      const userId = 'user-1';

      prescriptionMedicationsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
        });

      const result = await service.getTopMedications(userId);

      expect(result.medications).toHaveLength(0);
      expect(result.totalPrescriptions).toBe(0);
    });

    it('should format period description correctly', async () => {
      const userId = 'user-1';

      prescriptionMedicationsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
        });

      const testCases = [
        { period: 1, expected: 'Último mês' },
        { period: 3, expected: 'Últimos 3 meses' },
        { period: 6, expected: 'Últimos 6 meses' },
        { period: 12, expected: 'Último ano' },
        { period: 24, expected: 'Últimos 24 meses' },
      ];

      for (const testCase of testCases) {
        const result = await service.getTopMedications(userId, 10, testCase.period);
        expect(result.period).toBe(testCase.expected);
      }
    });
  });

  describe('getMonthlyRevenueComparison', () => {
    it('should return monthly revenue comparison', async () => {
      const userId = 'user-1';

      const mockCurrentMonthResult = {
        totalRevenue: '2000.00',
        receiptCount: '10',
      };

      const mockPreviousMonthResult = {
        totalRevenue: '1500.00',
        receiptCount: '8',
      };

      receiptsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockCurrentMonthResult),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockPreviousMonthResult),
        });

      const result = await service.getMonthlyRevenueComparison(userId);

      expect(result.currentMonthRevenue).toBe(2000);
      expect(result.previousMonthRevenue).toBe(1500);
      expect(result.absoluteDifference).toBe(500);
      expect(result.percentageChange).toBeCloseTo(33.3, 1);
      expect(result.trend).toBe('Crescimento');
      expect(result.generatedAt).toBeDefined();
    });

    it('should handle zero previous month revenue', async () => {
      const userId = 'user-1';

      const mockCurrentMonthResult = {
        totalRevenue: '1000.00',
        receiptCount: '5',
      };

      const mockPreviousMonthResult = {
        totalRevenue: '0',
        receiptCount: '0',
      };

      receiptsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockCurrentMonthResult),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockPreviousMonthResult),
        });

      const result = await service.getMonthlyRevenueComparison(userId);

      expect(result.percentageChange).toBeNull();
      expect(result.trend).toBe('Sem comparação');
    });

    it('should handle stable revenue', async () => {
      const userId = 'user-1';

      const mockCurrentMonthResult = {
        totalRevenue: '1000.00',
        receiptCount: '5',
      };

      const mockPreviousMonthResult = {
        totalRevenue: '1000.00',
        receiptCount: '5',
      };

      receiptsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockCurrentMonthResult),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockPreviousMonthResult),
        });

      const result = await service.getMonthlyRevenueComparison(userId);

      expect(result.absoluteDifference).toBe(0);
      expect(result.percentageChange).toBe(0);
      expect(result.trend).toBe('Estável');
    });

    it('should handle revenue decline', async () => {
      const userId = 'user-1';

      const mockCurrentMonthResult = {
        totalRevenue: '800.00',
        receiptCount: '4',
      };

      const mockPreviousMonthResult = {
        totalRevenue: '1000.00',
        receiptCount: '5',
      };

      receiptsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockCurrentMonthResult),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockPreviousMonthResult),
        });

      const result = await service.getMonthlyRevenueComparison(userId);

      expect(result.absoluteDifference).toBe(-200);
      expect(result.percentageChange).toBe(-20);
      expect(result.trend).toBe('Queda');
    });

    it('should calculate average receipt values correctly', async () => {
      const userId = 'user-1';

      const mockCurrentMonthResult = {
        totalRevenue: '1000.00',
        receiptCount: '5',
      };

      const mockPreviousMonthResult = {
        totalRevenue: '800.00',
        receiptCount: '4',
      };

      receiptsRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockCurrentMonthResult),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockPreviousMonthResult),
        });

      const result = await service.getMonthlyRevenueComparison(userId);

      expect(result.currentMonthAverageReceipt).toBe(200);
      expect(result.previousMonthAverageReceipt).toBe(200);
    });
  });
});
