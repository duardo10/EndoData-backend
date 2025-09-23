import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('prescription_medications')
export class PrescriptionMedication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescription, (prescription) => prescription.medications, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @Column({ type: 'varchar', length: 255 })
  medicationName: string;

  @Column({ type: 'varchar', length: 255 })
  dosage: string;

  @Column({ type: 'varchar', length: 255 })
  frequency: string;

  @Column({ type: 'varchar', length: 255 })
  duration: string;
}


