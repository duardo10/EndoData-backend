import { Repository } from 'typeorm';

/**
 * Mock factory for TypeORM repositories
 */
export class MockRepository<T> {
  private data: T[] = [];
  private nextId = 1;

  findOne = jest.fn();
  find = jest.fn();
  save = jest.fn();
  create = jest.fn();
  delete = jest.fn();
  remove = jest.fn();
  count = jest.fn();
  createQueryBuilder = jest.fn();
  softDelete = jest.fn();
  restore = jest.fn();

  constructor(initialData: T[] = []) {
    this.data = [...initialData];
    this.setupDefaultMocks();
  }

  private setupDefaultMocks() {
    // Default findOne mock
    this.findOne.mockImplementation((options: any) => {
      if (options?.where) {
        const found = this.data.find(item => {
          return Object.keys(options.where).every(key => 
            (item as any)[key] === options.where[key]
          );
        });
        return Promise.resolve(found || null);
      }
      return Promise.resolve(this.data[0] || null);
    });

    // Default find mock
    this.find.mockImplementation((options: any) => {
      return Promise.resolve([...this.data]);
    });

    // Default save mock
    this.save.mockImplementation((entity: T | T[]) => {
      if (Array.isArray(entity)) {
        entity.forEach(item => {
          if (!(item as any).id) {
            (item as any).id = `mock-id-${this.nextId++}`;
          }
          this.data.push(item);
        });
        return Promise.resolve(entity);
      } else {
        if (!(entity as any).id) {
          (entity as any).id = `mock-id-${this.nextId++}`;
        }
        this.data.push(entity);
        return Promise.resolve(entity);
      }
    });

    // Default create mock
    this.create.mockImplementation((data: any) => {
      return { ...data, id: `mock-id-${this.nextId++}` };
    });

    // Default delete mock
    this.delete.mockImplementation((id: string) => {
      this.data = this.data.filter(item => (item as any).id !== id);
      return Promise.resolve({ affected: 1 });
    });

    // Default remove mock
    this.remove.mockImplementation((entity: T) => {
      this.data = this.data.filter(item => item !== entity);
      return Promise.resolve(entity);
    });

    // Default count mock
    this.count.mockImplementation((options: any) => {
      return Promise.resolve(this.data.length);
    });

    // Default createQueryBuilder mock
    this.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(this.data),
      getManyAndCount: jest.fn().mockResolvedValue([this.data, this.data.length]),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
    });

    // Default softDelete mock
    this.softDelete.mockImplementation((id: string) => {
      return Promise.resolve({ affected: 1 });
    });

    // Default restore mock
    this.restore.mockImplementation((id: string) => {
      return Promise.resolve({ affected: 1 });
    });
  }

  /**
   * Add data to the mock repository
   */
  addData(data: T | T[]) {
    if (Array.isArray(data)) {
      this.data.push(...data);
    } else {
      this.data.push(data);
    }
  }

  /**
   * Clear all data from the mock repository
   */
  clearData() {
    this.data = [];
  }

  /**
   * Get all data from the mock repository
   */
  getData() {
    return [...this.data];
  }

  /**
   * Reset all mocks
   */
  resetMocks() {
    this.findOne.mockReset();
    this.find.mockReset();
    this.save.mockReset();
    this.create.mockReset();
    this.delete.mockReset();
    this.remove.mockReset();
    this.count.mockReset();
    this.createQueryBuilder.mockReset();
    this.softDelete.mockReset();
    this.restore.mockReset();
    this.setupDefaultMocks();
  }
}

/**
 * Create a mock repository for a specific entity
 */
export function createMockRepository<T>(initialData: T[] = []): MockRepository<T> {
  return new MockRepository<T>(initialData);
}

/**
 * Mock factory for TypeORM getRepositoryToken
 */
export function createRepositoryMock<T>(initialData: T[] = []) {
  return createMockRepository<T>(initialData);
}
