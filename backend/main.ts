import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Print the URL clearly
  console.log('');
  console.log(`🚀 Server is running at: http://localhost:${port}`);
  console.log('');
}
bootstrap();
