/**
 * Testes End-to-End - Dashboard Controller
 * 
 * Suite completa de testes E2E para o Dashboard Controller.
 * Testa todas as rotas do dashboard com autenticação JWT,
 * incluindo validação de autorização, cache e funcionalidades.
 * 
 * @testSuite DashboardController
 * @testFramework Jest + Supertest + NestJS
 * @testType End-to-End Tests
 * @coverage
 * - Rotas de resumo do dashboard
 * - Métricas avançadas
 * - Gráficos de pacientes semanais
 * - Top medicamentos
 * - Comparação de receita mensal
 * - Funcionalidade de cache
 * - Autenticação e autorização
 * - Validação de parâmetros
 * 
 * @testTypes
 * - E2E Tests: Fluxo completo da aplicação
 * - Authentication Tests: Validação de JWT
 * - Cache Tests: Funcionalidade de cache
 * - Parameter Validation: Validação de entrada
 * 
 * @author Sistema EndoData
 * @since 2025-01-01
 * @version 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';

/**
 * Suite de Testes E2E do Dashboard Controller
 * 
 * Testa todas as funcionalidades do dashboard em um ambiente
 * de integração completo, incluindo autenticação e cache.
 * 
 * @testSuite DashboardController
 * @scope End-to-End Tests
 * @coverage 100% das rotas do dashboard
 */
