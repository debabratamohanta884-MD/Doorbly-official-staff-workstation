/**
 * DOORBLY REMOTE EMPLOYEE WORKSTATION & MANAGEMENT SYSTEM
 * Core TypeScript Definitions
 */

export type SystemRole =
  | 'super_admin'
  | 'central_dept_head'
  | 'district_manager'
  | 'district_coordinator'
  | 'employee';

export type DesignationId =
  | 'dm'
  | 'dc'
  | 'hr_exec'
  | 'tele_caller'
  | 'corp_caller'
  | 'partner_caller'
  | 'cust_support'
  | 'lead_gen_gen'
  | 'lead_gen_res'
  | 'lead_gen_corp'
  | 'tech_exec'
  | 'software_dev';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus =
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'reassigned'
  | 'cancelled';

export type AttendanceStatus =
  | 'present'
  | 'late'
  | 'half_day'
  | 'absent'
  | 'approved_leave'
  | 'weekly_off';

export type LeaveType = 'casual' | 'sick' | 'earned' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type CorporatePipelineStage =
  | 'new_prospect'
  | 'contacted'
  | 'interested'
  | 'qualified'
  | 'meeting_scheduled'
  | 'site_inspection'
  | 'quotation'
  | 'negotiation'
  | 'contract_won'
  | 'contract_lost';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'booking_ready'
  | 'booking_confirmed'
  | 'follow_up'
  | 'lost';

export type PartnerApplicationStatus =
  | 'applied'
  | 'document_collected'
  | 'verified'
  | 'approved'
  | 'activated'
  | 'rejected';

export type BookingStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded';

export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'escalated' | 'closed';

// 1. Department
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headStaffId?: string;
  isActive: boolean;
}

// 2. Job Designation
export interface JobDesignation {
  id: DesignationId | string;
  title: string;
  departmentId: string;
  systemRole: SystemRole;
  description: string;
  isActive: boolean;
}

// 3. Staff Profile
export interface StaffProfile {
  id: string; // Internal UUID
  employeeId: string; // e.g. DBL-OD-001
  fullName: string;
  email: string;
  mobile: string;
  departmentId: string;
  departmentName?: string;
  designationId: DesignationId | string;
  designationTitle?: string;
  systemRole: SystemRole;
  districtId: string; // 1 to 30
  districtName: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  joiningDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive' | 'suspended' | 'probation';
  photoUrl?: string;
  permissionLevel: 'admin' | 'manager' | 'coordinator' | 'staff';
}

// 4. District & 18. Daily District Targets
export interface DistrictMaster {
  id: string;
  name: string;
  dailyTarget: number; // in INR
  actualCompletedSubtotal: number;
  completedBookingsCount: number;
  activeStaffCount: number;
  managerName?: string;
  coordinatorName?: string;
  tier: 1 | 2 | 3;
}

// 6. Daily Tasks
export interface DailyTask {
  id: string;
  taskId: string; // e.g. TSK-202611-001
  staffId: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  designationId: string;
  districtId: string;
  taskTitle: string;
  taskDescription: string;
  taskValueCredit: number; // e.g. 50
  targetQuantity: number; // e.g. 10 calls
  priority: TaskPriority;
  assignedDate: string; // YYYY-MM-DD
  deadline: string; // ISO string / timestamp
  status: TaskStatus;
  requiredEvidenceType: 'screenshot' | 'document' | 'call_log' | 'lead_id' | 'booking_id' | 'none';
  assignedByStaffId: string;
  assignedByName: string;
  createdAt: string;
}

// 7. Task Submissions
export interface TaskSubmission {
  id: string;
  taskId: string;
  staffId: string;
  employeeId: string;
  employeeName: string;
  completedQuantity: number;
  referenceId?: string; // lead id, booking id, etc.
  description: string;
  evidenceUrl?: string;
  evidenceFileName?: string;
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedByStaffId?: string;
  approvedByName?: string;
  approvedAt?: string;
  awardedCredits?: number;
}

// 9. Task Value Master
export interface TaskValueItem {
  id: string;
  designationId: DesignationId | string;
  designationTitle: string;
  activityName: string;
  creditValue: number; // INR internal credits
  defaultDailyQuota: number;
  quotaUnit: string; // per day, per week
  description: string;
  isActive: boolean;
}

// 10. Employee Work Credits Ledger
export interface WorkCreditEntry {
  id: string;
  staffId: string;
  employeeId: string;
  date: string;
  taskId: string;
  taskDescription: string;
  approvedQuantity: number;
  perTaskValue: number;
  totalCredits: number;
  approverId: string;
  approverName: string;
  approvalDate: string;
}

