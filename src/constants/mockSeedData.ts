/**
 * DOORBLY OPERATIONAL DATA BASELINE & WORK-BASED WALLET SEED
 * Baseline dataset for production workstation across 30 Districts of Odisha.
 * Contains authorized initial administration & operational staff profiles,
 * work-based assignments, individual wallets, and audit trails.
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
  },
  {
    id: 'staff-dm-02',
    employeeId: 'DBL-OD-002',
    fullName: 'Rajesh Tripathy',
    email: 'rajesh.cuttack@doorbly.com',
    mobile: '+91 98610 22334',
    departmentId: 'dept_district_mgmt',
    departmentName: 'District Operations & Management',
    designationId: 'dm',
    designationTitle: 'District Manager (DM)',
    systemRole: 'district_manager',
    districtId: 'cuttack',
    districtName: 'Cuttack',
    joiningDate: '2024-03-01',
    status: 'active',
    permissionLevel: 'manager',
    reportingManagerId: 'staff-admin-01',
    reportingManagerName: 'Debabrata Mohanta'
  },
  {
    id: 'staff-caller-03',
    employeeId: 'DBL-OD-003',
    fullName: 'Priya Mohapatra',
    email: 'priya.tele@doorbly.com',
    mobile: '+91 97780 33445',
    departmentId: 'dept_gen_ops',
    departmentName: 'General Operations & Tele-calling',
    designationId: 'tele_caller',
    designationTitle: 'Tele Caller – General Operations',
    systemRole: 'employee',
    districtId: 'khordha',
    districtName: 'Khordha (Bhubaneswar HQ)',
    joiningDate: '2024-04-10',
    status: 'active',
    permissionLevel: 'staff',
    reportingManagerId: 'staff-admin-01',
    reportingManagerName: 'Debabrata Mohanta'
  },
  {
    id: 'staff-partner-04',
    employeeId: 'DBL-OD-004',
    fullName: 'Bikram Keshari Sahoo',
    email: 'bikram.partner@doorbly.com',
    mobile: '+91 94380 44556',
    departmentId: 'dept_partner_onboard',
    departmentName: 'Service Provider Onboarding & Network',
    designationId: 'partner_caller',
    designationTitle: 'Partner Caller – Service Provider Onboarding',
    systemRole: 'employee',
    districtId: 'ganjam',
    districtName: 'Ganjam (Berhampur)',
    joiningDate: '2024-05-18',
    status: 'active',
    permissionLevel: 'staff',
    reportingManagerId: 'staff-admin-01',
    reportingManagerName: 'Debabrata Mohanta'
  },
  {
    id: 'staff-hr-05',
    employeeId: 'DBL-OD-005',
    fullName: 'Anita Das',
    email: 'anita.hr@doorbly.com',
    mobile: '+91 99370 55667',
    departmentId: 'dept_hr_admin',
    departmentName: 'Human Resources & Talent Management',
    designationId: 'hr_exec',
    designationTitle: 'HR Executive',
    systemRole: 'employee',
    districtId: 'puri',
    districtName: 'Puri',
    joiningDate: '2024-02-20',
    status: 'active',
    permissionLevel: 'staff',
    reportingManagerId: 'staff-admin-01',
    reportingManagerName: 'Debabrata Mohanta'
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
    details: 'Real-time operational workstation and staff wallet engine initialized for 30 districts of Odisha.',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_WORK_ASSIGNMENTS: StaffWorkAssignment[] = [
  {
    id: 'wrk-001',
    workCode: 'WRK-OD-202611-001',
    title: 'Cuttack Commercial AC Installation Quality Audit',
    description: 'On-site technical inspection and SLA verification of 8 commercial cassette AC units installed at Millennium City Mall, Badambadi.',
    category: 'Technical Audit',
    assignedStaffIds: ['staff-dm-02'],
    assignedStaffNames: ['Rajesh Tripathy (DBL-OD-002)'],
    departmentId: 'dept_district_mgmt',
    departmentName: 'District Operations & Management',
    districtId: 'cuttack',
    districtName: 'Cuttack',
    assignedDate: '2026-11-01',
    completionDeadline: '2026-11-05',
    priority: 'high',
    customerWorkValue: 18500, // Customer billed value
    staffEarningAmount: 1200, // Employee earning amount credited to wallet
    incentiveAmount: 150,
    status: 'approved',
    isCredited: true,
    creditedTransactionId: 'WLT-TXN-202611-001',
    submissionNotes: 'All 8 units inspected with pressure gauges and electrical load tests. Client sign-off obtained.',
    evidenceFileName: 'cuttack_mall_audit_signed.pdf',
    completedAt: '2026-11-02T16:30:00.000Z',
    approvedAt: '2026-11-02T18:00:00.000Z',
    approvedByStaffId: 'staff-admin-01',
    approvedByName: 'Debabrata Mohanta',
    adminRemarks: 'Comprehensive technical review report submitted and verified with client satisfaction.',
    createdAt: '2026-11-01T09:00:00.000Z',
    updatedAt: '2026-11-02T18:00:00.000Z'
  },
  {
    id: 'wrk-002',
    workCode: 'WRK-OD-202611-002',
    title: 'Residential Deep Cleaning Pipeline Onboarding - Patia',
    description: 'Lead follow-up, quotation dispatch, and confirmed scheduling for 12 residential villas in Patia Green Valley.',
    category: 'General Operations',
    assignedStaffIds: ['staff-caller-03'],
    assignedStaffNames: ['Priya Mohapatra (DBL-OD-003)'],
    departmentId: 'dept_gen_ops',
    departmentName: 'General Operations & Tele-calling',
    districtId: 'khordha',
    districtName: 'Khordha (Bhubaneswar HQ)',
    assignedDate: '2026-11-02',
    completionDeadline: '2026-11-06',
    priority: 'high',
    customerWorkValue: 24000,
    staffEarningAmount: 950,
    incentiveAmount: 0,
    status: 'completed',
    isCredited: false, // Ready for admin approval!
    submissionNotes: 'All 12 villa owners confirmed over recorded phone calls with token advances received.',
    completedAt: '2026-11-03T11:20:00.000Z',
    adminRemarks: 'Pending Admin verification and wallet credit authorization.',
    createdAt: '2026-11-02T10:00:00.000Z',
    updatedAt: '2026-11-03T11:20:00.000Z'
  },
  {
    id: 'wrk-003',
    workCode: 'WRK-OD-202611-003',
    title: 'Berhampur Electrician & Plumber Partner Network Drive',
    description: 'Field screening, Aadhaar KYC verification, and tools checklist vetting for 15 certified electricians and plumbers in Ganjam district.',
    category: 'Partner Verification',
    assignedStaffIds: ['staff-partner-04'],
    assignedStaffNames: ['Bikram Keshari Sahoo (DBL-OD-004)'],
    departmentId: 'dept_partner_onboard',
    departmentName: 'Service Provider Onboarding & Network',
    districtId: 'ganjam',
    districtName: 'Ganjam (Berhampur)',
    assignedDate: '2026-11-02',
    completionDeadline: '2026-11-07',
    priority: 'medium',
    customerWorkValue: 9000,
    staffEarningAmount: 750,
    incentiveAmount: 0,
    status: 'in_progress',
    isCredited: false,
    adminRemarks: 'Focus on emergency evening breakdown technicians.',
    createdAt: '2026-11-02T11:30:00.000Z',
    updatedAt: '2026-11-02T11:30:00.000Z'
  },
  {
    id: 'wrk-004',
    workCode: 'WRK-OD-202611-004',
    title: 'District Tele-Calling Staff Recruitment & Background Check',
    description: 'Screening 20 candidate applications, conducting technical interviews, and completing police verification checks for Puri district.',
    category: 'Human Resources',
    assignedStaffIds: ['staff-hr-05'],
    assignedStaffNames: ['Anita Das (DBL-OD-005)'],
    departmentId: 'dept_hr_admin',
    departmentName: 'Human Resources & Talent Management',
    districtId: 'puri',
    districtName: 'Puri',
    assignedDate: '2026-11-01',
    completionDeadline: '2026-11-08',
    priority: 'high',
    customerWorkValue: 15000,
    staffEarningAmount: 1100,
    incentiveAmount: 100,
    status: 'approved',
    isCredited: true,
    creditedTransactionId: 'WLT-TXN-202611-002',
    submissionNotes: 'All 20 candidates vetted and 3 offers extended with documentation archived.',
    completedAt: '2026-11-02T14:15:00.000Z',
    approvedAt: '2026-11-02T17:45:00.000Z',
    approvedByStaffId: 'staff-admin-01',
    approvedByName: 'Debabrata Mohanta',
    adminRemarks: 'Rapid candidate turnaround and clean KYC audit.',
    createdAt: '2026-11-01T08:30:00.000Z',
    updatedAt: '2026-11-02T17:45:00.000Z'
  }
];

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
    totalEarnings: 4500,
    availableBalance: 4500,
    pendingEarnings: 0,
    approvedEarnings: 4500,
    totalWithdrawnAmount: 0,
    totalAdminAdjustments: 0,
    totalCompletedWork: 3,
    currentMonthEarnings: 4500,
    bankAccountDetails: {
      accountHolderName: 'Debabrata Mohanta',
      accountNumber: '•••• •••• 9921',
      ifscCode: 'SBIN0001024',
      bankName: 'State Bank of India',
      upiId: 'debabrata@upi',
      isKycVerified: true
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt-staff-dm-02',
    staffId: 'staff-dm-02',
    employeeId: 'DBL-OD-002',
    fullName: 'Rajesh Tripathy',
    departmentId: 'dept_district_mgmt',
    departmentName: 'District Operations & Management',
    designationTitle: 'District Manager (DM)',
    districtName: 'Cuttack',
    totalEarnings: 1350, // 1200 + 150 incentive
    availableBalance: 850, // 1350 - 500 withdrawn
    pendingEarnings: 0,
    approvedEarnings: 1350,
    totalWithdrawnAmount: 500,
    totalAdminAdjustments: 0,
    totalCompletedWork: 1,
    currentMonthEarnings: 1350,
    bankAccountDetails: {
      accountHolderName: 'Rajesh Tripathy',
      accountNumber: '•••• •••• 4421',
      ifscCode: 'HDFC0000215',
      bankName: 'HDFC Bank Cuttack Main',
      upiId: 'rajesh.tripathy@okhdfcbank',
      isKycVerified: true
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt-staff-caller-03',
    staffId: 'staff-caller-03',
    employeeId: 'DBL-OD-003',
    fullName: 'Priya Mohapatra',
    departmentId: 'dept_gen_ops',
    departmentName: 'General Operations & Tele-calling',
    designationTitle: 'Tele Caller – General Operations',
    districtName: 'Khordha (Bhubaneswar HQ)',
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 950, // From WRK-002 waiting approval!
    approvedEarnings: 0,
    totalWithdrawnAmount: 0,
    totalAdminAdjustments: 0,
    totalCompletedWork: 0,
    currentMonthEarnings: 0,
    bankAccountDetails: {
      accountHolderName: 'Priya Mohapatra',
      accountNumber: '•••• •••• 8812',
      ifscCode: 'ICIC0001822',
      bankName: 'ICICI Bank Patia',
      upiId: 'priyamohapatra@icici',
      isKycVerified: true
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt-staff-partner-04',
    staffId: 'staff-partner-04',
    employeeId: 'DBL-OD-004',
    fullName: 'Bikram Keshari Sahoo',
    departmentId: 'dept_partner_onboard',
    departmentName: 'Service Provider Onboarding & Network',
    designationTitle: 'Partner Caller – Service Provider Onboarding',
    districtName: 'Ganjam (Berhampur)',
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 750,
    approvedEarnings: 0,
    totalWithdrawnAmount: 0,
    totalAdminAdjustments: 0,
    totalCompletedWork: 0,
    currentMonthEarnings: 0,
    bankAccountDetails: {
      accountHolderName: 'Bikram Keshari Sahoo',
      accountNumber: '•••• •••• 3319',
      ifscCode: 'PUNB0021900',
      bankName: 'Punjab National Bank Berhampur',
      upiId: 'bikram.sahoo@pnb',
      isKycVerified: true
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt-staff-hr-05',
    staffId: 'staff-hr-05',
    employeeId: 'DBL-OD-005',
    fullName: 'Anita Das',
    departmentId: 'dept_hr_admin',
    departmentName: 'Human Resources & Talent Management',
    designationTitle: 'HR Executive',
    districtName: 'Puri',
    totalEarnings: 1200, // 1100 + 100 incentive
    availableBalance: 1200,
    pendingEarnings: 0,
    approvedEarnings: 1200,
    totalWithdrawnAmount: 0,
    totalAdminAdjustments: 0,
    totalCompletedWork: 1,
    currentMonthEarnings: 1200,
    bankAccountDetails: {
      accountHolderName: 'Anita Das',
      accountNumber: '•••• •••• 7734',
      ifscCode: 'SBIN0002100',
      bankName: 'State Bank of India Puri Grand Road',
      upiId: 'anita.das@sbi',
      isKycVerified: true
    },
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_WALLET_TXNS: StaffWalletTransaction[] = [
  {
    id: 'txn-001',
    transactionId: 'WLT-TXN-202611-001',
    staffId: 'staff-dm-02',
    employeeId: 'DBL-OD-002',
    date: '2026-11-02 18:00:15',
    workId: 'WRK-OD-202611-001',
    workDescription: 'Cuttack Commercial AC Installation Quality Audit (Approved Work Earning & Incentive)',
    category: 'Work Completion',
    type: 'work_credit',
    credit: 1350,
    debit: 0,
    runningBalance: 1350,
    status: 'completed',
    adminRemarks: 'Approved by Debabrata Mohanta. Base: ₹1,200 + Incentive: ₹150',
    authorizedBy: 'Debabrata Mohanta',
    createdAt: '2026-11-02T18:00:15.000Z'
  },
  {
    id: 'txn-002',
    transactionId: 'WLT-TXN-202611-002',
    staffId: 'staff-hr-05',
    employeeId: 'DBL-OD-005',
    date: '2026-11-02 17:45:22',
    workId: 'WRK-OD-202611-004',
    workDescription: 'District Tele-Calling Staff Recruitment & Background Check (Approved Earning)',
    category: 'Work Completion',
    type: 'work_credit',
    credit: 1200,
    debit: 0,
    runningBalance: 1200,
    status: 'completed',
    adminRemarks: 'Approved by Debabrata Mohanta. Base: ₹1,100 + Incentive: ₹100',
    authorizedBy: 'Debabrata Mohanta',
    createdAt: '2026-11-02T17:45:22.000Z'
  },
  {
    id: 'txn-003',
    transactionId: 'WLT-TXN-202611-003',
    staffId: 'staff-dm-02',
    employeeId: 'DBL-OD-002',
    date: '2026-11-03 09:30:00',
    workDescription: 'Staff Wallet Withdrawal Payout to HDFC Bank (Ref: UTR-OD-992144)',
    category: 'Withdrawal Payout',
    type: 'withdrawal',
    credit: 0,
    debit: 500,
    runningBalance: 850,
    status: 'completed',
    adminRemarks: 'IMPS Payout processed by Finance Directorate. UTR: UTR-OD-992144',
    authorizedBy: 'Debabrata Mohanta',
    createdAt: '2026-11-03T09:30:00.000Z'
  }
];

export const INITIAL_WITHDRAWALS: StaffWithdrawalRequest[] = [
  {
    id: 'wdr-001',
    withdrawalCode: 'WDR-OD-202611-001',
    staffId: 'staff-dm-02',
    employeeId: 'DBL-OD-002',
    employeeName: 'Rajesh Tripathy',
    departmentName: 'District Operations & Management',
    requestedAmount: 500,
    payoutAccount: {
      accountHolderName: 'Rajesh Tripathy',
      accountNumber: '•••• •••• 4421',
      ifscCode: 'HDFC0000215',
      bankName: 'HDFC Bank Cuttack Main',
      upiId: 'rajesh.tripathy@okhdfcbank',
      isKycVerified: true
    },
    isKycVerified: true,
    status: 'completed',
    requestedAt: '2026-11-02T19:00:00.000Z',
    reviewedAt: '2026-11-03T09:15:00.000Z',
    reviewedByStaffId: 'staff-admin-01',
    reviewedByName: 'Debabrata Mohanta',
    payoutMode: 'IMPS',
    utrReference: 'UTR-OD-992144',
    adminRemarks: 'IMPS immediate transfer verified with banking gateway.',
    processedAt: '2026-11-03T09:30:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS: StaffNotification[] = [
  {
    id: 'notif-001',
    staffId: 'staff-caller-03',
    title: 'New Work Assignment Assigned',
    message: 'You have been assigned to "Residential Deep Cleaning Pipeline Onboarding - Patia" with earning amount ₹950.',
    type: 'task',
    isRead: false,
    createdAt: '2026-11-02T10:00:00.000Z'
  },
  {
    id: 'notif-002',
    staffId: 'staff-dm-02',
    title: 'Wallet Credited: ₹1,350',
    message: 'Your completed work "Cuttack Commercial AC Installation Quality Audit" has been approved and ₹1,350 was credited to your wallet balance.',
    type: 'approval',
    isRead: true,
    createdAt: '2026-11-02T18:00:15.000Z'
  },
  {
    id: 'notif-003',
    staffId: 'staff-dm-02',
    title: 'Withdrawal Payout Completed: ₹500',
    message: 'Your withdrawal request of ₹500 has been transferred via IMPS. UTR Reference: UTR-OD-992144.',
    type: 'approval',
    isRead: false,
    createdAt: '2026-11-03T09:30:00.000Z'
  }
];
