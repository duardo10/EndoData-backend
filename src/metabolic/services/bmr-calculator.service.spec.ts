import { Test, TestingModule } from '@nestjs/testing';
import { BMRCalculatorService } from './bmr-calculator.service';

describe('BMRCalculatorService', () => {
  let service: BMRCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BMRCalculatorService],
    }).compile();

    service = module.get<BMRCalculatorService>(BMRCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    describe('Male calculations', () => {
      it('should calculate BMR correctly for adult male', () => {
        const result = service.calculate(70, 1.75, 30, 'M');
        
        // BMR = 88.36 + (13.4 * 70) + (4.8 * 175) - (5.7 * 30)
        // BMR = 88.36 + 938 + 840 - 171 = 1695.36
        expect(result).toBeCloseTo(1695.36, 2);
      });

      it('should calculate BMR for young male', () => {
        const result = service.calculate(60, 1.70, 20, 'M');
        
        // BMR = 88.36 + (13.4 * 60) + (4.8 * 170) - (5.7 * 20)
        // BMR = 88.36 + 804 + 816 - 114 = 1594.36
        expect(result).toBeCloseTo(1594.36, 2);
      });

      it('should calculate BMR for older male', () => {
        const result = service.calculate(80, 1.80, 50, 'M');
        
        // BMR = 88.36 + (13.4 * 80) + (4.8 * 180) - (5.7 * 50)
        // BMR = 88.36 + 1072 + 864 - 285 = 1739.36
        expect(result).toBeCloseTo(1739.36, 2);
      });

      it('should handle decimal values for male', () => {
        const result = service.calculate(75.5, 1.78, 35.5, 'M');
        
        // BMR = 88.36 + (13.4 * 75.5) + (4.8 * 178) - (5.7 * 35.5)
        // BMR = 88.36 + 1011.7 + 854.4 - 202.35 = 1751.21
        expect(result).toBeCloseTo(1751.21, 2);
      });
    });

    describe('Female calculations', () => {
      it('should calculate BMR correctly for adult female', () => {
        const result = service.calculate(60, 1.65, 30, 'F');
        
        // BMR = 447.6 + (9.2 * 60) + (3.1 * 165) - (4.3 * 30)
        // BMR = 447.6 + 552 + 511.5 - 129 = 1382.1
        expect(result).toBeCloseTo(1382.1, 2);
      });

      it('should calculate BMR for young female', () => {
        const result = service.calculate(55, 1.60, 20, 'F');
        
        // BMR = 447.6 + (9.2 * 55) + (3.1 * 160) - (4.3 * 20)
        // BMR = 447.6 + 506 + 496 - 86 = 1363.6
        expect(result).toBeCloseTo(1363.6, 2);
      });

      it('should calculate BMR for older female', () => {
        const result = service.calculate(70, 1.70, 50, 'F');
        
        // BMR = 447.6 + (9.2 * 70) + (3.1 * 170) - (4.3 * 50)
        // BMR = 447.6 + 644 + 527 - 215 = 1403.6
        expect(result).toBeCloseTo(1403.6, 2);
      });

      it('should handle decimal values for female', () => {
        const result = service.calculate(65.5, 1.68, 40.5, 'F');
        
        // BMR = 447.6 + (9.2 * 65.5) + (3.1 * 168) - (4.3 * 40.5)
        // BMR = 447.6 + 602.6 + 520.8 - 174.15 = 1396.85
        expect(result).toBeCloseTo(1396.85, 2);
      });
    });

    describe('Edge cases', () => {
      it('should handle minimum values', () => {
        const result = service.calculate(30, 1.20, 18, 'M');
        
        // BMR = 88.36 + (13.4 * 30) + (4.8 * 120) - (5.7 * 18)
        // BMR = 88.36 + 402 + 576 - 102.6 = 963.76
        expect(result).toBeCloseTo(963.76, 2);
      });

      it('should handle maximum values', () => {
        const result = service.calculate(150, 2.20, 80, 'F');
        
        // BMR = 447.6 + (9.2 * 150) + (3.1 * 220) - (4.3 * 80)
        // BMR = 447.6 + 1380 + 682 - 344 = 2165.6
        expect(result).toBeCloseTo(2165.6, 2);
      });

      it('should handle zero age', () => {
        const result = service.calculate(70, 1.75, 0, 'M');
        
        // BMR = 88.36 + (13.4 * 70) + (4.8 * 175) - (5.7 * 0)
        // BMR = 88.36 + 938 + 840 - 0 = 1866.36
        expect(result).toBeCloseTo(1866.36, 2);
      });

      it('should handle very tall person', () => {
        const result = service.calculate(80, 2.00, 30, 'M');
        
        // BMR = 88.36 + (13.4 * 80) + (4.8 * 200) - (5.7 * 30)
        // BMR = 88.36 + 1072 + 960 - 171 = 1949.36
        expect(result).toBeCloseTo(1949.36, 2);
      });

      it('should handle very short person', () => {
        const result = service.calculate(50, 1.40, 30, 'F');
        
        // BMR = 447.6 + (9.2 * 50) + (3.1 * 140) - (4.3 * 30)
        // BMR = 447.6 + 460 + 434 - 129 = 1212.6
        expect(result).toBeCloseTo(1212.6, 2);
      });
    });

    describe('Type safety', () => {
      it('should only accept M or F for sex parameter', () => {
        // These should work without TypeScript errors
        expect(() => service.calculate(70, 1.75, 30, 'M')).not.toThrow();
        expect(() => service.calculate(70, 1.75, 30, 'F')).not.toThrow();
      });

      it('should return a number', () => {
        const result = service.calculate(70, 1.75, 30, 'M');
        expect(typeof result).toBe('number');
        expect(Number.isFinite(result)).toBe(true);
      });
    });

    describe('Formula validation', () => {
      it('should use correct male formula', () => {
        const weight = 70;
        const height = 1.75;
        const age = 30;
        
        const result = service.calculate(weight, height, age, 'M');
        const expected = 88.36 + (13.4 * weight) + (4.8 * height * 100) - (5.7 * age);
        
        expect(result).toBeCloseTo(expected, 2);
      });

      it('should use correct female formula', () => {
        const weight = 60;
        const height = 1.65;
        const age = 30;
        
        const result = service.calculate(weight, height, age, 'F');
        const expected = 447.6 + (9.2 * weight) + (3.1 * height * 100) - (4.3 * age);
        
        expect(result).toBeCloseTo(expected, 2);
      });
    });
  });
});
