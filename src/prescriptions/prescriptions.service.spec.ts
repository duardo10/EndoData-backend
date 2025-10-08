/**
 * Testes Unitários - PrescriptionsService
 * 
 * Suite completa de testes para o serviço de prescrições médicas.
 * Testa todas as operações CRUD e validações de negócio.
 * 
 * @testCoverage
 * - Criação de prescrições com validações
 * - Busca de prescrições por paciente
 * - Busca de prescrição individual
 * - Atualização de status
 * - Validações de relacionamentos
 * - Tratamento de erros e exceções
 * 
 * @mockStrategy
 * - Repositórios mockados com jest
 * - Isolamento completo de dependências
 * - Testes de comportamento e não implementação
 * 
 * @testTypes
 * - Unit Tests: Lógica de negócio isolada
 * - Error Handling: Cenários de exceção
 * - Validation Tests: Regras de validação
 * 
 * @author Sistema EndoData
 * @since 2025-09-24
 * @version 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { PrescriptionMedication } from './entities/prescription-medication.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let prescriptionRepository: jest.Mocked<Repository<Prescription>>;
  let medicationRepository: jest.Mocked<Repository<PrescriptionMedication>>;
  let patientRepository: jest.Mocked<Repository<Patient>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        {
          provide: getRepositoryToken(Prescription),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PrescriptionMedication),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Patient),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
    prescriptionRepository = module.get(getRepositoryToken(Prescription));
    medicationRepository = module.get(getRepositoryToken(PrescriptionMedication));
    patientRepository = module.get(getRepositoryToken(Patient));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPrescriptionDto: CreatePrescriptionDto = {
      patientId: 'patient-uuid',
      userId: 'user-uuid',
      status: PrescriptionStatus.ACTIVE,
      notes: 'Test notes',
      medications: [
        {
          medicationName: 'Paracetamol',
          dosage: '500mg',
          frequency: '3x ao dia',
          duration: '7 dias',
        },
      ],
    };

    const mockPatient = { id: 'patient-uuid', name: 'Test Patient' };
    const mockUser = { id: 'user-uuid', name: 'Dr. Test' };
    const mockPrescription = { 
      id: 'prescription-uuid', 
      ...createPrescriptionDto,
      patient: mockPatient,
      user: mockUser,
      createdAt: new Date(),
    };

    it('should create a prescription successfully', async () => {
      patientRepository.findOne.mockResolvedValue(mockPatient as Patient);
      userRepository.findOne.mockResolvedValue(mockUser as User);
      medicationRepository.create.mockReturnValue(createPrescriptionDto.medications[0] as any);
      prescriptionRepository.create.mockReturnValue(mockPrescription as any);
      prescriptionRepository.save.mockResolvedValue(mockPrescription as any);

      const result = await service.create(createPrescriptionDto);

      expect(result).toEqual(mockPrescription);
      expect(patientRepository.findOne).toHaveBeenCalledWith({ where: { id: 'patient-uuid' } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-uuid' } });
      expect(prescriptionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if patient not found', async () => {
      patientRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPrescriptionDto)).rejects.toThrow(
        new NotFoundException('Paciente com ID patient-uuid não encontrado')
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      patientRepository.findOne.mockResolvedValue(mockPatient as Patient);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPrescriptionDto)).rejects.toThrow(
        new NotFoundException('Usuário/Médico com ID user-uuid não encontrado')
      );
    });

    it('should throw BadRequestException if no medications provided', async () => {
      const invalidDto = { ...createPrescriptionDto, medications: [] };
      patientRepository.findOne.mockResolvedValue(mockPatient as Patient);
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException('A prescrição deve conter pelo menos um medicamento')
      );
    });
  });

  describe('findByPatient', () => {
    const patientId = 'patient-uuid';
    const mockPatient = { id: patientId, name: 'Test Patient' };
    const mockPrescriptions = [
      { id: 'prescription-1', patient: mockPatient },
      { id: 'prescription-2', patient: mockPatient },
    ];

    it('should return prescriptions for a patient', async () => {
      patientRepository.findOne.mockResolvedValue(mockPatient as Patient);
      prescriptionRepository.find.mockResolvedValue(mockPrescriptions as Prescription[]);

      const result = await service.findByPatient(patientId);

      expect(result).toEqual(mockPrescriptions);
      expect(prescriptionRepository.find).toHaveBeenCalledWith({
        where: { patient: { id: patientId } },
        relations: ['patient', 'user', 'medications'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException if patient not found', async () => {
      patientRepository.findOne.mockResolvedValue(null);

      await expect(service.findByPatient(patientId)).rejects.toThrow(
        new NotFoundException(`Paciente com ID ${patientId} não encontrado`)
      );
    });
  });

  describe('findOne', () => {
    const prescriptionId = 'prescription-uuid';
    const mockPrescription = { id: prescriptionId, status: PrescriptionStatus.ACTIVE };

    it('should return a prescription', async () => {
      prescriptionRepository.findOne.mockResolvedValue(mockPrescription as Prescription);

      const result = await service.findOne(prescriptionId);

      expect(result).toEqual(mockPrescription);
      expect(prescriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: prescriptionId },
        relations: ['patient', 'user', 'medications'],
      });
    });

    it('should throw NotFoundException if prescription not found', async () => {
      prescriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(prescriptionId)).rejects.toThrow(
        new NotFoundException(`Prescrição com ID ${prescriptionId} não encontrada`)
      );
    });
  });

  describe('updateStatus', () => {
    const prescriptionId = 'prescription-uuid';
    const mockPrescription = { 
      id: prescriptionId, 
      status: PrescriptionStatus.ACTIVE 
    };

    it('should update prescription status', async () => {
      const newStatus = PrescriptionStatus.COMPLETED;
      prescriptionRepository.findOne.mockResolvedValue(mockPrescription as Prescription);
      prescriptionRepository.save.mockResolvedValue({ 
        ...mockPrescription, 
        status: newStatus 
      } as Prescription);

      const result = await service.updateStatus(prescriptionId, newStatus);

      expect(result.status).toBe(newStatus);
      expect(prescriptionRepository.save).toHaveBeenCalled();
    });
  });
});