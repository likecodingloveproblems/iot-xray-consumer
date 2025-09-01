import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly QUEUE = 'xray_queue';

  async onModuleInit() {
    this.connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.QUEUE, { durable: true });
    console.log(`Connected to RabbitMQ and asserted queue: ${this.QUEUE}`);
  }

  async consume(callback: (msg: amqp.ConsumeMessage) => void) {
    await this.channel.consume(this.QUEUE, (msg) => {
      if (msg) {
        callback(msg);
        this.channel.ack(msg); // Ack message after processing
      }
    });
  }

  async sendToQueue(message: any) {
    await this.channel.sendToQueue(
      this.QUEUE,
      Buffer.from(JSON.stringify(message)),
    );
  }
}
