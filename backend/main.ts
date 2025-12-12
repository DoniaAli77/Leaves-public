import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.enableCors({
    origin: "http://localhost:3001", // Your Next.js frontend
    methods: "GET,POST,PATCH,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log(`🚀 Server is running at: http://localhost:${port}`);
  console.log('CORS enabled for http://localhost:3001');
  console.log('');
}
bootstrap();
