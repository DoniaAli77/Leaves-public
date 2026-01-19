export enum LeaveStatus {
  PENDING = 'pending',                 // waiting for direct manager
  MANAGER_APPROVED = 'manager_approved', // waiting for HR review step
  APPROVED = 'approved',               // final
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}
