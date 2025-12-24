import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
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

  // Enable CORS for WebSocket
  app.enableCors({
    origin: ['http://localhost:3000', 'http://web:3000'],
    credentials: true,
  });

  // Setup RabbitMQ microservice
  const rmqUrl = configService.get<string>('RABBITMQ_URL');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  console.log('🚀 Notifications service microservice started');
  
  const port = configService.get<number>('PORT') || 3004;
  await app.listen(port);
  
  console.log(`Notifications Service is running on port ${port}`);
}

bootstrap();