/**
 * Módulo raiz da aplicação.
 *
 * Configura variáveis de ambiente, conexão com banco via TypeORM, registra os
 * módulos de domínio e aplica o guard global de autenticação JWT.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Patient } from './patients/entities/patient.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { MetabolicCalculation } from './metabolic/entities/metabolic-calculation.entity';
import { MetabolicModule } from './metabolic/metabolic.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { Prescription } from './prescriptions/entities/prescription.entity';
import { PrescriptionMedication } from './prescriptions/entities/prescription-medication.entity';
import { ReceiptsModule } from './receipts/receipts.module';
import { Receipt } from './receipts/entities/receipt.entity';
import { ReceiptItem } from './receipts/entities/receipt-item.entity';
import { DashboardModule } from './dashboard/dashboard.module';

/**
 * Módulo principal da aplicação.
 * Responsável por importar e configurar todos os módulos, serviços e entidades principais.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, Patient, MetabolicCalculation, Prescription, PrescriptionMedication, Receipt, ReceiptItem],
        synchronize: process.env.NODE_ENV === 'development', // Apenas em desenvolvimento
        logging: process.env.NODE_ENV === 'development',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    PatientsModule,
    AuthModule,
    MetabolicModule,
    PrescriptionsModule,
    ReceiptsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }