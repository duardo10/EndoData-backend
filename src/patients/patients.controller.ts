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
  Query,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientsDto } from './dto/search-patients.dto';

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
   * Verifica se há parâmetros de busca fornecidos.
   * @param searchDto Objeto com parâmetros de busca.
   * @returns true se há pelo menos um parâmetro de busca fornecido.
   */
  private hasSearchParams(searchDto?: SearchPatientsDto): boolean {
    if (!searchDto) return false;
    
    return !!(
      searchDto.searchText ||
      searchDto.name ||
      searchDto.cpf ||
      searchDto.minAge !== undefined ||
      searchDto.maxAge !== undefined ||
      searchDto.gender ||
      searchDto.sortBy ||
      searchDto.sortOrder ||
      (searchDto.page !== undefined && searchDto.page !== 1) ||
      (searchDto.limit !== undefined && searchDto.limit !== 10)
    );
  }

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
   * Lista pacientes com filtros opcionais e paginação.
   * 
   * @description Endpoint unificado que pode ser usado de duas formas:
   * 1. Sem parâmetros: retorna todos os pacientes ativos
   * 2. Com query parameters: aplica filtros, ordenação e paginação
   * 
   * @param searchDto Filtros opcionais de busca (nome, CPF, idade, gênero, busca por texto livre, ordenação e paginação).
   * @returns Lista de pacientes com ou sem filtros aplicados.
   */
  @Get()
  findAll(@Query() searchDto?: SearchPatientsDto) {
    // Se não há parâmetros de busca, usa o método simples
    if (!this.hasSearchParams(searchDto)) {
      return this.patientsService.findAll();
    }
    
    // Se há parâmetros de busca, usa o método avançado
    return this.patientsService.search(searchDto);
  }

  /**
   * Busca pacientes com filtros avançados.
   * @param searchDto Filtros de busca (nome, CPF, idade, gênero) e paginação.
   * @returns Resultado da busca com paginação, incluindo total de registros.
   */
  @Get('search')
  search(@Query() searchDto: SearchPatientsDto) {
    return this.patientsService.search(searchDto);
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
   * Retorna detalhes completos do paciente: dados, cálculos e prescrições.
   */
  @Get(':id/complete')
  findComplete(@Param('id') id: string) {
    return this.patientsService.findComplete(id);
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
