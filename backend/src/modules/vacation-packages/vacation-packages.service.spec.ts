import { Test, TestingModule } from '@nestjs/testing';
import { VacationPackagesService } from './vacation-packages.service';

describe('VacationPackagesService', () => {
  let service: VacationPackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VacationPackagesService],
    }).compile();

    service = module.get<VacationPackagesService>(VacationPackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
