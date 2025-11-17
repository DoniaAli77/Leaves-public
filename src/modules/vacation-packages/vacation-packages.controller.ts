import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VacationPackagesService } from './vacation-packages.service';
import { CreateVacationPackageDto } from './dto/create-vacation-package.dto';
import { UpdateVacationPackageDto } from './dto/update-vacation-package.dto';

@Controller('vacation-packages')
export class VacationPackagesController {
  constructor(
    private readonly vacationPackagesService: VacationPackagesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVacationPackageDto: CreateVacationPackageDto) {
    return this.vacationPackagesService.create(createVacationPackageDto);
  }

  @Get()
  findAll() {
    return this.vacationPackagesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.vacationPackagesService.findActive();
  }

  @Get('contract-type/:contractType')
  findByContractType(@Param('contractType') contractType: string) {
    return this.vacationPackagesService.findByContractType(contractType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacationPackagesService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.vacationPackagesService.findByCode(code);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVacationPackageDto: UpdateVacationPackageDto,
  ) {
    return this.vacationPackagesService.update(id, updateVacationPackageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.vacationPackagesService.remove(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.vacationPackagesService.deactivate(id);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.vacationPackagesService.activate(id);
  }
}