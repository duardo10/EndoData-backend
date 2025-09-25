import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { MetabolicService } from './metabolic.service';
import { CreateCalculationDto } from './dto/create-calculation.dto';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

/**
 * Controller responsável pelos endpoints de cálculos metabólicos.
 * 
 * Expõe rotas REST para criação e listagem de cálculos metabólicos
 * (IMC, BMR, TDEE) associados a pacientes específicos. Não implementa
 * a lógica matemática dos cálculos, apenas persiste e recupera registros.
 * 
 * @class MetabolicController
 * @route /patients/:patientId/calculations
 */
@ApiTags('metabolic')
@Controller('patients/:patientId/calculations')
@ApiBearerAuth('bearer')
export class MetabolicController {
  /**
   * Injeta o serviço de cálculos metabólicos.
   * @param metabolicService Instância de MetabolicService
   */
  constructor(private readonly metabolicService: MetabolicService) {}

  /**
   * Cria um novo cálculo metabólico para um paciente específico.
   * 
   * @param patientId Identificador único do paciente
   * @param dto Dados do cálculo a ser criado
   * @param userId Identificador do usuário autenticado
   * @returns Cálculo metabólico criado com sucesso
   * 
   * @throws {NotFoundException} Quando paciente não for encontrado
   * @throws {NotFoundException} Quando usuário não for encontrado
   */
  @Post()
  @ApiOperation({ 
    summary: 'Criar cálculo metabólico',
    description: 'Cria um novo registro de cálculo metabólico (IMC, BMR ou TDEE) para um paciente específico'
  })
  @ApiParam({ 
    name: 'patientId', 
    description: 'Identificador único do paciente',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({
    description: 'Exemplos de body para cálculos metabólicos',
    examples: {
      bmi: {
        summary: 'IMC',
        value: {
          patientId: 'uuid-do-paciente',
          userId: 'uuid-do-usuario',
          calculationType: 'BMI',
          inputData: { weight: 70, height: 1.75 }
        }
      },
      bmr: {
        summary: 'BMR',
        value: {
          patientId: 'uuid-do-paciente',
          userId: 'uuid-do-usuario',
          calculationType: 'BMR',
          inputData: { weight: 70, height: 1.75, age: 30, sex: 'M' }
        }
      },
      tdee: {
        summary: 'TDEE',
        value: {
          patientId: 'uuid-do-paciente',
          userId: 'uuid-do-usuario',
          calculationType: 'TDEE',
          inputData: { weight: 70, height: 1.75, age: 30, sex: 'M', activityLevel: 1.55 }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Cálculo metabólico criado com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Paciente ou usuário não encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos fornecidos' 
  })
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateCalculationDto,
    @CurrentUser('id') userId: CurrentUserData['id'],
  ) {
    return this.metabolicService.createForPatient(patientId, dto, userId);
  }

  /**
   * Lista todos os cálculos metabólicos de um paciente específico.
   * 
   * @param patientId Identificador único do paciente
   * @returns Lista de cálculos metabólicos ordenados por data de criação (mais recentes primeiro)
   * 
   * @throws {NotFoundException} Quando paciente não for encontrado
   */
  @Get()
  @ApiOperation({ 
    summary: 'Listar cálculos metabólicos',
    description: 'Retorna todos os cálculos metabólicos realizados para um paciente específico'
  })
  @ApiParam({ 
    name: 'patientId', 
    description: 'Identificador único do paciente',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cálculos metabólicos retornada com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Paciente não encontrado' 
  })
  async list(@Param('patientId') patientId: string) {
    return this.metabolicService.listByPatient(patientId);
  }
}


