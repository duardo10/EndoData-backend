import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PatientGender } from '../entities/patient.entity';

/**
 * DTO para filtros de busca de pacientes.
 * Permite filtrar pacientes por nome, CPF, idade e gênero.
 */
export class SearchPatientsDto {
  /**
   * Nome do paciente (busca parcial, case-insensitive).
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
}
