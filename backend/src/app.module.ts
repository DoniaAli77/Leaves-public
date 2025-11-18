import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { LeaveTypesModule } from './modules/leave-types/leave-types.module';
import { VacationPackagesModule } from './modules/vacation-packages/vacation-packages.module';
import { OrganizationCalendarModule } from './modules/organization-calendar/organization-calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.dbName'),
        ...configService.get('database.options'),
      }),
      inject: [ConfigService],
    }),

    LeaveTypesModule,
    VacationPackagesModule,
    OrganizationCalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


