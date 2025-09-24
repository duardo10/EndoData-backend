/**
 * Enum que define os tipos de cálculos metabólicos suportados pelo sistema.
 * 
 * Cada tipo representa uma categoria específica de cálculo metabólico
 * com suas próprias fórmulas e parâmetros de entrada.
 * 
 * @enum {string}
 */
export enum CalculationType {
  /**
   * Índice de Massa Corporal (Body Mass Index).
   * Calcula a relação entre peso e altura para avaliar o estado nutricional.
   * 
   * @type {string}
   * @value "BMI"
   * @formula peso / (altura²)
   * @example "BMI"
   */
  BMI = 'BMI',
  
  /**
   * Taxa Metabólica Basal (Basal Metabolic Rate).
   * Calcula a quantidade mínima de calorias necessárias para manter
   * as funções vitais em repouso.
   * 
   * @type {string}
   * @value "BMR"
   * @formula Varia conforme fórmula (Harris-Benedict, Mifflin-St Jeor, etc.)
   * @example "BMR"
   */
  BMR = 'BMR',
  
  /**
   * Gasto Energético Diário Total (Total Daily Energy Expenditure).
   * Calcula o total de calorias queimadas em um dia, incluindo
   * metabolismo basal e atividade física.
   * 
   * @type {string}
   * @value "TDEE"
   * @formula BMR × fator de atividade
   * @example "TDEE"
   */
  TDEE = 'TDEE',
}


