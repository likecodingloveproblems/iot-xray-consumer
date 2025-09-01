import { IsString, IsNumber, Min, IsObject } from 'class-validator';
import { Signal } from './schemas/signal';

export class CreateSignalDto {
  @IsString()
  deviceId: string;

  @IsNumber()
  @Min(0)
  time: number;

  @IsObject()
  data: { time: number; x: number; y: number; speed: number }[];

  toSchema(): Signal {
    return new Signal({
      deviceId: this.deviceId,
      timestamp: this.time,
      dataLength: this.data.length,
      dataVolume: JSON.stringify(this.data).length,
      data: this.data,
    });
  }
}
