export const REQUEST_STATUS = {
  PENDING: 'pending',
  MANAGER_APPROVED: 'manager_approved',
  MANAGER_REJECTED: 'manager_rejected',
  HR_APPROVED: 'hr_approved',
  HR_REJECTED: 'hr_rejected',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const;
module.exports = { REQUEST_STATUS };
