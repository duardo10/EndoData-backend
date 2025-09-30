/**
 * Módulo de Recibos Médicos
 * 
 * Módulo responsável pela configuração e integração de todos os componentes
 * relacionados ao gerenciamento de recibos médicos. Configura entidades,
 * controladores, serviços e suas dependências para o sistema financeiro.
 * 
 * @module ReceiptsModule
 * 
 * @imports
 * - TypeOrmModule: Configuração das entidades Receipt e ReceiptItem
 * - PatientsModule: Dependência para validação de pacientes
 * 
 * @providers
 * - ReceiptsService: Serviço principal com lógica de negócio
 * 
 * @controllers
 * - ReceiptsController: Controlador REST com endpoints HTTP
 * 
 * @exports
 * - ReceiptsService: Disponibiliza serviço para outros módulos
 * 
 * @entities
 * - Receipt: Entidade principal do recibo médico
 * - ReceiptItem: Entidade dos itens do recibo
 * 
 * @dependencies
 * - TypeORM para persistência de dados
 * - PatientsModule para relacionamentos
 * - NestJS common modules para injeção de dependência
 * 
 * @businessRules
 * - Recibos vinculados a pacientes existentes
 * - Cálculo automático de totais dos itens
 * - Controle de status do faturamento
 * - Histórico completo de transações
 * 
 * @usage
 * - Importar em AppModule ou módulos que necessitem funcionalidades de recibos
 * - Injetar ReceiptsService em outros serviços quando necessário
 * - Acessar endpoints via ReceiptsController
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 * @module receipts
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { PatientsModule } from '../patients/patients.module';

/**
 * Módulo de Recibos Médicos
 * 
 * Configura todo o sistema de gerenciamento financeiro de recibos,
 * incluindo persistência, lógica de negócio e exposição de APIs.
 */
@Module({
  imports: [
    // Configuração das entidades TypeORM
    TypeOrmModule.forFeature([
      Receipt,      // Entidade principal do recibo
      ReceiptItem   // Entidade dos itens do recibo
    ]),
    
    // Dependência do módulo de pacientes
    // Necessário para validar relacionamentos e buscar dados de pacientes
    PatientsModule
  ],
  
  controllers: [
    ReceiptsController  // Controlador REST com endpoints HTTP
  ],
  
  providers: [
    ReceiptsService     // Serviço com lógica de negócio
  ],
  
  exports: [
    ReceiptsService     // Exporta serviço para uso em outros módulos
  ]
})
export class ReceiptsModule {}