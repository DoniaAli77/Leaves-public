import { LeaveStatus } from '../enums/leave-status.enum';

/**
 * DTO for filtering leave requests.  All fields are optional.
 */
export class FilterLeaveRequestsDto {
  employeeId?: string;
  status?: LeaveStatus;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}
