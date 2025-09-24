import { Injectable } from '@nestjs/common';

/**
 * Serviço responsável pelo cálculo do IMC (Índice de Massa Corporal) e sua classificação.
 */
@Injectable()
export class BMICalculatorService {
  /**
   * Calcula o IMC e retorna o valor junto com a classificação.
   * @param weight Peso em kg
   * @param height Altura em metros
   * @returns Objeto com o IMC e a classificação
   */
  calculate(weight: number, height: number) {
    const bmi = weight / (height * height);
    let classification = '';
    if (bmi < 18.5) classification = 'Abaixo do peso';
    else if (bmi < 25) classification = 'Peso normal';
    else if (bmi < 30) classification = 'Sobrepeso';
    else classification = 'Obesidade';
    return { bmi, classification };
  }
}

