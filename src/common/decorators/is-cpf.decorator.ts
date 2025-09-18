import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

function isValidCpf(cpfRaw: string): boolean {
  const cpf = onlyDigits(cpfRaw);
  if (!cpf || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos dígitos iguais

  const calcCheckDigit = (base: string, factorStart: number): number => {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += parseInt(base.charAt(i), 10) * (factorStart - i);
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const baseNine = cpf.substring(0, 9);
  const d1 = calcCheckDigit(baseNine, 10);
  const baseTen = baseNine + String(d1);
  const d2 = calcCheckDigit(baseTen, 11);

  return cpf === baseNine + String(d1) + String(d2);
}

export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpf',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return isValidCpf(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return 'CPF inválido';
        },
      },
    });
  };
}

export const CpfUtils = { onlyDigits, isValidCpf };


