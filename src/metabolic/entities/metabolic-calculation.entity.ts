import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CalculationType } from '../enums/calculation-type.enum';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Entidade que representa um registro de cálculo metabólico realizado para um paciente.
 * Guarda o tipo do cálculo, dados de entrada dinâmicos e o resultado gerado.
 */
@Entity('metabolic_calculations')
export class MetabolicCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Paciente ao qual este cálculo pertence. */
  @ManyToOne(() => Patient, { nullable: false, onDelete: 'CASCADE' })
  patient: Patient;

  /** Usuário (médico) que realizou o cálculo. Pode ser nulo se removido. */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  /** Tipo de cálculo realizado (BMI, BMR, TDEE). */
  @Column({ type: 'enum', enum: CalculationType })
  calculationType: CalculationType;

  /** Dados de entrada usados no cálculo (estrutura dinâmica). */
  @Column({ type: 'jsonb', name: 'input_data' })
  inputData: Record<string, any>;

  /** Resultado(s) do cálculo (estrutura dinâmica). */
  @Column({ type: 'jsonb' })
  results: Record<string, any>;

  /** Data/hora de criação do registro. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}


