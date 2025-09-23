import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MetabolicService } from './metabolic.service';
import { CreateCalculationDto } from './dto/create-calculation.dto';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

/**
 * Controller com endpoints REST para criar e listar cálculos por paciente.
 * Não realiza a computação dos cálculos; apenas persiste e lê registros.
 */
@Controller('patients/:patientId/calculations')
export class MetabolicController {
  constructor(private readonly metabolicService: MetabolicService) {}

  @Post()
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateCalculationDto,
    @CurrentUser('id') userId: CurrentUserData['id'],
  ) {
    return this.metabolicService.createForPatient(patientId, dto, userId);
  }

  @Get()
  async list(@Param('patientId') patientId: string) {
    return this.metabolicService.listByPatient(patientId);
  }
}


