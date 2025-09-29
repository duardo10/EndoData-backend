/**
 * @file Define o enum para o status do recibo.
 */

/**
 * Enum para o status do recibo.
 * @enum {string}
 */
export enum ReceiptStatus {
  /** O recibo está com pagamento pendente. */
  PENDING = 'pending',
  /** O recibo foi pago. */
  PAID = 'paid',
  /** O recibo foi cancelado. */
  CANCELLED = 'cancelled',
}