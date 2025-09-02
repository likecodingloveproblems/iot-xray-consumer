import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Signal } from './schemas/signal';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { CreateSignalDto } from './signals.dto';
import { timeStamp } from 'console';

type XRayMessage = {
  time: number;
  data: [[number, [number, number, number]]];
};
type IncomingSignalMessage = {
  [deviceId: string]: XRayMessage;
};

@Injectable()
export class SignalsService implements OnModuleInit {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectModel(Signal.name) private signalModel: Model<Signal>,
    private readonly rabbit: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbit.registerSignalConsumer(
      this.processIncomingSignal.bind(this),
    );
  }

  private async processIncomingSignal(msg: any) {
    this.logger.log(`Received signal payload`);
    const payload: string = msg.content.toString();
    if (payload === '') {
      return;
    }
    const messageObject: IncomingSignalMessage = JSON.parse(payload);
    const [deviceId, content] = Object.entries(messageObject)[0] as [
      string,
      XRayMessage,
    ];

    const data = content.data || [];
    const dataLength = data.length;
    const dataVolume = JSON.stringify(data).length;
    const time = content.time;

    const signalDoc = new this.signalModel({
      deviceId,
      data,
      dataLength,
      dataVolume,
      timestamp: time,
    });
    await signalDoc.save();
  }

  async create(data: CreateSignalDto): Promise<Signal> {
    const signal = new this.signalModel({
      deviceId: data.deviceId,
      timestamp: data.timestamp,
      dataLength: data.data.length,
      dataVolume: JSON.stringify(data.data).length,
      data: data.data,
    });
    return signal.save();
  }

  async findAll(skip = 0, limit = 50): Promise<Signal[]> {
    return this.signalModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ time: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Signal | null> {
    return this.signalModel.findById(id).exec();
  }

  async update(id: string, updateDto: any): Promise<Signal | null> {
    return this.signalModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.signalModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
