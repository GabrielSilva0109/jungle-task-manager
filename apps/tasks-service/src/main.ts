import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Skip microservice setup - using HTTP directly
  // const rmqUrl = configService.get<string>('RABBITMQ_URL');
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [rmqUrl],
  //     queue: 'tasks_queue',
  //     queueOptions: {
  //       durable: false,
  //     },
  //   },
  // });

  // await app.startAllMicroservices();
  
  const port = configService.get<number>('PORT') || 3003;
  await app.listen(port);
  
  console.log(`Tasks Service is running on port ${port}`);
}

bootstrap();