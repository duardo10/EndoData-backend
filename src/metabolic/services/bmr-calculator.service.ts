import { Injectable } from '@nestjs/common';

@Injectable()
export class BMRCalculatorService {
  calculate(weight: number, height: number, age: number, sex: 'M' | 'F') {
    if (sex === 'M') {
      return 88.36 + (13.4 * weight) + (4.8 * height * 100) - (5.7 * age);
    } else {
      return 447.6 + (9.2 * weight) + (3.1 * height * 100) - (4.3 * age);
    }
  }
}