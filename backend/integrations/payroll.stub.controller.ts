import { Controller, Post, Body } from '@nestjs/common';
@Controller('integrations/payroll')
export class PayrollStubController {
  @Post('adjust')
  adjustPayroll(@Body() payload: any) {
    console.log('Payroll stub adjust', payload);
    return { ok: true };
  }
}
