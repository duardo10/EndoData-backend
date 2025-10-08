import { IsEnum, IsObject } from 'class-validator';
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


