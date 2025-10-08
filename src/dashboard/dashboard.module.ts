import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardCacheInterceptor } from './interceptors/dashboard-cache.interceptor';
import { Patient } from '../patients/entities/patient.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { PrescriptionMedication } from '../prescriptions/entities/prescription-medication.entity';

/**
 * Módulo de Dashboard.
 *
 * Declara o controller e o service responsáveis por fornecer estatísticas
 * agregadas para a tela inicial. Importa as entidades necessárias para
 * consultas eficientes de contagem por período, incluindo Patient, Receipt,
 * Prescription e PrescriptionMedication para métricas avançadas e análise
 * de medicamentos mais prescritos.
 * 
 * Cache e Performance:
 * - Configurado com cache de 1 hora (3600 segundos) para otimizar performance
 * - Utiliza DashboardCacheInterceptor personalizado para isolamento por usuário
 * - Chaves de cache incluem ID do médico para segurança e isolamento de dados
 * - Máximo de 100 itens em cache para controle de memória
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Receipt, Prescription, PrescriptionMedication]),
    CacheModule.register({
      ttl: 3600, // 1 hora em segundos
      max: 100, // máximo 100 itens no cache
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardCacheInterceptor],
  exports: [DashboardService],
})
export class DashboardModule {}


