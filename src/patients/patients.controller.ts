import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
export class PatientsController {
  /**
   * Controlador responsável pelas rotas de pacientes.
   * Disponibiliza endpoints para CRUD e consultas específicas.
   */
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * Cria um novo paciente.
   * @param createPatientDto Dados do paciente
   * @returns Paciente criado
   */
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  /**
   * Lista todos os pacientes ativos.
   * @returns Lista de pacientes
   */
  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  /**
   * Busca um paciente por ID.
   * @param id ID do paciente
   * @returns Paciente encontrado
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  /**
   * Busca um paciente por CPF.
   * @param cpf CPF do paciente
   * @returns Paciente encontrado
   */
  @Get('cpf/:cpf')
  findByCpf(@Param('cpf') cpf: string) {
    return this.patientsService.findByCpf(cpf);
  }

  /**
   * Busca pacientes por médico.
   * @param userId ID do usuário/médico
   * @returns Lista de pacientes do médico
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.patientsService.findByUser(userId);
  }

  /**
   * Atualiza um paciente.
   * @param id ID do paciente
   * @param updatePatientDto Dados para atualização
   * @returns Paciente atualizado
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  /**
   * Remove um paciente (soft delete).
   * @param id ID do paciente
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  /**
   * Restaura um paciente deletado.
   * @param id ID do paciente
   * @returns Paciente restaurado
   */
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.patientsService.restore(id);
  }
}
