
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import seedAdminUser from './seed-admin';

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

  // Seed admin user após app inicializar
  const port = configService.get<number>('PORT') || 3010;
  await app.listen(port);
  try {
    await seedAdminUser(app);
  } catch (err) {
    console.error('Erro ao criar admin user:', err);
  }
  console.log(`Auth Service is running on port ${port}`);

  // Skip microservice setup for now - using HTTP directly
  // const rmqUrl = configService.get<string>('RABBITMQ_URL');
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [rmqUrl],
  //     queue: 'auth_queue',
  //     queueOptions: {
  //       durable: false,
  //     },
  //   },
  // });

  // await app.startAllMicroservices();
  
}

bootstrap();