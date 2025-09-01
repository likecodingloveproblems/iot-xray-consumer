import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { SignalsModule } from './signals/signals.module';

@Module({
  imports: [RabbitmqModule, SignalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
