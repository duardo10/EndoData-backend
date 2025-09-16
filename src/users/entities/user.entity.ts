import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;



  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  login: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  especialidade: string;

  @Column({ type: 'boolean', name: 'is_administrador', default: false })
  isAdministrador: boolean;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  crm: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}