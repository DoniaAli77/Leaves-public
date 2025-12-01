import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LeavesModule } from './leaves/leaves.module';

console.log('MONGODB_URI from env:', process.env.MONGODB_URI);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    LeavesModule,
  ],
})
export class AppModule {}
