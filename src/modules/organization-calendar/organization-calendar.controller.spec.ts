import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationCalendarController } from './organization-calendar.controller';

describe('OrganizationCalendarController', () => {
  let controller: OrganizationCalendarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationCalendarController],
    }).compile();

    controller = module.get<OrganizationCalendarController>(OrganizationCalendarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
