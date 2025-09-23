import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';

/**
 * Módulo responsável por agrupar as dependências e funcionalidades relacionadas a pacientes.
 * Inclui controller, service e entidades Patient e User.
 */
@Module({
  imports: [
    /**
     * Importa os repositórios das entidades Patient e User para uso no módulo.
     */
    TypeOrmModule.forFeature([Patient, User]),
  ],
  controllers: [
    /**
     * Controller que expõe as rotas HTTP para operações com pacientes.
     */
    PatientsController,
  ],
  providers: [
    /**
     * Serviço que encapsula as regras de negócio e operações com pacientes.
     */
    PatientsService,
  ],
  exports: [
    /**
     * Exporta o serviço de pacientes para uso em outros módulos.
     */
    PatientsService,
  ],
})
export class PatientsModule {}
