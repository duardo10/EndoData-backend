import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Remove todos os caracteres não numéricos de uma string.
 * @param value String de entrada que pode conter caracteres não numéricos.
 * @returns Apenas os dígitos numéricos da string.
 */
function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Valida se um CPF é válido conforme os dígitos verificadores.
 * @param cpfRaw CPF em formato string, podendo conter pontos e traço.
 * @returns `true` se o CPF for válido, `false` caso contrário.
 */
function isValidCpf(cpfRaw: string): boolean {
  const cpf = onlyDigits(cpfRaw);
  if (!cpf || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos dígitos iguais

  /**
   * Calcula o dígito verificador do CPF.
   * @param base Parte base do CPF (9 ou 10 dígitos).
   * @param factorStart Fator inicial para multiplicação.
   * @returns Dígito verificador calculado.
   */
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

/**
 * Decorator de validação para CPF.
 * Utiliza a função isValidCpf para validar o campo decorado.
 * Exemplo de uso: `@IsCpf({ message: 'CPF inválido' })`
 * @param validationOptions Opções de validação do class-validator.
 * @returns Função decorator para ser usada em propriedades de classes DTO.
 */
export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpf',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        /**
         * Valida o valor do campo decorado.
         * @param value Valor a ser validado.
         * @param _args Argumentos de validação.
         * @returns `true` se o valor for um CPF válido, `false` caso contrário.
         */
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return isValidCpf(value);
        },
        /**
         * Mensagem padrão de erro para CPF inválido.
         * @param _args Argumentos de validação.
         * @returns Mensagem de erro.
         */
        defaultMessage(_args: ValidationArguments) {
          return 'CPF inválido';
        },
      },
    });
  };
}

/**
 * Utilidades relacionadas ao CPF.
 * - onlyDigits: Remove caracteres não numéricos.
 * - isValidCpf: Valida CPF conforme regras oficiais.
 */
export const CpfUtils = { onlyDigits, isValidCpf };


