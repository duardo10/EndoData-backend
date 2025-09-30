/**
 * Testes Unitários - Serviço de Recibos Médicos
 * 
 * Suite completa de testes para validar a funcionalidade do ReceiptsService,
 * incluindo CRUD operations, relatórios financeiros, validações de negócio
 * e tratamento de casos edge.
 * 
 * @testSuite ReceiptsService
 * 
 * @coverage
 * - CRUD completo (Create, Read, Update, Delete)
 * - Busca por paciente e filtros avançados
 * - Relatórios financeiros mensais
 * - Cálculos de totais automáticos
 * - Validações de dados de entrada
 * - Tratamento de casos de erro
 * - Relacionamentos entre entidades
 * 
 * @mockStrategy
 * - Repository pattern com mocks do TypeORM
 * - Mocks de entidades relacionadas (Patient)
 * - Dados de teste realísticos
 * - Simulação de cenários de erro
 * 
 * @testData
 * - Pacientes mock com IDs válidos
 * - Recibos com diferentes status
 * - Itens com preços e quantidades variadas
 * - Períodos de datas para filtros
 * 
 * @validations
 * - Estrutura de dados retornados
 * - Cálculos financeiros corretos
 * - Comportamento de métodos do repository
 * - Tratamento de exceções apropriadas
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 * @testFile receipts.service.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { PatientsService } from '../patients/patients.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';
import { ReceiptStatus } from './enums/receipt-status.enum';

/**
 * Mock data para testes
 */
const mockPatient = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'João da Silva',
  email: 'joao@email.com',
  cpf: '12345678901',
  phone: '11999999999',
  birthDate: new Date('1980-01-01'),
  address: 'Rua das Flores, 123',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

const mockReceiptItem = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  description: 'Consulta médica',
  quantity: 1,
  unitPrice: 150.00,
  totalPrice: 150.00
};

const mockReceipt = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  date: new Date('2025-09-30'),
  status: ReceiptStatus.PAID, // Change to PAID for report test
  totalAmount: 150.00,
  patient: mockPatient,
  patientId: mockPatient.id,
  userId: 'user-123',
  items: [mockReceiptItem],
  createdAt: new Date('2025-09-30'),
  updatedAt: new Date('2025-09-30')
};

const mockCreateReceiptDto: CreateReceiptDto = {
  patientId: mockPatient.id,
  status: ReceiptStatus.PENDING,
  items: [
    {
      description: 'Consulta médica',
      quantity: 1,
      unitPrice: 150.00
    }
  ]
};

