import { Injectable } from '@nestjs/common';

/**
 * Serviço responsável pelo cálculo da Taxa Metabólica Basal (BMR) usando a fórmula de Harris-Benedict.
 */
@Injectable()
export class BMRCalculatorService {
  /**
   * Calcula a Taxa Metabólica Basal (BMR) de acordo com sexo, peso, altura e idade.
   * @param weight Peso em kg
   * @param height Altura em metros
   * @param age Idade em anos
   * @param sex Sexo ('M' para masculino, 'F' para feminino)
   * @returns Valor da BMR
   */
  calculate(weight: number, height: number, age: number, sex: 'M' | 'F') {
    if (sex === 'M') {
      return 88.36 + (13.4 * weight) + (4.8 * height * 100) - (5.7 * age);
    } else {
      return 447.6 + (9.2 * weight) + (3.1 * height * 100) - (4.3 * age);
    }
  }
}