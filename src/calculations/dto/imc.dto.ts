import { IsNumber } from 'class-validator';

export class ImcDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  height: number;
}
