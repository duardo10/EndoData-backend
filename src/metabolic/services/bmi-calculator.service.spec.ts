import { Test, TestingModule } from '@nestjs/testing';
import { BMICalculatorService } from './bmi-calculator.service';

describe('BMICalculatorService', () => {
  let service: BMICalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BMICalculatorService],
    }).compile();

    service = module.get<BMICalculatorService>(BMICalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate BMI correctly for normal weight', () => {
      const result = service.calculate(70, 1.75);
      
      expect(result.bmi).toBeCloseTo(22.86, 2);
      expect(result.classification).toBe('Peso normal');
    });

    it('should classify as "Abaixo do peso" for BMI < 18.5', () => {
      const result = service.calculate(50, 1.75);
      
      expect(result.bmi).toBeCloseTo(16.33, 2);
      expect(result.classification).toBe('Abaixo do peso');
    });

    it('should classify as "Peso normal" for BMI between 18.5 and 25', () => {
      const result = service.calculate(70, 1.75);
      
      expect(result.bmi).toBeCloseTo(22.86, 2);
      expect(result.classification).toBe('Peso normal');
    });

    it('should classify as "Sobrepeso" for BMI between 25 and 30', () => {
      const result = service.calculate(80, 1.75);
      
      expect(result.bmi).toBeCloseTo(26.12, 2);
      expect(result.classification).toBe('Sobrepeso');
    });

    it('should classify as "Obesidade" for BMI >= 30', () => {
      const result = service.calculate(100, 1.75);
      
      expect(result.bmi).toBeCloseTo(32.65, 2);
      expect(result.classification).toBe('Obesidade');
    });

    it('should handle edge case BMI exactly 18.5', () => {
      const result = service.calculate(56.7, 1.75);
      
      expect(result.bmi).toBeCloseTo(18.5, 1);
      expect(result.classification).toBe('Peso normal');
    });

    it('should handle edge case BMI exactly 25', () => {
      const result = service.calculate(76.56, 1.75);
      
      expect(result.bmi).toBeCloseTo(25.0, 1);
      expect(result.classification).toBe('Peso normal');
    });

    it('should handle edge case BMI exactly 30', () => {
      const result = service.calculate(91.875, 1.75);
      
      expect(result.bmi).toBeCloseTo(30.0, 1);
      expect(result.classification).toBe('Sobrepeso');
    });

    it('should handle very low BMI', () => {
      const result = service.calculate(30, 1.75);
      
      expect(result.bmi).toBeCloseTo(9.8, 1);
      expect(result.classification).toBe('Abaixo do peso');
    });

    it('should handle very high BMI', () => {
      const result = service.calculate(150, 1.75);
      
      expect(result.bmi).toBeCloseTo(49.0, 1);
      expect(result.classification).toBe('Obesidade');
    });

    it('should handle decimal values correctly', () => {
      const result = service.calculate(68.5, 1.72);
      
      expect(result.bmi).toBeCloseTo(23.14, 2);
      expect(result.classification).toBe('Peso normal');
    });

    it('should return correct structure', () => {
      const result = service.calculate(70, 1.75);
      
      expect(result).toHaveProperty('bmi');
      expect(result).toHaveProperty('classification');
      expect(typeof result.bmi).toBe('number');
      expect(typeof result.classification).toBe('string');
    });
  });
});
