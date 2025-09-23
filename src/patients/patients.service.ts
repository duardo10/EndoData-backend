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
  /**
   * Serviço que encapsula as regras de negócio de pacientes.
   */
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Cria um novo paciente com validações de unicidade.
   * 
   * @description Esta função cria um novo paciente no sistema, realizando validações
   * de unicidade para CPF, email e telefone. Também verifica se o usuário (médico)
   * associado existe antes de criar o paciente.
   * 
   * @param {CreatePatientDto} createPatientDto - Dados para criação do paciente
   * @param {string} createPatientDto.name - Nome completo do paciente
   * @param {string} createPatientDto.cpf - CPF do paciente (será normalizado)
   * @param {string} createPatientDto.birthDate - Data de nascimento (formato ISO)
   * @param {PatientGender} createPatientDto.gender - Gênero do paciente
   * @param {string} [createPatientDto.email] - Email do paciente (opcional)
   * @param {string} [createPatientDto.phone] - Telefone do paciente (opcional)
   * @param {string} [createPatientDto.neighborhood] - Bairro do paciente (opcional)
   * @param {string} [createPatientDto.city] - Cidade do paciente (opcional)
   * @param {string} [createPatientDto.state] - Estado do paciente (opcional)
   * @param {string} [createPatientDto.weight] - Peso do paciente (opcional)
   * @param {string} [createPatientDto.height] - Altura do paciente (opcional)
   * @param {BloodType} [createPatientDto.bloodType] - Tipo sanguíneo (opcional)
   * @param {string} [createPatientDto.medicalHistory] - Histórico médico (opcional)
   * @param {string} [createPatientDto.allergies] - Alergias conhecidas (opcional)
   * @param {string} createPatientDto.userId - ID do usuário/médico responsável
   * 
   * @returns {Promise<Patient>} Paciente criado com todos os dados
   * 
   * @throws {NotFoundException} Quando o usuário (médico) não é encontrado
   * @throws {ConflictException} Quando CPF, email ou telefone já estão cadastrados
   * 
   * @example
   * ```typescript
   * const newPatient = await patientsService.create({
   *   name: 'João Silva',
   *   cpf: '123.456.789-00',
   *   birthDate: '1990-01-01',
   *   gender: PatientGender.MALE,
   *   email: 'joao@email.com',
   *   phone: '11999999999',
   *   userId: 'uuid-do-medico'
   * });
   * ```
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
   * 
   * @description Esta função busca todos os pacientes que não foram deletados
   * (soft delete), incluindo informações do médico responsável. Os dados são
   * retornados com campos selecionados para otimizar a performance.
   * 
   * @returns {Promise<Patient[]>} Lista de todos os pacientes ativos
   * 
   * @example
   * ```typescript
   * const patients = await patientsService.findAll();
   * console.log(`Encontrados ${patients.length} pacientes`);
   * ```
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
   * 
   * @description Esta função busca um paciente específico pelo seu ID único,
   * incluindo informações do médico responsável. Apenas pacientes não deletados
   * são retornados (soft delete).
   * 
   * @param {string} id - ID único do paciente (UUID)
   * 
   * @returns {Promise<Patient>} Paciente encontrado com dados completos
   * 
   * @throws {NotFoundException} Quando o paciente não é encontrado
   * 
   * @example
   * ```typescript
   * const patient = await patientsService.findOne('uuid-do-paciente');
   * console.log(`Paciente: ${patient.name}`);
   * ```
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
   * 
   * @description Esta função atualiza os dados de um paciente existente,
   * realizando validações de unicidade para CPF, email e telefone. Apenas
   * os campos fornecidos no DTO são atualizados (atualização parcial).
   * 
   * @param {string} id - ID único do paciente (UUID)
   * @param {UpdatePatientDto} updatePatientDto - Dados para atualização
   * @param {string} [updatePatientDto.name] - Nome completo do paciente (opcional)
   * @param {string} [updatePatientDto.cpf] - CPF do paciente (opcional)
   * @param {string} [updatePatientDto.birthDate] - Data de nascimento (opcional)
   * @param {PatientGender} [updatePatientDto.gender] - Gênero do paciente (opcional)
   * @param {string} [updatePatientDto.email] - Email do paciente (opcional)
   * @param {string} [updatePatientDto.phone] - Telefone do paciente (opcional)
   * @param {string} [updatePatientDto.neighborhood] - Bairro do paciente (opcional)
   * @param {string} [updatePatientDto.city] - Cidade do paciente (opcional)
   * @param {string} [updatePatientDto.state] - Estado do paciente (opcional)
   * @param {string} [updatePatientDto.weight] - Peso do paciente (opcional)
   * @param {string} [updatePatientDto.height] - Altura do paciente (opcional)
   * @param {BloodType} [updatePatientDto.bloodType] - Tipo sanguíneo (opcional)
   * @param {string} [updatePatientDto.medicalHistory] - Histórico médico (opcional)
   * @param {string} [updatePatientDto.allergies] - Alergias conhecidas (opcional)
   * @param {string} [updatePatientDto.userId] - ID do usuário/médico (opcional)
   * 
   * @returns {Promise<Patient>} Paciente atualizado com os novos dados
   * 
   * @throws {NotFoundException} Quando o paciente não é encontrado
   * @throws {ConflictException} Quando CPF, email ou telefone já estão cadastrados para outro paciente
   * 
   * @example
   * ```typescript
   * const updatedPatient = await patientsService.update('uuid-do-paciente', {
   *   name: 'João Silva Santos',
   *   phone: '11988888888'
   * });
   * ```
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
   * 
   * @description Esta função remove um paciente do sistema utilizando soft delete,
   * ou seja, o registro não é fisicamente removido do banco de dados, apenas
   * marcado como deletado. O paciente pode ser restaurado posteriormente.
   * 
   * @param {string} id - ID único do paciente (UUID)
   * 
   * @returns {Promise<void>} Não retorna valor (void)
   * 
   * @throws {NotFoundException} Quando o paciente não é encontrado
   * 
   * @example
   * ```typescript
   * await patientsService.remove('uuid-do-paciente');
   * console.log('Paciente removido com sucesso');
   * ```
   */
  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.softDelete(id);
  }

  /**
   * Restaura um paciente deletado.
   * 
   * @description Esta função restaura um paciente que foi removido via soft delete,
   * tornando-o novamente ativo no sistema. Apenas pacientes que estão marcados
   * como deletados podem ser restaurados.
   * 
   * @param {string} id - ID único do paciente (UUID)
   * 
   * @returns {Promise<Patient>} Paciente restaurado com dados completos
   * 
   * @throws {NotFoundException} Quando o paciente não é encontrado
   * @throws {ConflictException} Quando o paciente não está deletado
   * 
   * @example
   * ```typescript
   * const restoredPatient = await patientsService.restore('uuid-do-paciente');
   * console.log(`Paciente ${restoredPatient.name} restaurado com sucesso`);
   * ```
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
   * 
   * @description Esta função busca um paciente específico pelo seu CPF,
   * incluindo informações do médico responsável. O CPF é normalizado
   * (apenas dígitos) antes da busca. Apenas pacientes ativos são retornados.
   * 
   * @param {string} cpf - CPF do paciente (com ou sem formatação)
   * 
   * @returns {Promise<Patient>} Paciente encontrado com dados completos
   * 
   * @throws {NotFoundException} Quando o paciente não é encontrado
   * 
   * @example
   * ```typescript
   * const patient = await patientsService.findByCpf('123.456.789-00');
   * console.log(`Paciente encontrado: ${patient.name}`);
   * ```
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
   * 
   * @description Esta função busca todos os pacientes associados a um médico
   * específico, incluindo informações do médico responsável. Apenas pacientes
   * ativos são retornados (não deletados via soft delete).
   * 
   * @param {string} userId - ID único do usuário/médico (UUID)
   * 
   * @returns {Promise<Patient[]>} Lista de pacientes do médico
   * 
   * @example
   * ```typescript
   * const doctorPatients = await patientsService.findByUser('uuid-do-medico');
   * console.log(`Médico possui ${doctorPatients.length} pacientes`);
   * ```
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
