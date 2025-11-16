import { Controller, Post, Body } from '@nestjs/common';
@Controller('integrations/time')
export class TimeStubController {
  // block days for attendance - stub
  @Post('block-day')
  blockDay(@Body() payload: any) {
    console.log('Time stub block-day', payload);
    return { ok: true };
  }
}
