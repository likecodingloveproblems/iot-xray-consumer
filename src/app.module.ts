import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { SignalsModule } from './signals/signals.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    RabbitMQModule,
    SignalsModule,
    MongooseModule.forRoot('mongodb://localhost:27017/yourdbname'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
