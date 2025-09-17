import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { CpfUtils } from '../common/decorators/is-cpf.decorator';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Cria um novo paciente com validações de unicidade.
   * @param createPatientDto Dados para criação do paciente
   * @returns Paciente criado
   */
  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Verificar se o usuário (médico) existe
    const user = await this.usersRepository.findOne({
      where: { id: createPatientDto.userId },
    });
    if (!user) {
      throw new NotFoundException('Usuário (médico) não encontrado.');
    }

    // Normalizar CPF (apenas dígitos)
    const normalizedCpf = CpfUtils.onlyDigits(createPatientDto.cpf);
    
    // Verificar se CPF já existe
    const existingCpf = await this.patientsRepository.findOne({
      where: { cpf: normalizedCpf },
      withDeleted: true, // Incluir registros soft deleted
    });
    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado.');
    }

    // Verificar se email já existe (se fornecido)
    if (createPatientDto.email) {
      const existingEmail = await this.patientsRepository.findOne({
        where: { email: createPatientDto.email },
        withDeleted: true,
      });
      if (existingEmail) {
        throw new ConflictException('E-mail já cadastrado.');
      }
    }

    // Verificar se telefone já existe (se fornecido)
    if (createPatientDto.phone) {
      const existingPhone = await this.patientsRepository.findOne({
        where: { phone: createPatientDto.phone },
        withDeleted: true,
      });
      if (existingPhone) {
        throw new ConflictException('Telefone já cadastrado.');
      }
    }

    const { userId, ...patientData } = createPatientDto;
    const patient = this.patientsRepository.create({
      ...patientData,
      cpf: normalizedCpf,
      user,
    });

    return this.patientsRepository.save(patient);
  }

  /**
   * Retorna todos os pacientes ativos (não deletados).
   * @returns Lista de pacientes
   */
  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find({
      relations: ['user'],
      select: {
        id: true,
        name: true,
        cpf: true,
        birthDate: true,
        gender: true,
        email: true,
        phone: true,
        weight: true,
        height: true,
        bloodType: true,
        medicalHistory: true,
        allergies: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          crm: true,
          especialidade: true,
        },
      },
    });
  }

  /**
   * Busca um paciente pelo ID (apenas ativos).
   * @param id ID do paciente
   * @returns Paciente encontrado
   */
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        id: true,
        name: true,
        cpf: true,
        birthDate: true,
        gender: true,
        email: true,
        phone: true,
        weight: true,
        height: true,
        bloodType: true,
        medicalHistory: true,
        allergies: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          crm: true,
          especialidade: true,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    return patient;
  }

  /**
   * Atualiza um paciente existente.
   * @param id ID do paciente
   * @param updatePatientDto Dados para atualização
   * @returns Paciente atualizado
   */
  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    // Verificar unicidade de CPF (se fornecido)
    if (updatePatientDto.cpf) {
      const normalizedCpf = CpfUtils.onlyDigits(updatePatientDto.cpf);
      const existingCpf = await this.patientsRepository.findOne({
        where: { cpf: normalizedCpf },
        withDeleted: true,
      });
      if (existingCpf && existingCpf.id !== id) {
        throw new ConflictException('CPF já cadastrado.');
      }
      updatePatientDto.cpf = normalizedCpf;
    }

    // Verificar unicidade de email (se fornecido)
    if (updatePatientDto.email) {
      const existingEmail = await this.patientsRepository.findOne({
        where: { email: updatePatientDto.email },
        withDeleted: true,
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('E-mail já cadastrado.');
      }
    }

    // Verificar unicidade de telefone (se fornecido)
    if (updatePatientDto.phone) {
      const existingPhone = await this.patientsRepository.findOne({
        where: { phone: updatePatientDto.phone },
        withDeleted: true,
      });
      if (existingPhone && existingPhone.id !== id) {
        throw new ConflictException('Telefone já cadastrado.');
      }
    }

    Object.assign(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  /**
   * Remove um paciente (soft delete).
   * @param id ID do paciente
   */
  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.softDelete(id);
  }

  /**
   * Restaura um paciente deletado.
   * @param id ID do paciente
   * @returns Paciente restaurado
   */
  async restore(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    if (!patient.deletedAt) {
      throw new ConflictException('Paciente não está deletado.');
    }

    await this.patientsRepository.restore(id);
    return this.findOne(id);
  }

  /**
   * Busca pacientes por CPF.
   * @param cpf CPF do paciente
   * @returns Paciente encontrado
   */
  async findByCpf(cpf: string): Promise<Patient> {
    const normalizedCpf = CpfUtils.onlyDigits(cpf);
    const patient = await this.patientsRepository.findOne({
      where: { cpf: normalizedCpf },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    return patient;
  }

  /**
   * Busca pacientes por médico (user).
   * @param userId ID do usuário/médico
   * @returns Lista de pacientes do médico
   */
  async findByUser(userId: string): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      select: {
        id: true,
        name: true,
        cpf: true,
        birthDate: true,
        gender: true,
        email: true,
        phone: true,
        weight: true,
        height: true,
        bloodType: true,
        medicalHistory: true,
        allergies: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          crm: true,
          especialidade: true,
        },
      },
    });
  }
}
