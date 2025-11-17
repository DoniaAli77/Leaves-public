import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VacationPackagesService } from './vacation-packages.service';
import { VacationPackagesController } from './vacation-packages.controller';
import {
  VacationPackage,
  VacationPackageSchema,
} from './schemas/vacation-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VacationPackage.name, schema: VacationPackageSchema },
    ]),
  ],
  controllers: [VacationPackagesController],
  providers: [VacationPackagesService],
  exports: [VacationPackagesService],
})
export class VacationPackagesModule {}