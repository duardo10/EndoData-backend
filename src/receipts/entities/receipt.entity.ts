/**
 * @file Define a entidade Receipt para o banco de dados.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
import { ReceiptItem } from './receipt-item.entity';
import { ReceiptStatus } from '../enums/receipt-status.enum';

/**
 * Representa um recibo ou fatura médica.
 * @class
 */
@Entity('receipts')
export class Receipt {
  /**
   * O identificador único para o recibo.
   * @type {string}
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * O ID do paciente associado a este recibo.
   * @type {string}
   */
  @Column()
  patientId: string;

  /**
   * O paciente associado a este recibo.
   * @type {Patient}
   */
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  /**
   * O ID do usuário que criou este recibo.
   * @type {string}
   */
  @Column()
  userId: string;

  /**
   * O usuário que criou este recibo.
   * @type {User}
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * O valor total do recibo.
   * Calculado automaticamente a partir da soma dos preços totais dos itens do recibo.
   * @type {number}
   */
  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  totalAmount: number;

  /**
   * O status do recibo.
   * @type {ReceiptStatus}
   */
  @Column({
    type: 'enum',
    enum: ReceiptStatus,
    default: ReceiptStatus.PENDING,
  })
  status: ReceiptStatus;

  /**
   * A data em que o recibo foi emitido.
   * @type {Date}
   */
  @CreateDateColumn()
  date: Date;

  /**
   * Os itens incluídos neste recibo.
   * @type {ReceiptItem[]}
   */
  @OneToMany(() => ReceiptItem, (item) => item.receipt, { cascade: true, eager: true })
  items: ReceiptItem[];

  /**
   * Calcula o total do recibo a partir dos itens antes de inserir/atualizar.
   * Garante que `totalAmount` reflita a soma dos `totalPrice` dos itens.
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalAmount() {
    if (!this.items || this.items.length === 0) {
      this.totalAmount = 0;
      return;
    }

    const sum = this.items.reduce((acc, it) => {
      // o TypeORM pode mapear DECIMAL para string; assegure conversão segura
      const itemTotal = it.totalPrice ?? (it.quantity && it.unitPrice ? Number(it.quantity) * Number(it.unitPrice) : 0);
      return Number(acc) + Number(itemTotal);
    }, 0);

    // Arredonda para 2 casas decimais e garante tipo numérico
    this.totalAmount = Number(sum.toFixed(2));
  }

  /**
   * O timestamp da última atualização do recibo.
   * @type {Date}
   */
  @UpdateDateColumn()
  updatedAt: Date;
}