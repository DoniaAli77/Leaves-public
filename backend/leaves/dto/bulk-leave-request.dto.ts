/**
 * DTO for bulk processing of leave requests.  `approverId` is the ID of
 * the HR manager performing the operation.  Each item in `requests`
 * specifies the request to process, the decision, and an optional
 * reason.
 */
export class BulkLeaveRequestDto {
  approverId: string;
  requests: {
    id: string;
    decision: 'APPROVED' | 'REJECTED';
    reason?: string;
  }[];
}
