import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Signal, SignalSchema } from './schemas/signal';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Signal.name, schema: SignalSchema }]),
    RabbitMQModule,
    RabbitMQService,
  ],
  providers: [SignalsService],
  exports: [SignalsService],
  controllers: [SignalsController],
})
export class SignalsModule {}
