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
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb://root:password@localhost:27017/pantohealth?authSource=admin',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
