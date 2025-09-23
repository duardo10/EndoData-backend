import { IsEnum, IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { CalculationType } from '../enums/calculation-type.enum';

/**
 * DTO para criação de um cálculo metabólico.
 * Recebe referências ao paciente e ao usuário autenticado, além do tipo e entradas do cálculo.
 */
export class CreateCalculationDto {
  /** ID do paciente alvo do cálculo. */
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  /** ID do usuário que executa o cálculo (pode ser sobreescrito pelo CurrentUser). */
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  /** Tipo do cálculo: BMI, BMR ou TDEE. */
  @IsEnum(CalculationType)
  calculationType: CalculationType;

  /** Objeto com entradas dinâmicas necessárias ao cálculo. */
  @IsObject()
  inputData: Record<string, any>;
}


