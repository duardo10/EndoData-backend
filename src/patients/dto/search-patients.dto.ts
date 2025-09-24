import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PatientGender } from '../entities/patient.entity';

export enum SortField {
  NAME = 'name',
  AGE = 'age',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * DTO para filtros de busca de pacientes.
 * Permite filtrar pacientes por nome, CPF, idade, gênero, busca por texto livre e ordenação.
 */
export class SearchPatientsDto {
  /**
   * Busca por texto livre em nome e email (busca parcial, case-insensitive).
   * Este campo substitui os filtros específicos de nome e email quando fornecido.
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  searchText?: string;

  /**
   * Nome do paciente (busca parcial, case-insensitive).
   * Usado apenas quando searchText não é fornecido.
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  /**
   * CPF do paciente (busca exata).
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  cpf?: string;

  /**
   * Idade mínima do paciente.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(150)
  @Transform(({ value }) => parseInt(value))
  minAge?: number;

  /**
   * Idade máxima do paciente.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(150)
  @Transform(({ value }) => parseInt(value))
  maxAge?: number;

  /**
   * Gênero do paciente.
   */
  @IsOptional()
  @IsEnum(PatientGender)
  gender?: PatientGender;

  /**
   * Número da página para paginação (opcional).
   */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  /**
   * Limite de resultados por página (opcional).
   */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;

  /**
   * Campo para ordenação (opcional).
   */
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.NAME;

  /**
   * Direção da ordenação (opcional).
   */
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
