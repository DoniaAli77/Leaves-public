import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './employee-profile/auth/auth.module';

import { LeavesModule } from './leaves/leaves.module';

import { EmployeeProfileModule } from './employee-profile/employee-profile.module';



import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Connect to MongoDB (Atlas preferred)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/hr_system';
        return {
          uri: mongoUri,
        };
      },
    }),

    AuthModule,

    LeavesModule,

    EmployeeProfileModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}