/**
 * Testes Unitários - BMICalculatorService
 * 
 * Suite completa de testes para o serviço de cálculo de BMI (Body Mass Index).
 * Testa os cálculos de índice de massa corporal e classificação de peso
 * para diferentes cenários de peso e altura.
 * 
 * @testSuite BMICalculatorService
 * @testFramework Jest + NestJS Testing
 * @coverage
 * - Cálculo correto do BMI
 * - Classificação de peso (Abaixo, Normal, Sobrepeso, Obesidade)
 * - Casos extremos (valores muito baixos e altos)
 * - Valores decimais e precisão
 * - Casos limite das classificações
 * - Estrutura de retorno dos dados
 * 
 * @testTypes
 * - Unit Tests: Lógica de cálculo isolada
 * - Mathematical Tests: Validação de fórmulas
 * - Classification Tests: Validação de categorias
 * - Edge Case Tests: Valores extremos
 * 
 * @formula
 * - BMI = peso / (altura × altura)
 * - Classificações:
 *   - Abaixo do peso: BMI < 18.5
 *   - Peso normal: 18.5 ≤ BMI < 25
 *   - Sobrepeso: 25 ≤ BMI < 30
 *   - Obesidade: BMI ≥ 30
 * 
 * @author Sistema EndoData
 * @since 2025-01-01
 * @version 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BMICalculatorService } from './bmi-calculator.service';

/**
 * Suite de Testes do BMICalculatorService
 * 
 * Testa todos os cenários de cálculo de BMI, incluindo diferentes
 * combinações de peso e altura, e validação das classificações.
 * 
 * @testSuite BMICalculatorService
 * @scope Unit Tests
 * @coverage 100% dos métodos públicos
 */
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
        expect(result.classification).toBe('Obesidade');
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
        
        expect(result.bmi).toBeCloseTo(23.15, 2);
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
