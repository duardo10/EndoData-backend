import { IsEnum, IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { CalculationType } from '../enums/calculation-type.enum';

/**
 * DTO para criação de um cálculo metabólico.
 * 
 * Contém todas as informações necessárias para criar um novo registro
 * de cálculo metabólico, incluindo referências ao paciente e usuário,
 * tipo de cálculo e dados de entrada dinâmicos.
 * 
 * @class CreateCalculationDto
 */
export class CreateCalculationDto {
  /**
   * Identificador único do paciente alvo do cálculo.
   * Deve ser um UUID válido de um paciente existente.
   * 
   * @type {string}
   * @required
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  /**
   * Identificador único do usuário que executa o cálculo.
   * Pode ser sobreescrito pelo decorator @CurrentUser no controller.
   * 
   * @type {string}
   * @required
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174001"
   */
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  /**
   * Tipo do cálculo metabólico a ser realizado.
   * Define qual tipo de cálculo será executado (BMI, BMR ou TDEE).
   * 
   * @type {CalculationType}
   * @required
   * @enum BMI, BMR, TDEE
   * @example "BMI"
   */
  @IsEnum(CalculationType)
  calculationType: CalculationType;

  /**
   * Dados de entrada necessários para o cálculo.
   * Estrutura dinâmica contendo os parâmetros específicos para cada tipo de cálculo.
   * 
   * @type {Record<string, any>}
   * @required
   * @example { "weight": 70, "height": 1.75, "age": 30, "gender": "male" }
   */
  @IsObject()
  inputData: Record<string, any>;
}


