import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PatientGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum BloodType {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = 'O+',
  O_NEG = 'O-',
}

/**
 * Entidade que representa um paciente sob cuidado de um médico.
 */
@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nome completo do paciente. */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  /** CPF do paciente (apenas dígitos). */
  @Column({ type: 'varchar', length: 14 })
  cpf: string;

  /** Data de nascimento no formato ISO (YYYY-MM-DD). */
  @Column({ type: 'date' })
  birthDate: string;

  /** Sexo do paciente. */
  @Column({ type: 'enum', enum: PatientGender })
  gender: PatientGender;

  @Index({ unique: true })
  /** E-mail do paciente, quando disponível. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Index({ unique: true })
  /** Telefone do paciente, incluindo DDI/DDD apenas com dígitos. */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  // Campos de endereço
  /** Bairro de residência. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  neighborhood: string | null;

  /** Cidade de residência. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string | null;

  /** Estado (UF) em duas letras maiúsculas. */
  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string | null;

  // Campos médicos
  /** Peso em kg com até 2 casas decimais. */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: string | null;

  /** Altura em cm com 1 casa decimal. */
  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  height: string | null;

  /** Tipo sanguíneo do paciente. */
  @Column({ type: 'enum', enum: BloodType, nullable: true })
  bloodType: BloodType | null;

  /** Histórico médico relevante. */
  @Column({ type: 'text', nullable: true })
  medicalHistory: string | null;

  /** Alergias conhecidas. */
  @Column({ type: 'text', nullable: true })
  allergies: string | null;

  /** Médico responsável pelo paciente. */
  @ManyToOne(() => User, (user) => user.patients, { onDelete: 'CASCADE', nullable: false })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Data de deleção lógica (soft delete), quando aplicável. */
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}


