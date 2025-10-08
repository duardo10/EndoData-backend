/**
 * Enum Status de Recibo
 * 
 * Define os possíveis status de um recibo médico no sistema.
 * Controla o ciclo de vida do faturamento desde a criação
 * até o pagamento ou cancelamento.
 * 
 * @enum ReceiptStatus
 * 
 * @values
 * - PENDING: Recibo criado, aguardando pagamento
 * - PAID: Recibo quitado, pagamento confirmado
 * - CANCELLED: Recibo cancelado, sem cobrança
 * 
 * @businessRules
 * - Status padrão é PENDING
 * - Transições controladas pela aplicação
 * - CANCELLED é estado final
 * - PAID é estado final de sucesso
 * 
 * @author Sistema EndoData
 * @since 2025-09-30
 * @version 1.0.0
 */

/**
 * Enum para controle de status do recibo médico.
 * 
 * @enum {string} ReceiptStatus
 */
export enum ReceiptStatus {
  /** 
   * Recibo criado, aguardando pagamento.
   * Estado inicial padrão de novos recibos.
   */
  PENDING = 'pending',
  
  /** 
   * Recibo pago e quitado.
   * Estado final indicando pagamento confirmado.
   */
  PAID = 'paid',
  
  /** 
   * Recibo cancelado.
   * Estado final para recibos que não serão cobrados.
   */
  CANCELLED = 'cancelled',
}