// 11. Remote Attendance
export interface AttendanceRecord {
  id: string;
  staffId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  loginTime?: string; // HH:mm:ss IST
  logoutTime?: string; // HH:mm:ss IST
  totalWorkingMinutes: number;
  breakMinutes: number;
  isOnBreak: boolean;
  status: AttendanceStatus;
  locationVerified?: boolean;
  locationNote?: string;
  notes?: string;
}

// 12. Employee Leave
export interface LeaveRequest {
  id: string;
  staffId: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  approvedByStaffId?: string;
  approvedByName?: string;
  approvalNotes?: string;
}

// 13. Leads (CRM)
export interface CustomerLead {
  id: string;
  leadCode: string; // e.g. LD-1049
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  districtId: string;
  districtName: string;
  locality?: string;
  serviceCategory: string; // e.g. AC Repair, Electrical, Plumbing, Cleaning
  status: LeadStatus;
  estimatedValue: number;
  assignedStaffId: string;
  assignedStaffName: string;
  followUpDate?: string;
  notes: string;
  createdAt: string;
}

// 15. Corporate Prospects (CRM)
export interface CorporateProspect {
  id: string;
  prospectCode: string; // e.g. CRP-502
  organizationName: string;
  businessCategory: string; // e.g. IT Park, Hospital, Hotel, Manufacturing
  contactPerson: string;
  contactDesignation: string;
  mobile: string;
  email: string;
  districtId: string;
  districtName: string;
  serviceRequirements: string;
  estimatedAnnualValue: number;
  pipelineStage: CorporatePipelineStage;
  nextFollowUpDate: string;
  assignedStaffId: string;
  assignedStaffName: string;
  notes: string;
  updatedAt: string;
}

// 16. Partner Applications
export interface PartnerApplication {
  id: string;
  partnerCode: string; // e.g. PTR-302
  partnerName: string;
  mobile: string;
  districtId: string;
  districtName: string;
  locality: string;
  skills: string[];
  serviceCategories: string[];
  experienceYears: number;
  documentVerified: boolean;
  applicationStatus: PartnerApplicationStatus;
  assignedCallerId?: string;
  assignedCallerName?: string;
  notes?: string;
  submittedAt: string;
}

// 17. Booking Pipeline
export interface BookingRecord {
  id: string;
  bookingCode: string; // e.g. DBL-BK-8891
  customerName: string;
  customerMobile: string;
  districtId: string;
  districtName: string;
  serviceTitle: string;
  serviceSubtotal: number; // Completed service value before taxes
  applicableTax: number; // 18% GST
  customerPayable: number; // Customer total
  doorblyCommissionRate: number; // 20% markup model
  doorblyCommission: number; // e.g. 20% of subtotal
  partnerPayout: number; // subtotal - commission
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  scheduledDate: string;
  completedDate?: string;
  assignedPartnerName?: string;
  participatingStaffId?: string;
  participatingStaffName?: string;
  reconciliationStatus: 'reconciled' | 'pending' | 'disputed';
}

// 19. Department Daily Reports
export interface DepartmentDailyReport {
  id: string;
  reportDate: string;
  departmentId: string;
  departmentName: string;
  districtId: string;
  districtName: string;
  employeeId: string;
  employeeName: string;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  productivityCredits: number;
  leadsGenerated: number;
  bookingsGenerated: number;
  revenueAttributed: number;
  problemsEncountered: string;
  nextDayPlan: string;
  createdAt: string;
}

// 20. Complaint Tickets
export interface ComplaintTicket {
  id: string;
  ticketCode: string; // e.g. TKT-9921
  customerId: string;
  customerName: string;
  bookingId?: string;
  districtId: string;
  districtName: string;
  complaintCategory: string; // Quality, Delay, Pricing, Behavior
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedStaffId: string;
  assignedStaffName: string;
  resolutionNotes?: string;
  isCustomerConfirmed: boolean;
  escalatedToManager: boolean;
  createdAt: string;
}

// 21. Staff Notifications
export interface StaffNotification {
  id: string;
  staffId: string;
  title: string;
  message: string;
  type: 'task' | 'approval' | 'rejection' | 'announcement' | 'alert' | 'lead';
  linkTarget?: string;
  isRead: boolean;
  createdAt: string;
}

// 22. System Announcements
export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: 'all' | 'district' | 'department';
  targetDistrictId?: string;
  targetDepartmentId?: string;
  publishedByName: string;
  publishedAt: string;
  isActive: boolean;
}

// 23. System Audit Logs
export interface SystemAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

