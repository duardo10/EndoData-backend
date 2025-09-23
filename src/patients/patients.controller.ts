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

/**
 * Controller responsável por gerenciar as rotas relacionadas a pacientes.
 * Disponibiliza endpoints REST para operações de CRUD, busca por CPF, busca por médico e restauração de pacientes.
 * Cada método está devidamente documentado para facilitar o entendimento e manutenção.
 */
@Controller('patients')
export class PatientsController {
  /**
   * Injeta o serviço de pacientes, responsável pela lógica de negócio.
   * @param patientsService Instância de PatientsService
   */
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * Cria um novo paciente no sistema.
   * @param createPatientDto Objeto contendo os dados necessários para criação do paciente.
   * @returns O paciente criado, incluindo seu ID e demais informações persistidas.
   */
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  /**
   * Lista todos os pacientes ativos cadastrados no sistema.
   * @returns Um array de objetos Patient representando todos os pacientes ativos.
   */
  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  /**
   * Busca um paciente pelo seu identificador único (ID).
   * @param id Identificador único do paciente.
   * @returns O paciente correspondente ao ID informado, caso exista.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  /**
   * Busca um paciente pelo seu CPF.
   * @param cpf CPF do paciente (apenas números ou formatado).
   * @returns O paciente correspondente ao CPF informado, caso exista.
   */
  @Get('cpf/:cpf')
  findByCpf(@Param('cpf') cpf: string) {
    return this.patientsService.findByCpf(cpf);
  }

  /**
   * Lista todos os pacientes associados a um determinado médico (usuário).
   * @param userId Identificador do usuário/médico.
   * @returns Um array de pacientes vinculados ao médico informado.
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.patientsService.findByUser(userId);
  }

  /**
   * Atualiza os dados de um paciente existente.
   * @param id Identificador único do paciente a ser atualizado.
   * @param updatePatientDto Objeto contendo os campos a serem atualizados.
   * @returns O paciente atualizado com os novos dados.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  /**
   * Remove (soft delete) um paciente do sistema, marcando-o como deletado sem excluir do banco.
   * @param id Identificador único do paciente a ser removido.
   * @returns Nenhum conteúdo em caso de sucesso.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  /**
   * Restaura um paciente previamente removido (soft delete).
   * @param id Identificador único do paciente a ser restaurado.
   * @returns O paciente restaurado, caso a operação seja bem-sucedida.
   */
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.patientsService.restore(id);
  }
}
