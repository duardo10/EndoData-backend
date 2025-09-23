import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetabolicCalculation } from './entities/metabolic-calculation.entity';
import { MetabolicService } from './metabolic.service';
import { MetabolicController } from './metabolic.controller';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';

/**
 * Módulo responsável por operações de persistência e exposição de endpoints
 * de cálculos metabólicos (sem implementar as fórmulas em si).
 */
@Module({
  imports: [TypeOrmModule.forFeature([MetabolicCalculation, Patient, User])],
  controllers: [MetabolicController],
  providers: [MetabolicService],
  exports: [MetabolicService],
})
export class MetabolicModule {}


