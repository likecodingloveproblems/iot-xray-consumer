import {
  IsString,
  IsNumber,
  Min,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SignalData {
  @ApiProperty({ example: 123 })
  @IsNumber()
  time: number;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  x: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  y: number;

  @ApiProperty({ example: 0.8 })
  @IsNumber()
  speed: number;
}

export class CreateSignalDto {
  @ApiProperty({ example: 'device-1' })
  @IsString()
  deviceId: string;

  @ApiProperty({ example: 1693700000 })
  @IsNumber()
  @Min(0)
  timestamp: number;

  @ApiProperty({ type: [SignalData] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignalData)
  data: SignalData[];
}
