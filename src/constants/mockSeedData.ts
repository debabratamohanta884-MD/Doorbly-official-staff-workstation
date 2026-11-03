/**
 * DOORBLY OPERATIONAL PRODUCTION BASELINE
 * Zero mock/fake/demo data. Clean workstation baseline for real remote operations
 * across all 30 Districts of Odisha, India.
 */

import {
  StaffProfile,
  DailyTask,
  TaskSubmission,
  WorkCreditEntry,
  AttendanceRecord,
  CustomerLead,
  CorporateProspect,
  PartnerApplication,
  BookingRecord,
  ComplaintTicket,
  SystemAnnouncement,
  SystemAuditLog,
  StaffWallet,
  StaffWalletTransaction,
  StaffWorkAssignment,
  StaffWithdrawalRequest,
  StaffNotification
} from '../types/doorbly';

export const INITIAL_STAFF_MEMBERS: StaffProfile[] = [
  {
    id: 'staff-admin-01',
    employeeId: 'DBL-OD-001',
    fullName: 'Debabrata Mohanta',
    email: 'debabratamohanta884@gmail.com',
    mobile: '+91 94370 12345',
    departmentId: 'dept_central_exec',
    departmentName: 'Central Executive Administration',
    designationId: 'dm',
    designationTitle: 'State Director & Central Admin',
    systemRole: 'super_admin',
    districtId: 'khordha',
    districtName: 'Khordha (Bhubaneswar HQ)',
    joiningDate: '2024-01-15',
    status: 'active',
    permissionLevel: 'admin'
  }
];

export const INITIAL_DAILY_TASKS: DailyTask[] = [];
export const INITIAL_SUBMISSIONS: TaskSubmission[] = [];
export const INITIAL_WORK_CREDITS: WorkCreditEntry[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_LEADS: CustomerLead[] = [];
export const INITIAL_CORP_PROSPECTS: CorporateProspect[] = [];
export const INITIAL_PARTNER_APPLICATIONS: PartnerApplication[] = [];
export const INITIAL_BOOKINGS: BookingRecord[] = [];
export const INITIAL_COMPLAINT_TICKETS: ComplaintTicket[] = [];
export const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'aud-live-001',
    actorId: 'DBL-OD-001',
    actorName: 'Debabrata Mohanta',
    actorRole: 'super_admin',
    action: 'SYSTEM_BOOTSTRAP',
    module: 'Core Infrastructure',
    details: 'Real-time production workstation and database engine initialized across 30 districts of Odisha.',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_WORK_ASSIGNMENTS: StaffWorkAssignment[] = [];

export const INITIAL_WALLETS: StaffWallet[] = [
  {
    id: 'wlt-staff-admin-01',
    staffId: 'staff-admin-01',
    employeeId: 'DBL-OD-001',
    fullName: 'Debabrata Mohanta',
    departmentId: 'dept_central_exec',
    departmentName: 'Central Executive Administration',
    designationTitle: 'State Director & Central Admin',
    districtName: 'Khordha (Bhubaneswar HQ)',
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    approvedEarnings: 0,
    totalWithdrawnAmount: 0,
    totalAdminAdjustments: 0,
    totalCompletedWork: 0,
    currentMonthEarnings: 0,
    bankAccountDetails: {
      accountHolderName: 'Debabrata Mohanta',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      upiId: '',
      isKycVerified: false
    },
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_WALLET_TXNS: StaffWalletTransaction[] = [];
export const INITIAL_WITHDRAWALS: StaffWithdrawalRequest[] = [];
export const INITIAL_NOTIFICATIONS: StaffNotification[] = [];
