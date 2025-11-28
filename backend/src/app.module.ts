import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// --- Feature Modules (Based on your file explorer) ---
import { LeaveTypesModule } from './models/leave-types/leave-types.module';
import { LeavePoliciesModule } from './models/leave-policies/leave-policies.module'; // Replaces VacationPackages
import { LeaveRequestsModule } from './models/leave-requests/leave-requests.module';
import { LeaveEntitlementsModule } from './models/leave-entitlements/leave-entitlements.module';
import { LeaveAdjustmentsModule } from './models/leave-adjustments/leave-adjustments.module';
import { OrganizationCalendarModule } from './models/organization-calendar/organization-calendar.module';
import { IntegrationModule } from './models/integration/integration.module';


@Module({
  imports: [
    // 1. Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // 2. Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.dbName'),
        ...configService.get('database.options'),
      }),
      inject: [ConfigService],
    }),

    // 3. Feature Modules
    LeaveTypesModule,
    LeavePoliciesModule,
    LeaveRequestsModule,
    LeaveEntitlementsModule,
    LeaveAdjustmentsModule,
    OrganizationCalendarModule,
    IntegrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}