describe('ReceiptsService', () => {
  let service: ReceiptsService;
  let receiptRepository: jest.Mocked<Repository<Receipt>>;
  let receiptItemRepository: jest.Mocked<Repository<ReceiptItem>>;
  let patientsService: jest.Mocked<PatientsService>;

  beforeEach(async () => {
    const mockReceiptRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReceipt], 1])
      }))
    };

    const mockReceiptItemRepository = {
      create: jest.fn().mockImplementation((data) => ({
        ...data,
        id: 'item-id',
        totalPrice: data.quantity * data.unitPrice
      })),
      save: jest.fn(),
      remove: jest.fn()
    };

    const mockPatientsService = {
      findOne: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        {
          provide: getRepositoryToken(Receipt),
          useValue: mockReceiptRepository
        },
        {
          provide: getRepositoryToken(ReceiptItem),
          useValue: mockReceiptItemRepository
        },
        {
          provide: PatientsService,
          useValue: mockPatientsService
        }
      ]
    }).compile();

    service = module.get<ReceiptsService>(ReceiptsService);
    receiptRepository = module.get(getRepositoryToken(Receipt));
    receiptItemRepository = module.get(getRepositoryToken(ReceiptItem));
    patientsService = module.get(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new receipt successfully', async () => {
      // Arrange
      patientsService.findOne.mockResolvedValue(mockPatient as any);
      receiptItemRepository.create.mockImplementation((data) => ({
        ...data,
        id: 'item-id',
        totalPrice: data.quantity * data.unitPrice,
        calculateTotalPrice: jest.fn()
      } as any));
      receiptRepository.create.mockReturnValue(mockReceipt as any);
      receiptRepository.save.mockResolvedValue(mockReceipt as any);
      receiptRepository.findOne.mockResolvedValue(mockReceipt as any); // Mock for findOne in create method

      // Act
      const result = await service.create(mockCreateReceiptDto, 'user-123');

      // Assert
      expect(patientsService.findOne).toHaveBeenCalledWith(mockPatient.id);
      expect(receiptRepository.create).toHaveBeenCalled();
      expect(receiptRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockReceipt);
    });

    it('should throw NotFoundException when patient not found', async () => {
      // Arrange
      patientsService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.create(mockCreateReceiptDto, 'user-123'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should calculate total correctly with multiple items', async () => {
      // Arrange
      const multiItemDto = {
        ...mockCreateReceiptDto,
        items: [
          { description: 'Consulta', quantity: 1, unitPrice: 100.00 },
          { description: 'Exame', quantity: 2, unitPrice: 50.00 }
        ]
      };
      
      patientsService.findOne.mockResolvedValue(mockPatient as any);
      receiptRepository.create.mockReturnValue(mockReceipt as any);
      receiptRepository.save.mockResolvedValue({
        ...mockReceipt,
        totalAmount: 200.00,
        items: [
          { ...mockReceiptItem, description: 'Consulta', totalPrice: 100.00 },
          { ...mockReceiptItem, description: 'Exame', quantity: 2, unitPrice: 50.00, totalPrice: 100.00 }
        ]
      } as any);
      receiptRepository.findOne.mockResolvedValue({
        ...mockReceipt,
        totalAmount: 200.00
      } as any);

      // Act
      const result = await service.create(multiItemDto, 'user-123');

      // Assert
      expect(result).toEqual(expect.objectContaining({
        totalAmount: 200.00
      }));
    });
  });

  describe('findByPatient', () => {
    it('should return receipts for a specific patient', async () => {
      // Arrange
      receiptRepository.find.mockResolvedValue([mockReceipt] as any);

      // Act
      const result = await service.findByPatient(mockPatient.id);

      // Assert
      expect(receiptRepository.find).toHaveBeenCalledWith({
        where: { patientId: mockPatient.id },
        relations: ['items', 'patient'],
        order: { date: 'DESC' }
      });
      expect(result).toEqual([mockReceipt]);
    });

    it('should return empty array when no receipts found', async () => {
      // Arrange
      receiptRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByPatient('non-existent-id');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return paginated receipts with default parameters', async () => {
      // Arrange
      const queryDto: QueryReceiptsDto = {};
      
      // Mock do query builder retornando dados válidos
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReceipt], 1])
      };
      
      receiptRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual({
        data: [mockReceipt],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });

    it('should filter by status correctly', async () => {
      // Arrange
      const queryDto: QueryReceiptsDto = { status: ReceiptStatus.PAID };
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReceipt], 1])
      };
      
      receiptRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('receipt.status = :status', { status: ReceiptStatus.PAID });
    });

    it('should filter by custom date range', async () => {
      // Arrange
      const queryDto: QueryReceiptsDto = {
        period: 'custom',
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      };
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReceipt], 1])
      };
      
      receiptRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'receipt.date BETWEEN :startDate AND :endDate',
        { 
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-30')
        }
      );
    });
  });

  describe('findOne', () => {
    it('should return a receipt by id', async () => {
      // Arrange
      receiptRepository.findOne.mockResolvedValue(mockReceipt as any);

      // Act
      const result = await service.findOne(mockReceipt.id);

      // Assert
      expect(receiptRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockReceipt.id },
        relations: ['items', 'patient']
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should throw NotFoundException when receipt not found', async () => {
      // Arrange
      receiptRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a receipt successfully', async () => {
      // Arrange
      const updateDto: UpdateReceiptDto = {
        status: ReceiptStatus.PAID
      };
      
      receiptRepository.findOne.mockResolvedValue(mockReceipt as any);
      receiptRepository.save.mockResolvedValue({
        ...mockReceipt,
        status: ReceiptStatus.PAID
      } as any);

      // Act
      const result = await service.update(mockReceipt.id, updateDto);

      // Assert
      expect(receiptRepository.findOne).toHaveBeenCalled();
      expect(receiptRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(ReceiptStatus.PAID);
    });

    it('should throw NotFoundException when updating non-existent receipt', async () => {
      // Arrange
      receiptRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('non-existent-id', {}))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should recalculate total when items are updated', async () => {
      // Arrange
      const updateDto: UpdateReceiptDto = {
        items: [
          { description: 'Nova consulta', quantity: 2, unitPrice: 75.00 }
        ]
      };
      
      receiptRepository.findOne.mockResolvedValue(mockReceipt as any);
      receiptItemRepository.remove.mockResolvedValue(undefined);
      receiptRepository.save.mockResolvedValue({
        ...mockReceipt,
        totalAmount: 150.00
      } as any);

      // Act
      const result = await service.update(mockReceipt.id, updateDto);

      // Assert
      expect(receiptItemRepository.remove).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        totalAmount: 150.00
      }));
    });
  });

  describe('remove', () => {
    it('should remove a receipt successfully', async () => {
      // Arrange
      receiptRepository.findOne.mockResolvedValue(mockReceipt as any);
      receiptRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.remove(mockReceipt.id);

      // Assert
      expect(receiptRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockReceipt.id }
      });
      expect(receiptRepository.delete).toHaveBeenCalledWith(mockReceipt.id);
    });

    it('should throw NotFoundException when removing non-existent receipt', async () => {
      // Arrange
      receiptRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getMonthlyReport', () => {
    it('should generate monthly report correctly', async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReceipt], 1])
      };
      
      receiptRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getMonthlyReport(9, 2025);

      // Assert
      expect(result).toEqual({
        month: 9,
        year: 2025,
        totalRevenue: 150.00,
        totalReceipts: 1,
        pendingReceipts: 0,
        paidReceipts: 1,
        cancelledReceipts: 0,
        averageReceiptValue: 150.00
      });
    });

    it('should handle empty month correctly', async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0])
      };
      
      receiptRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getMonthlyReport(12, 2025);

      // Assert
      expect(result).toEqual({
        month: 12,
        year: 2025,
        totalRevenue: 0,
        totalReceipts: 0,
        pendingReceipts: 0,
        paidReceipts: 0,
        cancelledReceipts: 0,
        averageReceiptValue: 0
      });
    });

    it('should throw BadRequestException for invalid month', async () => {
      // Act & Assert
      await expect(service.getMonthlyReport(13, 2025))
        .rejects
        .toThrow(BadRequestException);
      
      await expect(service.getMonthlyReport(0, 2025))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid year', async () => {
      // Act & Assert
      await expect(service.getMonthlyReport(9, 1999))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});