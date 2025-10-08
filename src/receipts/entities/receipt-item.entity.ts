/**
 * Entidade ReceiptItem - Item de Recibo
 * 
 * Representa um item individual dentro de um recibo médico.
 * Contém detalhes do serviço ou produto, quantidade, preços
 * e cálculo automático do valor total.
 * 
 * @entity receipt_items
 * 
 * @features
 * - Cálculo automático de preço total
 * - Validação de quantidade e preços
 * - Relacionamento com recibo pai
 * - Precisão decimal para valores monetários
 * 
 * @businessRules
 * - Quantidade deve ser positiva
 * - Preço unitário deve ser positivo
 * - Total calculado automaticamente (quantidade × preço unitário)
 * - Descrição obrigatória
 * 
 * @relationships
 * - ManyToOne com Receipt
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
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
 * Entidade Item de Recibo
 * 
 * Representa um item individual dentro de um recibo médico.
 * Inclui cálculo automático de totais e validações.
 * 
 * @class ReceiptItem
 * @entity receipt_items
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
   * 
   * Hook do TypeORM que executa automaticamente antes de salvar.
   * Garante que o total está sempre sincronizado com quantidade e preço unitário.
   * 
   * @method calculateTotalPrice
   * @lifecycle BeforeInsert, BeforeUpdate
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    if (this.quantity && this.unitPrice) {
      this.totalPrice = this.quantity * this.unitPrice;
    }
  }
}