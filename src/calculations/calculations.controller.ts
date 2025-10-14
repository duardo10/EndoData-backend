import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
// import { Public } from '../auth/decorators/public.decorator';

@ApiTags('calculations')
@Controller('calculations')
export class CalculationsController {
  // @Public()
  @Post('imc')
  @ApiOperation({ summary: 'Cálculo de IMC', description: 'Calcula o IMC e sua classificação nutricional.' })
  @ApiBody({ schema: {
    type: 'object', properties: {
      weight: { type: 'number', description: 'Peso em kg' },
      height: { type: 'number', description: 'Altura em cm' }
    }, required: ['weight', 'height']
  }})
  @ApiResponse({ status: 200, description: 'Valor e classificação IMC', schema: { example: { imc: 22.5, classification: 'Normal' }}})
  imc(@Body() { weight, height }: { weight: number, height: number }) {
    const heightM = height / 100;
    const imc = weight / (heightM * heightM);
    let classification = '';
    if (imc < 18.5) classification = 'Abaixo do Peso';
    else if (imc < 25) classification = 'Normal';
    else if (imc < 30) classification = 'Sobrepeso';
    else if (imc < 35) classification = 'Obesidade Grau I';
    else if (imc < 40) classification = 'Obesidade Grau II';
    else classification = 'Obesidade Grau III';
    return { imc: Number(imc.toFixed(1)), classification };
  }

  // @Public()
  @Post('bmr')
  @ApiOperation({ summary: 'Cálculo de Metabolismo Basal (BMR/TMB)', description: 'Calcula BMR/TMB com ajuste de nível de atividade.' })
  @ApiBody({ schema: {
    type: 'object', properties: {
      weight: { type: 'number', description: 'Peso em kg' },
      height: { type: 'number', description: 'Altura em cm' },
      age: { type: 'number', description: 'Idade em anos' },
      sex: { type: 'string', enum: ['masculino', 'feminino', 'M', 'F'], description: 'Sexo' },
      activityLevel: { type: 'string', enum: ['sedentario', 'leve', 'moderado', 'intenso', 'muito-intenso'], description: 'Nível de atividade física' }
    }, required: ['weight', 'height', 'age', 'sex', 'activityLevel']
  }})
  @ApiResponse({ status: 200, description: 'Valor do BMR ajustado', schema: { example: { bmr: 1749 }}})
  bmr(@Body() { weight, height, age, sex, activityLevel }: { weight: number, height: number, age: number, sex: string, activityLevel: string }) {
    let bmr: number;
    const isMale = sex === 'masculino' || sex === 'M';
    if (isMale) bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    else bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    const factors: Record<string, number> = {
      'sedentario': 1.2, 'leve': 1.375, 'moderado': 1.55, 'intenso': 1.725, 'muito-intenso': 1.9
    };
    const adjusted = Math.round(bmr * (factors[activityLevel] || 1.2));
    return { bmr: adjusted };
  }
}
