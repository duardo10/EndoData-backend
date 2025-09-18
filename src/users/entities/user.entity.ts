import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

/**
 * Entidade de usuário do sistema.
 * Representa médicos que gerenciam pacientes.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;



  /** Nome completo do usuário. */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Login opcional do usuário. */
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  login: string;

  /** Especialidade médica opcional. */
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  especialidade: string;

  /** Indica se o usuário possui privilégios administrativos. */
  @Column({ type: 'boolean', name: 'is_administrador', default: false })
  isAdministrador: boolean;

  /** E-mail único do usuário. */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /** CPF do usuário (apenas dígitos). */
  @Column({ type: 'varchar', length: 14, unique: true })
  cpf: string;

  /** CRM do médico. */
  @Column({ type: 'varchar', length: 20, unique: true })
  crm: string;

  /** Hash da senha do usuário. */
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Lista de pacientes gerenciados por este usuário. */
  @OneToMany(() => Patient, (patient) => patient.user)
  patients: Patient[];
}