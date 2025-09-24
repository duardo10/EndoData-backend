import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';

/**
 * Entidade que representa um medicamento específico dentro de uma prescrição médica.
 * 
 * Cada instância desta entidade representa um medicamento prescrito com suas
 * especificações de dosagem, frequência e duração do tratamento. Múltiplos
 * medicamentos podem estar associados a uma única prescrição.
 * 
 * @class PrescriptionMedication
 * @entity prescription_medications
 */
@Entity('prescription_medications')
export class PrescriptionMedication {
  /**
   * Identificador único do medicamento na prescrição.
   * Gerado automaticamente como UUID.
   * 
   * @type {string}
   * @primaryKey
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Prescrição à qual este medicamento pertence.
   * Relacionamento obrigatório - medicamento deve estar vinculado a uma prescrição.
   * 
   * @type {Prescription}
   * @relation ManyToOne
   * @cascade DELETE - se prescrição for removida, medicamentos são removidos
   */
  @ManyToOne(() => Prescription, (prescription) => prescription.medications, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  /**
   * Nome do medicamento prescrito.
   * Nome comercial ou princípio ativo do medicamento.
   * 
   * @type {string}
   * @maxLength 255
   * @required
   */
  @Column({ type: 'varchar', length: 255 })
  medicationName: string;

  /**
   * Dosagem do medicamento.
   * Quantidade e unidade de medida (ex: "500mg", "2 comprimidos").
   * 
   * @type {string}
   * @maxLength 255
   * @required
   */
  @Column({ type: 'varchar', length: 255 })
  dosage: string;

  /**
   * Frequência de administração do medicamento.
   * Como e quando tomar (ex: "3x ao dia", "a cada 8 horas").
   * 
   * @type {string}
   * @maxLength 255
   * @required
   */
  @Column({ type: 'varchar', length: 255 })
  frequency: string;

  /**
   * Duração do tratamento com este medicamento.
   * Período de uso (ex: "7 dias", "até melhorar", "30 dias").
   * 
   * @type {string}
   * @maxLength 255
   * @required
   */
  @Column({ type: 'varchar', length: 255 })
  duration: string;
}


