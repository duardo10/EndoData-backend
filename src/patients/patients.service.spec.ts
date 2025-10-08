import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { MetabolicCalculation } from '../metabolic/entities/metabolic-calculation.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { PatientGender } from './entities/patient.entity';
import { BloodType } from './entities/patient.entity';
import { createMockRepository } from '../../test/mocks/typeorm-mocks';

describe('PatientsService', () => {
  let service: PatientsService;
  let patientsRepository: any;
  let usersRepository: any;
  let calculationsRepository: any;
  let prescriptionsRepository: any;

  beforeEach(async () => {
    const mockPatientsRepository = createMockRepository<Patient>();
    const mockUsersRepository = createMockRepository<User>();
    const mockCalculationsRepository = createMockRepository<MetabolicCalculation>();
    const mockPrescriptionsRepository = createMockRepository<Prescription>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(MetabolicCalculation),
          useValue: mockCalculationsRepository,
        },
        {
          provide: getRepositoryToken(Prescription),
          useValue: mockPrescriptionsRepository,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    patientsRepository = module.get(getRepositoryToken(Patient));
    usersRepository = module.get(getRepositoryToken(User));
    calculationsRepository = module.get(getRepositoryToken(MetabolicCalculation));
    prescriptionsRepository = module.get(getRepositoryToken(Prescription));
  });

  afterEach(() => {
    patientsRepository.resetMocks();
    usersRepository.resetMocks();
    calculationsRepository.resetMocks();
    prescriptionsRepository.resetMocks();
  });

  describe('create', () => {
    it('deve criar paciente com sucesso', async () => {
      const mockUser = { id: 'user-1', name: 'Médico Teste' };
      const mockPatient = {
        id: 'patient-1',
        name: 'Paciente Teste',
        cpf: '12345678900',
        birthDate: '1990-01-01',
        gender: PatientGender.MALE,
        user: mockUser,
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      patientsRepository.findOne
        .mockResolvedValueOnce(null) // cpf check
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null); // phone check
      patientsRepository.create.mockReturnValue(mockPatient);
      patientsRepository.save.mockResolvedValue(mockPatient);

      const result = await service.create({
        name: 'Paciente Teste',
        cpf: '123.456.789-00',
        birthDate: '1990-01-01',
        gender: PatientGender.MALE,
        userId: 'user-1',
      });

      expect(result).toEqual(mockPatient);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('deve falhar quando usuário não encontrado', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Paciente Teste',
          cpf: '123.456.789-00',
          birthDate: '1990-01-01',
          gender: PatientGender.MALE,
          userId: 'user-inexistente',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar quando CPF já cadastrado', async () => {
      const mockUser = { id: 'user-1', name: 'Médico Teste' };
      usersRepository.findOne.mockResolvedValue(mockUser);
      patientsRepository.findOne.mockResolvedValue({ id: 'exists' });

      await expect(
        service.create({
          name: 'Paciente Teste',
          cpf: '123.456.789-00',
          birthDate: '1990-01-01',
          gender: PatientGender.MALE,
          userId: 'user-1',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve falhar quando email já cadastrado', async () => {
      const mockUser = { id: 'user-1', name: 'Médico Teste' };
      usersRepository.findOne.mockResolvedValue(mockUser);
      patientsRepository.findOne
        .mockResolvedValueOnce(null) // cpf check
        .mockResolvedValueOnce({ id: 'exists' }); // email check

      await expect(
        service.create({
          name: 'Paciente Teste',
          cpf: '123.456.789-00',
          birthDate: '1990-01-01',
          gender: PatientGender.MALE,
          email: 'test@example.com',
          userId: 'user-1',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve falhar quando telefone já cadastrado', async () => {
      const mockUser = { id: 'user-1', name: 'Médico Teste' };
      usersRepository.findOne.mockResolvedValue(mockUser);
      patientsRepository.findOne
        .mockResolvedValueOnce(null) // cpf check
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 'exists' }); // phone check

      await expect(
        service.create({
          name: 'Paciente Teste',
          cpf: '123.456.789-00',
          birthDate: '1990-01-01',
          gender: PatientGender.MALE,
          phone: '11999999999',
          userId: 'user-1',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve normalizar CPF corretamente', async () => {
      const mockUser = { id: 'user-1', name: 'Médico Teste' };
      const mockPatient = { id: 'patient-1', cpf: '12345678900' };

      usersRepository.findOne.mockResolvedValue(mockUser);
      patientsRepository.findOne.mockResolvedValue(null);
      patientsRepository.create.mockReturnValue(mockPatient);
      patientsRepository.save.mockResolvedValue(mockPatient);

      await service.create({
        name: 'Paciente Teste',
        cpf: '123.456.789-00',
        birthDate: '1990-01-01',
        gender: PatientGender.MALE,
        userId: 'user-1',
      });

      expect(patientsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cpf: '12345678900',
        })
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os pacientes', async () => {
      const mockPatients = [
        {
          id: 'patient-1',
          name: 'Paciente 1',
          cpf: '12345678900',
          user: { id: 'user-1', name: 'Médico 1' },
        },
        {
          id: 'patient-2',
          name: 'Paciente 2',
          cpf: '98765432100',
          user: { id: 'user-2', name: 'Médico 2' },
        },
      ];

      patientsRepository.find.mockResolvedValue(mockPatients);

      const result = await service.findAll();

      expect(result).toEqual(mockPatients);
      expect(patientsRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        select: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar paciente encontrado', async () => {
      const mockPatient = {
        id: 'patient-1',
        name: 'Paciente Teste',
        cpf: '12345678900',
        user: { id: 'user-1', name: 'Médico Teste' },
      };

      patientsRepository.findOne.mockResolvedValue(mockPatient);

      const result = await service.findOne('patient-1');

      expect(result).toEqual(mockPatient);
      expect(patientsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'patient-1' },
        relations: ['user'],
        select: expect.any(Object),
      });
    });

    it('deve falhar quando paciente não encontrado', async () => {
      patientsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('patient-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar paciente com sucesso', async () => {
      const mockPatient = {
        id: 'patient-1',
        name: 'Paciente Original',
        cpf: '12345678900',
        email: 'original@example.com',
      };

      patientsRepository.findOne.mockResolvedValue(mockPatient);
      patientsRepository.save.mockResolvedValue({ ...mockPatient, name: 'Paciente Atualizado' });

      const result = await service.update('patient-1', {
        name: 'Paciente Atualizado',
      });

      expect(result.name).toBe('Paciente Atualizado');
      expect(patientsRepository.save).toHaveBeenCalled();
    });

    it('deve falhar quando paciente não encontrado', async () => {
      patientsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('patient-inexistente', { name: 'Novo Nome' })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve validar unicidade de CPF na atualização', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      patientsRepository.findOne
        .mockResolvedValueOnce(mockPatient) // findOne for update
        .mockResolvedValueOnce({ id: 'other-patient' }); // cpf uniqueness check

      await expect(
        service.update('patient-1', {
          cpf: '987.654.321-00',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve validar unicidade de email na atualização', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      patientsRepository.findOne
        .mockResolvedValueOnce(mockPatient) // findOne for update
        .mockResolvedValueOnce({ id: 'other-patient' }); // email uniqueness check

      await expect(
        service.update('patient-1', {
          email: 'other@example.com',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve validar unicidade de telefone na atualização', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      patientsRepository.findOne
        .mockResolvedValueOnce(mockPatient) // findOne for update
        .mockResolvedValueOnce({ id: 'other-patient' }); // phone uniqueness check

      await expect(
        service.update('patient-1', {
          phone: '11888888888',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('deve remover paciente com sucesso', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      patientsRepository.findOne.mockResolvedValue(mockPatient);
      patientsRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('patient-1');

      expect(patientsRepository.softDelete).toHaveBeenCalledWith('patient-1');
    });

    it('deve falhar quando paciente não encontrado', async () => {
      patientsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('patient-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('deve restaurar paciente deletado', async () => {
      const mockPatient = {
        id: 'patient-1',
        name: 'Paciente Teste',
        deletedAt: new Date(),
      };

      patientsRepository.findOne.mockResolvedValue(mockPatient);
      patientsRepository.restore.mockResolvedValue({ affected: 1 });
      patientsRepository.findOne.mockResolvedValueOnce(mockPatient); // for findOne after restore

      const result = await service.restore('patient-1');

      expect(patientsRepository.restore).toHaveBeenCalledWith('patient-1');
    });

    it('deve falhar quando paciente não encontrado', async () => {
      patientsRepository.findOne.mockResolvedValue(null);

      await expect(service.restore('patient-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve falhar quando paciente não está deletado', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste', deletedAt: null };
      patientsRepository.findOne.mockResolvedValue(mockPatient);

      await expect(service.restore('patient-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('findByCpf', () => {
    it('deve encontrar paciente por CPF', async () => {
      const mockPatient = {
        id: 'patient-1',
        name: 'Paciente Teste',
        cpf: '12345678900',
      };

      patientsRepository.findOne.mockResolvedValue(mockPatient);

      const result = await service.findByCpf('123.456.789-00');

      expect(result).toEqual(mockPatient);
      expect(patientsRepository.findOne).toHaveBeenCalledWith({
        where: { cpf: '12345678900' },
        relations: ['user'],
      });
    });

    it('deve falhar quando paciente não encontrado por CPF', async () => {
      patientsRepository.findOne.mockResolvedValue(null);

      await expect(service.findByCpf('999.999.999-99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('deve encontrar pacientes por usuário', async () => {
      const mockPatients = [
        { id: 'patient-1', name: 'Paciente 1', user: { id: 'user-1' } },
        { id: 'patient-2', name: 'Paciente 2', user: { id: 'user-1' } },
      ];

      patientsRepository.find.mockResolvedValue(mockPatients);

      const result = await service.findByUser('user-1');

      expect(result).toEqual(mockPatients);
      expect(patientsRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
        relations: ['user'],
        select: expect.any(Object),
      });
    });
  });

  describe('search', () => {
    it('deve buscar pacientes com filtros', async () => {
      const mockPatients = [
        { id: 'patient-1', name: 'João Silva' },
        { id: 'patient-2', name: 'João Santos' },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockPatients, 2]),
      };

      patientsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search({
        searchText: 'João',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        patients: mockPatients,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('deve aplicar filtro por idade', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      patientsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.search({
        minAge: 18,
        maxAge: 65,
        page: 1,
        limit: 10,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findComplete', () => {
    it('deve retornar visão completa do paciente', async () => {
      const mockPatient = { id: 'patient-1', name: 'Paciente Teste' };
      const mockCalculations = [
        { id: 'calc-1', calculationType: 'BMI' },
        { id: 'calc-2', calculationType: 'BMR' },
      ];
      const mockPrescriptions = [
        { id: 'presc-1', status: 'ACTIVE' },
        { id: 'presc-2', status: 'COMPLETED' },
      ];

      patientsRepository.findOne.mockResolvedValue(mockPatient);
      calculationsRepository.find.mockResolvedValue(mockCalculations);
      prescriptionsRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPrescriptions),
      });

      const result = await service.findComplete('patient-1');

      expect(result).toEqual({
        patient: mockPatient,
        calculations: mockCalculations,
        prescriptions: mockPrescriptions,
      });
    });

    it('deve falhar quando paciente não encontrado na visão completa', async () => {
      patientsRepository.findOne.mockResolvedValue(null);

      await expect(service.findComplete('patient-inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});
