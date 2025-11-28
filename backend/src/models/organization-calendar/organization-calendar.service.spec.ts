import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationCalendarService } from './organization-calendar.service';

describe('OrganizationCalendarService', () => {
  let service: OrganizationCalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationCalendarService],
    }).compile();

    service = module.get<OrganizationCalendarService>(OrganizationCalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
