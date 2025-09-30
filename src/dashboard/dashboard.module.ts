import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Patient } from '../patients/entities/patient.entity';

/**
 * Módulo de Dashboard.
 *
 * Declara o controller e o service responsáveis por fornecer estatísticas
 * agregadas para a tela inicial. Importa a entidade `Patient` para permitir
 * consultas eficientes de contagem por período.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}


