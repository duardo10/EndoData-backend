import { Injectable } from '@nestjs/common';

@Injectable()
export class BMICalculatorService {
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

