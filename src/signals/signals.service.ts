import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Signal } from './schemas/signal';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

type XRayMessage = {
  time: number;
  data: [[number, [number, number, number]]];
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

    const [deviceId, content] = Object.entries(msg)[0] as [string, XRayMessage];

    const data = content.data || [];
    const dataLength = data.length;
    const dataVolume = JSON.stringify(data).length;
    const time = content.time;

    const signalDoc = new this.signalModel({
      deviceId,
      time,
      data,
      dataLength,
      dataVolume,
    });

    await signalDoc.save();
  }
  async create(data: any): Promise<Signal> {
    const doc = new this.signalModel(data);
    return doc.save();
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