// 24. HR Candidate & Recruitment Pipeline
export type CandidateStage =
  | 'Applied'
  | 'Screening'
  | 'Interview Scheduled'
  | 'Document Verification'
  | 'Offer Extended'
  | 'Onboarded'
  | 'Rejected';

export interface JobCandidate {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  appliedDesignationId: string;
  appliedDesignationTitle: string;
  districtId: string;
  districtName: string;
  stage: CandidateStage;
  screeningScore: number;
  interviewNotes?: string;
  documentsVerified: boolean;
  appliedDate: string;
  updatedAt: string;
}

// 25. Financial Transactions & Accounts Control
export interface FinancialTransaction {
  id: string;
  referenceId: string; // e.g. TXN-OD-9012
  type:
    | 'booking_revenue'
    | 'commission'
    | 'partner_payout'
    | 'partner_subscription'
    | 'partner_withdrawal'
    | 'salary_disbursement'
    | 'business_expense'
    | 'tax_payment'
    | 'manual_adjustment';
  amount: number;
  direction: 'credit' | 'debit';
  description: string;
  districtId?: string;
  districtName?: string;
  departmentId?: string;
  departmentName?: string;
  actorId: string;
  actorName: string;
  status: 'completed' | 'pending' | 'reversed';
  createdAt: string;
}

// 26. Staff Individual Wallet
export interface StaffBankAccountDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
  isKycVerified: boolean;
}

export interface StaffWallet {
  id: string; // wlt-<staffId>
  staffId: string;
  employeeId: string;
  fullName: string;
  departmentId: string;
  departmentName: string;
  designationTitle: string;
  districtName: string;
  totalEarnings: number; // Cumulative earned and approved
  availableBalance: number; // Spendable/withdrawable balance
  pendingEarnings: number; // In-progress / submitted works not yet approved
  approvedEarnings: number; // Approved work earnings
  totalWithdrawnAmount: number; // Total successfully paid out
  totalAdminAdjustments: number; // Net manual admin adjustments
  totalCompletedWork: number; // Number of approved completed works
  currentMonthEarnings: number; // Earned in current calendar month
  bankAccountDetails?: StaffBankAccountDetails;
  updatedAt: string;
}

export type WalletTransactionType =
  | 'work_credit'
  | 'incentive_credit'
  | 'adjustment_credit'
  | 'adjustment_debit'
  | 'withdrawal'
  | 'reversal';

export interface StaffWalletTransaction {
  id: string;
  transactionId: string; // e.g. WLT-TXN-202611-001
  staffId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD HH:mm:ss
  workId?: string; // e.g. WRK-OD-001
  workDescription: string;
  category: string; // e.g. 'Work Approval', 'Special Incentive', 'Admin Adjustment', 'Payout'
  type: WalletTransactionType;
  credit: number;
  debit: number;
  runningBalance: number;
  status: 'completed' | 'pending' | 'reversed' | 'failed';
  adminRemarks?: string;
  authorizedBy?: string;
  createdAt: string;
}

export type StaffWorkStatus =
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface StaffWorkAssignment {
  id: string;
  workCode: string; // e.g. WRK-OD-202611-001
  title: string;
  description: string;
  category: string;
  assignedStaffIds: string[];
  assignedStaffNames: string[];
  departmentId: string;
  departmentName: string;
  districtId: string;
  districtName: string;
  assignedDate: string; // YYYY-MM-DD
  completionDeadline: string; // YYYY-MM-DD
  priority: 'critical' | 'high' | 'medium' | 'low';
  customerWorkValue: number; // Customer/Company billed value (NOT credited to staff)
  staffEarningAmount: number; // Configured employee earning amount credited upon approval
  incentiveAmount: number; // Extra approved bonus/incentive
  status: StaffWorkStatus;
  isCredited: boolean; // Idempotency protection against duplicate crediting
  creditedTransactionId?: string;
  submissionNotes?: string;
  evidenceUrl?: string;
  evidenceFileName?: string;
  submittedAt?: string;
  completedAt?: string;
  approvedAt?: string;
  approvedByStaffId?: string;
  approvedByName?: string;
  rejectionReason?: string;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';

export interface StaffWithdrawalRequest {
  id: string;
  withdrawalCode: string; // e.g. WDR-OD-001
  staffId: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  requestedAmount: number;
  payoutAccount: StaffBankAccountDetails;
  isKycVerified: boolean;
  status: WithdrawalStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedByStaffId?: string;
  reviewedByName?: string;
  payoutMode?: 'IMPS' | 'NEFT' | 'UPI' | 'Direct Bank Transfer';
  utrReference?: string;
  adminRemarks?: string;
  rejectionReason?: string;
  processedAt?: string;
}
