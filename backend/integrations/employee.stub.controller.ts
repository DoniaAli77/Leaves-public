import { Controller, Get, Param } from '@nestjs/common';

// lightweight employee stub - replace with real Employee service
@Controller('integrations/employee')
export class EmployeeStubController {
  // returns basic employee info; in real system, call user service
  @Get(':id')
  getEmployee(@Param('id') id: string) {
    // example, adjust hireDate/grade as needed
    return {
      id,
      name: 'Jana Example',
      grade: 'G1',
      hireDate: '2023-01-01',
      managerId: 'manager-123'
    };
  }

  @Get(':id/manager')
  getManager(@Param('id') id: string) {
    return {
      id: 'manager-123',
      name: 'Manager Example'
    };
  }
}
