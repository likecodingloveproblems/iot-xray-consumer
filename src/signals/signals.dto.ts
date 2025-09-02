import { IsString, IsNumber, Min, IsObject, IsArray } from 'class-validator';
import { Signal } from './schemas/signal';

export class CreateSignalDto {
  @IsString()
  deviceId: string;

  @IsNumber()
  @Min(0)
  timestamp: number;

  @IsArray()
  data: { time: number; x: number; y: number; speed: number }[];
}
