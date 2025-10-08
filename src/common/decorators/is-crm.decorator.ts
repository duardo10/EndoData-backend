import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

/** Lista de UFs válidas no Brasil. */
const VALID_UFS = new Set([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]);

/**
 * Validador de CRM por estado (UF).
 * Aceita formatos comuns: "CRM-UF 123456" ou apenas "123456" (4 a 7 dígitos).
 * Quando `uf` é informado, valida a presença do sufixo correspondente (ex.: CRM-SP 123456).
 */
@ValidatorConstraint({ name: 'isCrmByUf', async: false })
export class IsCrmByUfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args?: any): boolean {
    if (typeof value !== 'string') return false;

    const uf: string | undefined = args?.constraints?.[0];
    const digitsOnly = /^\d{4,7}$/;
    const withUf = /^CRM-([A-Z]{2})\s\d{4,7}$/;

    if (!uf) {
      // Sem UF explícita, aceite apenas dígitos (CRMs variam entre 4 e 7 dígitos)
      return digitsOnly.test(value.trim());
    }

    if (!VALID_UFS.has(uf)) return false;

    const match = value.trim().match(withUf);
    return !!match && match[1] === uf;
  }

  defaultMessage(args?: any): string {
    const uf: string | undefined = args?.constraints?.[0];
    if (!uf) {
      return 'CRM deve conter apenas dígitos (4 a 7).';
    }
    return `CRM deve estar no formato "CRM-${uf} XXXXX" com 4 a 7 dígitos.`;
  }
}

/**
 * Decorator para validar CRM por UF.
 * Ex.: `@IsCrm({ uf: 'SP' })` valida "CRM-SP 123456".
 * Sem UF, valida apenas dígitos (4-7).
 */
export function IsCrm(options?: { uf?: string; message?: string }, validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: Object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'IsCrm',
      target: object.constructor,
      propertyName: propertyName as string,
      options: { message: options?.message, ...validationOptions },
      constraints: [options?.uf],
      validator: IsCrmByUfConstraint,
    });
  };
}