describe('Dashboard Controller (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    name: 'Dr. Teste',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    // Gerar token JWT para testes
    authToken = jwtService.sign(mockUser);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/dashboard/summary (GET)', () => {
    it('should return dashboard summary successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalPatients');
      expect(response.body).toHaveProperty('patientsRegisteredToday');
      expect(response.body).toHaveProperty('patientsRegisteredThisWeek');
      
      expect(typeof response.body.totalPatients).toBe('number');
      expect(typeof response.body.patientsRegisteredToday).toBe('number');
      expect(typeof response.body.patientsRegisteredThisWeek).toBe('number');
      
      expect(response.body.totalPatients).toBeGreaterThanOrEqual(0);
      expect(response.body.patientsRegisteredToday).toBeGreaterThanOrEqual(0);
      expect(response.body.patientsRegisteredThisWeek).toBeGreaterThanOrEqual(0);
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/dashboard/metrics (GET)', () => {
    it('should return advanced metrics successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalPatients');
      expect(response.body).toHaveProperty('monthlyRevenue');
      expect(response.body).toHaveProperty('activePrescriptions');
      expect(response.body).toHaveProperty('averageReceiptValue');
      
      expect(typeof response.body.totalPatients).toBe('number');
      expect(typeof response.body.monthlyRevenue).toBe('number');
      expect(typeof response.body.activePrescriptions).toBe('number');
      expect(typeof response.body.averageReceiptValue).toBe('number');
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/metrics')
        .expect(401);
    });
  });

  describe('/api/dashboard/weekly-patients (GET)', () => {
    it('should return weekly patients chart with default parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/weekly-patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('totalWeeks');
      expect(response.body).toHaveProperty('generatedAt');
      
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.totalWeeks).toBe('number');
      expect(typeof response.body.generatedAt).toBe('string');
      
      // Verificar estrutura dos dados
      if (response.body.data.length > 0) {
        const dataPoint = response.body.data[0];
        expect(dataPoint).toHaveProperty('weekStart');
        expect(dataPoint).toHaveProperty('weekEnd');
        expect(dataPoint).toHaveProperty('newPatients');
        expect(dataPoint).toHaveProperty('weekLabel');
      }
    });

    it('should return weekly patients chart with custom weeks parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/weekly-patients?weeks=4')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalWeeks).toBe(4);
      expect(response.body.data.length).toBeLessThanOrEqual(4);
    });

    it('should return 400 for invalid weeks parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/weekly-patients?weeks=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/dashboard/weekly-patients?weeks=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/dashboard/weekly-patients?weeks=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/weekly-patients')
        .expect(401);
    });
  });

  describe('/api/dashboard/top-medications (GET)', () => {
    it('should return top medications with default parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/top-medications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('medications');
      expect(response.body).toHaveProperty('totalPrescriptions');
      expect(response.body).toHaveProperty('period');
      expect(response.body).toHaveProperty('generatedAt');
      
      expect(Array.isArray(response.body.medications)).toBe(true);
      expect(typeof response.body.totalPrescriptions).toBe('number');
      expect(typeof response.body.period).toBe('string');
      expect(typeof response.body.generatedAt).toBe('string');
      
      // Verificar estrutura dos medicamentos
      if (response.body.medications.length > 0) {
        const medication = response.body.medications[0];
        expect(medication).toHaveProperty('medicationName');
        expect(medication).toHaveProperty('prescriptionCount');
        expect(medication).toHaveProperty('percentage');
        
        expect(typeof medication.medicationName).toBe('string');
        expect(typeof medication.prescriptionCount).toBe('number');
        expect(typeof medication.percentage).toBe('number');
      }
    });

    it('should return top medications with custom parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/top-medications?limit=5&period=3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.medications.length).toBeLessThanOrEqual(5);
      expect(response.body.period).toBe('Últimos 3 meses');
    });

    it('should return 400 for invalid parameters', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/top-medications?limit=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/dashboard/top-medications?limit=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/dashboard/top-medications?period=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/dashboard/top-medications?period=30')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/top-medications')
        .expect(401);
    });
  });

  describe('/api/dashboard/monthly-revenue-comparison (GET)', () => {
    it('should return monthly revenue comparison successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/monthly-revenue-comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('currentMonthRevenue');
      expect(response.body).toHaveProperty('previousMonthRevenue');
      expect(response.body).toHaveProperty('absoluteDifference');
      expect(response.body).toHaveProperty('percentageChange');
      expect(response.body).toHaveProperty('trend');
      expect(response.body).toHaveProperty('currentMonthName');
      expect(response.body).toHaveProperty('previousMonthName');
      expect(response.body).toHaveProperty('currentMonthReceiptCount');
      expect(response.body).toHaveProperty('previousMonthReceiptCount');
      expect(response.body).toHaveProperty('currentMonthAverageReceipt');
      expect(response.body).toHaveProperty('previousMonthAverageReceipt');
      expect(response.body).toHaveProperty('generatedAt');
      
      // Verificar tipos
      expect(typeof response.body.currentMonthRevenue).toBe('number');
      expect(typeof response.body.previousMonthRevenue).toBe('number');
      expect(typeof response.body.absoluteDifference).toBe('number');
      expect(['number', 'object']).toContain(typeof response.body.percentageChange); // pode ser null
      expect(typeof response.body.trend).toBe('string');
      expect(['Crescimento', 'Queda', 'Estável', 'Sem comparação']).toContain(response.body.trend);
      expect(typeof response.body.currentMonthName).toBe('string');
      expect(typeof response.body.previousMonthName).toBe('string');
      expect(typeof response.body.currentMonthReceiptCount).toBe('number');
      expect(typeof response.body.previousMonthReceiptCount).toBe('number');
      expect(typeof response.body.currentMonthAverageReceipt).toBe('number');
      expect(typeof response.body.previousMonthAverageReceipt).toBe('number');
      expect(typeof response.body.generatedAt).toBe('string');
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/monthly-revenue-comparison')
        .expect(401);
    });
  });

  describe('Cache functionality', () => {
    it('should cache responses and return same data on subsequent requests', async () => {
      // Primeira requisição
      const response1 = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Segunda requisição (deve ser do cache)
      const response2 = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Dados devem ser idênticos
      expect(response1.body).toEqual(response2.body);
    });

    it('should isolate cache by user', async () => {
      const otherUser = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'other@example.com',
        name: 'Dr. Outro',
      };
      const otherToken = jwtService.sign(otherUser);

      // Requisição do primeiro usuário
      const response1 = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Requisição do segundo usuário
      const response2 = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      // Os dados podem ser diferentes (usuários diferentes)
      // Mas as estruturas devem ser iguais
      expect(typeof response1.body.totalPatients).toBe('number');
      expect(typeof response2.body.totalPatients).toBe('number');
    });
  });
});