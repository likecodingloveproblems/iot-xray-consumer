// rabbitmq.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private connectionString =
    process.env.RABBITMQ_URI || 'amqp://localhost:5672';

  private readonly queues = ['xray_queue'];

  async onModuleInit() {
    await this.connect();
    await this.assertQueues();
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  private async connect() {
    this.connection = await amqp.connect(this.connectionString);
    this.channel = await this.connection.createChannel();
    this.logger.log('Connected to RabbitMQ');
  }

  private async assertQueues() {
    for (const queue of this.queues) {
      await this.channel.assertQueue(queue, { durable: true });
      this.logger.log(`Queue asserted: ${queue}`);
    }
  }

  async sendToQueue(queue: string, message: any) {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    this.logger.log(
      `Message sent to queue ${queue}: ${JSON.stringify(message)}`,
    );
  }

  private async consumeXRayQueue(callback: (msg: any) => void) {
    await this.channel.consume(
      'xray_queue',
      (msg) => {
        if (msg) {
          this.logger.log(`Received X-ray data: ${msg}`);

          try {
            callback(msg);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Error processing message', error.stack);
            // here we must handle retry and dead letter queue

          }
        }
      },
      { noAck: false },
    );
  }
  public async registerSignalConsumer(callback: (msg: any) => void) {
    await this.consumeXRayQueue(callback);
  }
}
