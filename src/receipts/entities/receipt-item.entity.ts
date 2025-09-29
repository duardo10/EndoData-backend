/**
 * Define a entidade ReceiptItem para o banco de dados.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Receipt } from './receipt.entity';

/**
 * Representa um item dentro de um recibo.
 * @class
 */
@Entity('receipt_items')
export class ReceiptItem {
  /**
   * O identificador único para o item do recibo.
   * @type {string}
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * O ID do recibo ao qual este item pertence.
   * @type {string}
   */
  @Column()
  receiptId: string;

  /**
   * O recibo ao qual este item pertence.
   * @type {Receipt}
   */
  @ManyToOne(() => Receipt, (receipt) => receipt.items)
  @JoinColumn({ name: 'receiptId' })
  receipt: Receipt;

  /**
   * Uma descrição do item ou serviço.
   * @type {string}
   */
  @Column()
  description: string;

  /**
   * A quantidade do item ou serviço.
   * @type {number}
   */
  @Column('int')
  quantity: number;

  /**
   * O preço por unidade do item ou serviço.
   * @type {number}
   */
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  /**
   * O preço total para este item (quantidade * preço unitário).
   * Este valor é calculado automaticamente.
   * @type {number}
   */
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  /**
   * Calcula o preço total antes de inserir ou atualizar a entidade.
   * @method
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    if (this.quantity && this.unitPrice) {
      this.totalPrice = this.quantity * this.unitPrice;
    }
  }
}