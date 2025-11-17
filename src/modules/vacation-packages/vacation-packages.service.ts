import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VacationPackage,
  VacationPackageDocument,
} from './schemas/vacation-package.schema';
import { CreateVacationPackageDto } from './dto/create-vacation-package.dto';
import { UpdateVacationPackageDto } from './dto/update-vacation-package.dto';

@Injectable()
export class VacationPackagesService {
  constructor(
    @InjectModel(VacationPackage.name)
    private vacationPackageModel: Model<VacationPackageDocument>,
  ) {}

  async create(
    createVacationPackageDto: CreateVacationPackageDto,
  ): Promise<VacationPackage> {
    const existingPackage = await this.vacationPackageModel.findOne({
      code: createVacationPackageDto.code,
    });

    if (existingPackage) {
      throw new ConflictException(
        `Vacation package with code '${createVacationPackageDto.code}' already exists`,
      );
    }

    const createdPackage = new this.vacationPackageModel(
      createVacationPackageDto,
    );
    return createdPackage.save();
  }

  async findAll(): Promise<VacationPackage[]> {
    return this.vacationPackageModel
      .find()
      .populate('customEntitlements.leaveTypeId')
      .exec();
  }

  async findActive(): Promise<VacationPackage[]> {
    return this.vacationPackageModel
      .find({ isActive: true })
      .populate('customEntitlements.leaveTypeId')
      .exec();
  }

  async findOne(id: string): Promise<VacationPackage> {
    const vacationPackage = await this.vacationPackageModel
      .findById(id)
      .populate('customEntitlements.leaveTypeId')
      .exec();

    if (!vacationPackage) {
      throw new NotFoundException(
        `Vacation package with ID '${id}' not found`,
      );
    }

    return vacationPackage;
  }

  async findByCode(code: string): Promise<VacationPackage> {
    const vacationPackage = await this.vacationPackageModel
      .findOne({ code })
      .populate('customEntitlements.leaveTypeId')
      .exec();

    if (!vacationPackage) {
      throw new NotFoundException(
        `Vacation package with code '${code}' not found`,
      );
    }

    return vacationPackage;
  }

  async findByContractType(contractType: string): Promise<VacationPackage[]> {
    return this.vacationPackageModel
      .find({ contractType, isActive: true })
      .populate('customEntitlements.leaveTypeId')
      .exec();
  }

  async update(
    id: string,
    updateVacationPackageDto: UpdateVacationPackageDto,
  ): Promise<VacationPackage> {
    if (updateVacationPackageDto.code) {
      const existingPackage = await this.vacationPackageModel.findOne({
        code: updateVacationPackageDto.code,
        _id: { $ne: id },
      });

      if (existingPackage) {
        throw new ConflictException(
          `Vacation package with code '${updateVacationPackageDto.code}' already exists`,
        );
      }
    }

    const updatedPackage = await this.vacationPackageModel
      .findByIdAndUpdate(id, updateVacationPackageDto, { new: true })
      .populate('customEntitlements.leaveTypeId')
      .exec();

    if (!updatedPackage) {
      throw new NotFoundException(
        `Vacation package with ID '${id}' not found`,
      );
    }

    return updatedPackage;
  }

  async remove(id: string): Promise<void> {
    const result = await this.vacationPackageModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(
        `Vacation package with ID '${id}' not found`,
      );
    }
  }

  async deactivate(id: string): Promise<VacationPackage> {
    const vacationPackage = await this.vacationPackageModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!vacationPackage) {
      throw new NotFoundException(
        `Vacation package with ID '${id}' not found`,
      );
    }

    return vacationPackage;
  }

  async activate(id: string): Promise<VacationPackage> {
    const vacationPackage = await this.vacationPackageModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!vacationPackage) {
      throw new NotFoundException(
        `Vacation package with ID '${id}' not found`,
      );
    }

    return vacationPackage;
  }
}