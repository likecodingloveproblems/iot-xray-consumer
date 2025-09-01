import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Signal extends Document {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  dataLength: number;

  @Prop({ required: true })
  dataVolume: number;

  @Prop({ type: Array, default: [] })
  data: {
    time: number;
    x: number;
    y: number;
    speed: number;
  }[];
}

export const SignalSchema = SchemaFactory.createForClass(Signal);
