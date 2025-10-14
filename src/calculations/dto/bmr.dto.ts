import { IsNumber, IsString, IsIn } from 'class-validator';

export class BmrDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  height: number;

  @IsNumber()
  age: number;

  @IsString()
  @IsIn(['masculino', 'feminino', 'M', 'F'])
  sex: string;

  @IsString()
  @IsIn(['sedentario', 'leve', 'moderado', 'intenso', 'muito-intenso'])
  activityLevel: string;
}
