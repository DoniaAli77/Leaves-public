import { Test, TestingModule } from '@nestjs/testing';
import { VacationPackagesController } from './vacation-packages.controller';

describe('VacationPackagesController', () => {
  let controller: VacationPackagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacationPackagesController],
    }).compile();

    controller = module.get<VacationPackagesController>(VacationPackagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
