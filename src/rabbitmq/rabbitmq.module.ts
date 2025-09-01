import { Module, Global } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Global() // make it available across the app
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
