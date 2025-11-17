//src/common/utils/validators.ts

export class Validators {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (basic international format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  /**
   * Validate date is not in the past
   */
  static isNotPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  /**
   * Validate date range (start date before end date)
   */
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  /**
   * Validate string is not empty or whitespace
   */
  static isNotEmptyString(value: string): boolean {
    return value != null && value.trim().length > 0;
  }

  /**
   * Validate number is within range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate array is not empty
   */
  static isNotEmptyArray<T>(array: T[]): boolean {
    return Array.isArray(array) && array.length > 0;
  }

  /**
   * Validate MongoDB ObjectId format
   */
  static isValidObjectId(id: string): boolean {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  /**
   * Validate percentage (0-100)
   */
  static isValidPercentage(value: number): boolean {
    return this.isInRange(value, 0, 100);
  }

  /**
   * Sanitize string (remove special characters)
   */
  static sanitizeString(value: string): string {
    return value.replace(/[^a-zA-Z0-9\s-_]/g, '');
  }

  /**
   * Check if date is within a specific year
   */
  static isInYear(date: Date, year: number): boolean {
    return date.getFullYear() === year;
  }

  /**
   * Validate minimum advance notice
   */
  static hasMinimumAdvanceNotice(
    requestDate: Date,
    leaveStartDate: Date,
    minDays: number,
  ): boolean {
    const diffTime = leaveStartDate.getTime() - requestDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= minDays;
  }

  /**
   * Check if dates overlap
   */
  static doDatesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
  ): boolean {
    return start1 <= end2 && start2 <= end1;
  }
}