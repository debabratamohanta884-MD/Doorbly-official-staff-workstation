/**
 * DOORBLY DATA STORAGE ENGINE
 * Unified data access layer that supports Supabase integration with robust local persistence.
 * Implements all business validation rules, credit ledger awards, audit logging, and role isolation.
 */

import {
  StaffProfile,
  DistrictMaster,
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
  DepartmentDailyReport,
  TaskValueItem,
  Department,
  JobDesignation,
  LeadStatus,
  CorporatePipelineStage,
  PartnerApplicationStatus,
  BookingStatus,
  PaymentStatus,
  TicketStatus,
  JobCandidate,
  LeaveRequest,
  LeaveStatus,
  FinancialTransaction,
  StaffWallet,
  StaffWalletTransaction,
  StaffWorkAssignment,
  StaffWithdrawalRequest,
  StaffBankAccountDetails,
  StaffWorkStatus,
  WithdrawalStatus,
  WalletTransactionType,
  StaffNotification
} from '../types/doorbly';

import { ODISHA_DISTRICTS_INITIAL } from '../constants/districts';
import { INITIAL_DEPARTMENTS, INITIAL_DESIGNATIONS } from '../constants/departments';
import { INITIAL_TASK_VALUE_MASTER } from '../constants/taskValueMaster';
import {
  INITIAL_STAFF_MEMBERS,
  INITIAL_DAILY_TASKS,
  INITIAL_SUBMISSIONS,
  INITIAL_WORK_CREDITS,
  INITIAL_ATTENDANCE,
  INITIAL_LEADS,
  INITIAL_CORP_PROSPECTS,
  INITIAL_PARTNER_APPLICATIONS,
  INITIAL_BOOKINGS,
  INITIAL_COMPLAINT_TICKETS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WORK_ASSIGNMENTS,
  INITIAL_WALLETS,
  INITIAL_WALLET_TXNS,
  INITIAL_WITHDRAWALS,
  INITIAL_NOTIFICATIONS
} from '../constants/mockSeedData';

const STORAGE_KEYS = {
  VERSION: 'doorbly_storage_version',
  STAFF: 'doorbly_staff_profiles',
  DISTRICTS: 'doorbly_districts_master',
  DEPARTMENTS: 'doorbly_departments',
  DESIGNATIONS: 'doorbly_designations',
  TASKS: 'doorbly_daily_tasks',
  SUBMISSIONS: 'doorbly_task_submissions',
  CREDITS: 'doorbly_work_credits',
  ATTENDANCE: 'doorbly_attendance',
  LEAVES: 'doorbly_employee_leaves',
  LEADS: 'doorbly_leads',
  CORP_PROSPECTS: 'doorbly_corp_prospects',
  PARTNERS: 'doorbly_partner_apps',
  BOOKINGS: 'doorbly_bookings',
  TICKETS: 'doorbly_complaint_tickets',
  ANNOUNCEMENTS: 'doorbly_announcements',
  AUDIT_LOGS: 'doorbly_audit_logs',
  TASK_VALUE_MASTER: 'doorbly_task_values',
  DAILY_REPORTS: 'doorbly_daily_reports',
  CANDIDATES: 'doorbly_hr_candidates',
  FINANCIAL_TXNS: 'doorbly_financial_txns',
  CURRENT_USER_ID: 'doorbly_current_user_id',
  WALLETS: 'doorbly_staff_wallets',
  WALLET_TXNS: 'doorbly_staff_wallet_txns',
  WORK_ASSIGNMENTS: 'doorbly_staff_work_assignments',
  WITHDRAWALS: 'doorbly_staff_withdrawals',
  NOTIFICATIONS: 'doorbly_staff_notifications'
};

const KEY_TO_TABLE: Record<string, string> = {
  doorbly_staff_profiles: 'staff_profiles',
  doorbly_districts_master: 'districts',
  doorbly_departments: 'departments',
  doorbly_designations: 'job_designations',
  doorbly_daily_tasks: 'daily_tasks',
  doorbly_task_submissions: 'task_submissions',
  doorbly_work_credits: 'employee_work_credits',
  doorbly_attendance: 'employee_attendance',
  doorbly_employee_leaves: 'employee_leave',
  doorbly_leads: 'leads',
  doorbly_corp_prospects: 'corporate_prospects',
  doorbly_partner_apps: 'partner_applications',
  doorbly_bookings: 'booking_pipeline',
  doorbly_complaint_tickets: 'complaint_tickets',
  doorbly_announcements: 'system_announcements',
  doorbly_audit_logs: 'system_audit_logs',
  doorbly_task_values: 'task_value_master',
  doorbly_daily_reports: 'department_daily_reports',
  doorbly_hr_candidates: 'job_candidates',
  doorbly_financial_txns: 'financial_transactions',
  doorbly_staff_wallets: 'staff_wallets',
  doorbly_staff_wallet_txns: 'staff_wallet_transactions',
  doorbly_staff_work_assignments: 'staff_work_assignments',
  doorbly_staff_notifications: 'staff_notifications'
};

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // If parsing fails (for example, raw unquoted strings like "staff-admin-01"),
      // safely return the raw string if expected value is a string
      if (typeof fallback === 'string' || typeof raw === 'string') {
        return raw as unknown as T;
      }
      return fallback;
    }
  } catch (err) {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    // Automatically persist to Supabase if key maps to a database table
    const tableName = KEY_TO_TABLE[key];
    if (tableName && Array.isArray(value) && value.length > 0) {
      import('./supabaseClient')
        .then(({ persistToSupabaseAsync }) => {
          // Send all items if small list, or latest 10 items
          const itemsToSync = value.length <= 50 ? value : value.slice(0, 5);
          persistToSupabaseAsync(tableName, itemsToSync);
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Initialize seed data if not present (clears legacy mock/demo data and seeds wallet baseline)
export function initializeStorageIfNeeded(): void {
  const CURRENT_STORAGE_VERSION = 'doorbly_realtime_v3_production';
  const existingVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

  // If upgrading version, purge all legacy mock data and refresh pristine operational baseline
  if (existingVersion !== CURRENT_STORAGE_VERSION) {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.CURRENT_USER_ID) {
        localStorage.removeItem(k);
      }
    });
    setStoredItem(STORAGE_KEYS.CURRENT_USER_ID, 'staff-admin-01');
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION);
  }

  if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
    setStoredItem(STORAGE_KEYS.STAFF, INITIAL_STAFF_MEMBERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DISTRICTS)) {
    setStoredItem(STORAGE_KEYS.DISTRICTS, ODISHA_DISTRICTS_INITIAL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    setStoredItem(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DESIGNATIONS)) {
    setStoredItem(STORAGE_KEYS.DESIGNATIONS, INITIAL_DESIGNATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    setStoredItem(STORAGE_KEYS.TASKS, INITIAL_DAILY_TASKS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    setStoredItem(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CREDITS)) {
    setStoredItem(STORAGE_KEYS.CREDITS, INITIAL_WORK_CREDITS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    setStoredItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
    setStoredItem(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CORP_PROSPECTS)) {
    setStoredItem(STORAGE_KEYS.CORP_PROSPECTS, INITIAL_CORP_PROSPECTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
    setStoredItem(STORAGE_KEYS.PARTNERS, INITIAL_PARTNER_APPLICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    setStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    setStoredItem(STORAGE_KEYS.TICKETS, INITIAL_COMPLAINT_TICKETS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    setStoredItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASK_VALUE_MASTER)) {
    setStoredItem(STORAGE_KEYS.TASK_VALUE_MASTER, INITIAL_TASK_VALUE_MASTER);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DAILY_REPORTS)) {
    setStoredItem(STORAGE_KEYS.DAILY_REPORTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WALLETS)) {
    setStoredItem(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WALLET_TXNS)) {
    setStoredItem(STORAGE_KEYS.WALLET_TXNS, INITIAL_WALLET_TXNS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORK_ASSIGNMENTS)) {
    setStoredItem(STORAGE_KEYS.WORK_ASSIGNMENTS, INITIAL_WORK_ASSIGNMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) {
    setStoredItem(STORAGE_KEYS.WITHDRAWALS, INITIAL_WITHDRAWALS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
}

// Run immediately on import
initializeStorageIfNeeded();

export const StorageEngine = {
  // --- AUTHENTICATION & SESSION ---
  getCurrentUserId(): string {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!raw) return 'staff-admin-01';
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string' && parsed.trim()) return parsed.trim();
    } catch {
      if (typeof raw === 'string' && raw.trim()) return raw.trim();
    }
    return 'staff-admin-01';
  },

  setCurrentUserId(id: string): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  getCurrentUser(): StaffProfile {
    try {
      const id = this.getCurrentUserId();
      const staffList = this.getStaffProfiles();
      const found = staffList.find(s => s.id === id || s.employeeId === id);
      if (found) return found;
      if (staffList.length > 0) return staffList[0];
      return INITIAL_STAFF_MEMBERS[0];
    } catch {
      return INITIAL_STAFF_MEMBERS[0];
    }
  },

  loginByEmployeeId(employeeId: string): { success: boolean; profile?: StaffProfile; error?: string } {
    const list = this.getStaffProfiles();
    const cleanId = employeeId.trim().toUpperCase();
    const user = list.find(s => s.employeeId.toUpperCase() === cleanId || s.email.toLowerCase() === cleanId.toLowerCase());

    if (!user) {
      return { success: false, error: 'Employee ID or email not found in authorized Doorbly registry.' };
    }

    if (user.status === 'inactive' || user.status === 'suspended') {
      return { success: false, error: `Account access denied. Your employee profile status is currently "${user.status.toUpperCase()}". Contact HR Administration.` };
    }

    this.setCurrentUserId(user.id);
    this.logAudit(user.id, user.fullName, user.systemRole, 'LOGIN', 'Authentication', `Logged in successfully with ID ${user.employeeId}`);
    return { success: true, profile: user };
  },

  logout(): void {
    const user = this.getCurrentUser();
    this.logAudit(user.id, user.fullName, user.systemRole, 'LOGOUT', 'Authentication', `Logged out`);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  // --- STAFF PROFILES ---
  getStaffProfiles(): StaffProfile[] {
    return getStoredItem<StaffProfile[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF_MEMBERS);
  },

  getStaffById(id: string): StaffProfile | undefined {
    return this.getStaffProfiles().find(s => s.id === id || s.employeeId === id);
  },

  createStaffProfile(data: Omit<StaffProfile, 'id' | 'status'> & { status?: StaffProfile['status'] }, actor: StaffProfile): StaffProfile {
    const staffList = this.getStaffProfiles();
    const newId = `staff-${Date.now()}`;
    const newProfile: StaffProfile = {
      ...data,
      id: newId,
      status: data.status || 'active'
    };
    staffList.push(newProfile);
    setStoredItem(STORAGE_KEYS.STAFF, staffList);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'CREATE_EMPLOYEE', 'Staff Management', `Created employee profile ${newProfile.employeeId} (${newProfile.fullName})`);
    return newProfile;
  },

  updateStaffProfile(id: string, updates: Partial<StaffProfile>, actor: StaffProfile): StaffProfile {
    const staffList = this.getStaffProfiles();
    const index = staffList.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    const updated = { ...staffList[index], ...updates };
    staffList[index] = updated;
    setStoredItem(STORAGE_KEYS.STAFF, staffList);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_EMPLOYEE', 'Staff Management', `Updated profile fields for ${updated.employeeId}`);
    return updated;
  },

  transferEmployeeDistrict(staffId: string, newDistrictId: string, reason: string, actor: StaffProfile): void {
    const staffList = this.getStaffProfiles();
    const districts = this.getDistricts();
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) throw new Error('Staff not found');

    const newDist = districts.find(d => d.id === newDistrictId);
    if (!newDist) throw new Error('Target district not found');

    const prevDistrictName = staff.districtName;
    staff.districtId = newDistrictId;
    staff.districtName = newDist.name;
    setStoredItem(STORAGE_KEYS.STAFF, staffList);

    this.logAudit(
      actor.id,
      actor.fullName,
      actor.systemRole,
      'DISTRICT_TRANSFER',
      'District Management',
      `Transferred ${staff.fullName} (${staff.employeeId}) from ${prevDistrictName} to ${newDist.name}. Reason: ${reason}`
    );
  },

  // --- DISTRICTS & TARGETS ---
  getDistricts(): DistrictMaster[] {
    const raw = getStoredItem<DistrictMaster[]>(STORAGE_KEYS.DISTRICTS, ODISHA_DISTRICTS_INITIAL);
    const bookings = getStoredItem<BookingRecord[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const staff = getStoredItem<StaffProfile[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF_MEMBERS);

    return raw.map(d => {
      const districtBookings = bookings.filter(b => b.districtId === d.id && b.bookingStatus === 'completed');
      const districtStaff = staff.filter(s => s.districtId === d.id && s.status === 'active');
      const manager = staff.find(s => s.districtId === d.id && (s.systemRole === 'district_manager' || s.designationId === 'dm'));
      const coordinator = staff.find(s => s.districtId === d.id && (s.systemRole === 'district_coordinator' || s.designationId === 'dc'));

      const dynamicSubtotal = districtBookings.reduce((sum, b) => sum + (b.serviceSubtotal || 0), 0);
      const dynamicCount = districtBookings.length;
      const dynamicStaffCount = districtStaff.length;

      return {
        ...d,
        actualCompletedSubtotal: dynamicSubtotal,
        completedBookingsCount: dynamicCount,
        activeStaffCount: dynamicStaffCount,
        managerName: manager?.fullName,
        coordinatorName: coordinator?.fullName,
        managerPhone: manager?.mobile,
        coordinatorPhone: coordinator?.mobile
      };
    });
  },

  updateDistrictTarget(districtId: string, newDailyTarget: number, actor: StaffProfile): void {
    const list = this.getDistricts();
    const dist = list.find(d => d.id === districtId);
    if (dist) {
      const old = dist.dailyTarget;
      dist.dailyTarget = newDailyTarget;
      setStoredItem(STORAGE_KEYS.DISTRICTS, list);
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_TARGET', 'Revenue Management', `Updated daily target for ${dist.name} from ₹${old} to ₹${newDailyTarget}`);
    }
  },

  // --- DEPARTMENTS & DESIGNATIONS ---
  getDepartments(): Department[] {
    return getStoredItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  getDesignations(): JobDesignation[] {
    return getStoredItem<JobDesignation[]>(STORAGE_KEYS.DESIGNATIONS, INITIAL_DESIGNATIONS);
  },

  // --- TASK VALUE MASTER ---
  getTaskValueMaster(): TaskValueItem[] {
    return getStoredItem<TaskValueItem[]>(STORAGE_KEYS.TASK_VALUE_MASTER, INITIAL_TASK_VALUE_MASTER);
  },

  updateTaskValueItem(id: string, updates: Partial<TaskValueItem>, actor: StaffProfile): void {
    const list = this.getTaskValueMaster();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setStoredItem(STORAGE_KEYS.TASK_VALUE_MASTER, list);
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_TASK_VALUE', 'Task Master', `Updated task credit value for ${list[index].activityName}: ₹${list[index].creditValue}`);
    }
  },

  // --- DAILY TASKS ---
  getDailyTasks(filter?: { staffId?: string; districtId?: string; status?: string }): DailyTask[] {
    const all = getStoredItem<DailyTask[]>(STORAGE_KEYS.TASKS, INITIAL_DAILY_TASKS);
    if (!filter) return all;

    return all.filter(t => {
      if (filter.staffId && t.staffId !== filter.staffId && t.employeeId !== filter.staffId) return false;
      if (filter.districtId && t.districtId !== filter.districtId) return false;
      if (filter.status && t.status !== filter.status) return false;
      return true;
    });
  },

  createDailyTask(taskData: Omit<DailyTask, 'id' | 'taskId' | 'status' | 'createdAt'>, actor: StaffProfile): DailyTask {
    const tasks = this.getDailyTasks();
    const taskCount = tasks.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newTask: DailyTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      taskId: `TSK-${dateStr}-${String(taskCount).padStart(3, '0')}`,
      status: 'assigned',
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    setStoredItem(STORAGE_KEYS.TASKS, tasks);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'ASSIGN_TASK', 'Tasks', `Assigned task ${newTask.taskId} to ${newTask.employeeName}`);
    return newTask;
  },

  updateTaskStatus(taskId: string, status: DailyTask['status']): void {
    const tasks = this.getDailyTasks();
    const task = tasks.find(t => t.id === taskId || t.taskId === taskId);
    if (task) {
      task.status = status;
      setStoredItem(STORAGE_KEYS.TASKS, tasks);
    }
  },

  // --- WORK SUBMISSIONS & APPROVALS ---
  getSubmissions(): TaskSubmission[] {
    return getStoredItem<TaskSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },

  submitWork(data: {
    taskId: string;
    completedQuantity: number;
    referenceId?: string;
    description: string;
    evidenceUrl?: string;
    evidenceFileName?: string;
  }, employee: StaffProfile): TaskSubmission {
    const submissions = this.getSubmissions();
    const task = this.getDailyTasks().find(t => t.id === data.taskId || t.taskId === data.taskId);
    if (!task) throw new Error('Task not found');

    const newSub: TaskSubmission = {
      id: `sub-${Date.now()}`,
      taskId: task.id,
      staffId: employee.id,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      completedQuantity: data.completedQuantity,
      referenceId: data.referenceId,
      description: data.description,
      evidenceUrl: data.evidenceUrl || 'evidence_attachment.pdf',
      evidenceFileName: data.evidenceFileName || 'evidence_attachment.pdf',
      submittedAt: new Date().toISOString(),
      status: 'under_review'
    };

    submissions.unshift(newSub);
    setStoredItem(STORAGE_KEYS.SUBMISSIONS, submissions);
    this.updateTaskStatus(task.id, 'submitted');

    this.logAudit(
      employee.id,
      employee.fullName,
      employee.systemRole,
      'SUBMIT_WORK',
      'Work Submissions',
      `Submitted work for task ${task.taskId} (${data.completedQuantity} units)`
    );

    return newSub;
  },

  approveSubmission(submissionId: string, approver: StaffProfile, comments?: string): void {
    const submissions = this.getSubmissions();
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    // Rule 8 of Section 10: Department heads / submitters cannot approve their own submissions
    if (sub.staffId === approver.id) {
      throw new Error('Self-approval violation: You cannot verify or approve your own submissions.');
    }

    const tasks = this.getDailyTasks();
    const task = tasks.find(t => t.id === sub.taskId);
    if (!task) throw new Error('Associated task not found');

    // Calculate credit value
    const awardedCredits = (task.taskValueCredit / Math.max(task.targetQuantity, 1)) * sub.completedQuantity;

    sub.status = 'approved';
    sub.approvedByStaffId = approver.id;
    sub.approvedByName = `${approver.fullName} (${approver.designationTitle || approver.systemRole})`;
    sub.approvedAt = new Date().toISOString();
    sub.awardedCredits = Math.round(awardedCredits);
    setStoredItem(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Update task
    task.status = 'approved';
    setStoredItem(STORAGE_KEYS.TASKS, tasks);

    // Record credit in ledger
    const credits = this.getWorkCredits();
    const newCreditEntry: WorkCreditEntry = {
      id: `crd-${Date.now()}`,
      staffId: sub.staffId,
      employeeId: sub.employeeId,
      date: new Date().toISOString().slice(0, 10),
      taskId: task.taskId,
      taskDescription: `${task.taskTitle} (Verified: ${sub.completedQuantity} units)`,
      approvedQuantity: sub.completedQuantity,
      perTaskValue: Math.round(task.taskValueCredit / Math.max(task.targetQuantity, 1)),
      totalCredits: Math.round(awardedCredits),
      approverId: approver.id,
      approverName: approver.fullName,
      approvalDate: new Date().toISOString()
    };
    credits.unshift(newCreditEntry);
    setStoredItem(STORAGE_KEYS.CREDITS, credits);

    this.logAudit(
      approver.id,
      approver.fullName,
      approver.systemRole,
      'APPROVE_SUBMISSION',
      'Work Approval',
      `Approved submission for ${sub.employeeName} on task ${task.taskId}. Awarded ₹${newCreditEntry.totalCredits} productivity credits. ${comments ? `Notes: ${comments}` : ''}`
    );
  },

  rejectSubmission(submissionId: string, approver: StaffProfile, mandatoryReason: string): void {
    if (!mandatoryReason || mandatoryReason.trim().length < 5) {
      throw new Error('Mandatory rejection reason required (minimum 5 characters explaining discrepancy).');
    }

    const submissions = this.getSubmissions();
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    if (sub.staffId === approver.id) {
      throw new Error('Cannot reject own submission.');
    }

    const tasks = this.getDailyTasks();
    const task = tasks.find(t => t.id === sub.taskId);

    sub.status = 'rejected';
    sub.rejectionReason = mandatoryReason;
    sub.approvedByStaffId = approver.id;
    sub.approvedByName = approver.fullName;
    sub.approvedAt = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.SUBMISSIONS, submissions);

    if (task) {
      task.status = 'rejected';
      setStoredItem(STORAGE_KEYS.TASKS, tasks);
    }

    this.logAudit(
      approver.id,
      approver.fullName,
      approver.systemRole,
      'REJECT_SUBMISSION',
      'Work Approval',
      `Rejected submission for ${sub.employeeName}. Reason: ${mandatoryReason}`
    );
  },

  // --- WORK CREDITS LEDGER ---
  getWorkCredits(staffId?: string): WorkCreditEntry[] {
    const list = getStoredItem<WorkCreditEntry[]>(STORAGE_KEYS.CREDITS, INITIAL_WORK_CREDITS);
    if (!staffId) return list;
    return list.filter(c => c.staffId === staffId || c.employeeId === staffId);
  },

  // --- REMOTE ATTENDANCE ---
  getAttendance(staffId?: string): AttendanceRecord[] {
    const list = getStoredItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    if (!staffId) return list;
    return list.filter(a => a.staffId === staffId || a.employeeId === staffId);
  },

  getTodayAttendance(staffId: string): AttendanceRecord | undefined {
    const todayStr = new Date().toISOString().slice(0, 10);
    return this.getAttendance(staffId).find(a => a.date === todayStr);
  },

  punchIn(staff: StaffProfile, locationNote?: string): AttendanceRecord {
    const all = getStoredItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const todayStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });

    let record = all.find(a => (a.staffId === staff.id || a.employeeId === staff.employeeId) && a.date === todayStr);
    if (record) {
      if (record.logoutTime) {
        // re-login
        record.logoutTime = undefined;
      }
    } else {
      record = {
        id: `att-${Date.now()}`,
        staffId: staff.id,
        employeeId: staff.employeeId,
        date: todayStr,
        loginTime: timeStr,
        totalWorkingMinutes: 0,
        breakMinutes: 0,
        isOnBreak: false,
        status: 'present',
        locationVerified: true,
        locationNote: locationNote || `${staff.districtName} (Remote Consent Verified)`
      };
      all.unshift(record);
    }

    setStoredItem(STORAGE_KEYS.ATTENDANCE, all);
    this.logAudit(staff.id, staff.fullName, staff.systemRole, 'ATTENDANCE_PUNCH_IN', 'Attendance', `Punched IN at ${timeStr} IST`);
    return record;
  },

  punchOut(staff: StaffProfile): AttendanceRecord {
    const all = getStoredItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const todayStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });

    let record = all.find(a => (a.staffId === staff.id || a.employeeId === staff.employeeId) && a.date === todayStr);
    if (!record) {
      record = this.punchIn(staff);
    }

    record.logoutTime = timeStr;
    record.isOnBreak = false;
    setStoredItem(STORAGE_KEYS.ATTENDANCE, all);
    this.logAudit(staff.id, staff.fullName, staff.systemRole, 'ATTENDANCE_PUNCH_OUT', 'Attendance', `Punched OUT at ${timeStr} IST`);
    return record;
  },

  toggleBreak(staff: StaffProfile): AttendanceRecord {
    const all = getStoredItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const todayStr = new Date().toISOString().slice(0, 10);

    let record = all.find(a => (a.staffId === staff.id || a.employeeId === staff.employeeId) && a.date === todayStr);
    if (!record) {
      record = this.punchIn(staff);
    }

    record.isOnBreak = !record.isOnBreak;
    if (record.isOnBreak) {
      record.breakMinutes += 15;
    }
    setStoredItem(STORAGE_KEYS.ATTENDANCE, all);
    this.logAudit(staff.id, staff.fullName, staff.systemRole, 'ATTENDANCE_BREAK', 'Attendance', record.isOnBreak ? 'Started break' : 'Resumed work from break');
    return record;
  },

  // --- CRM LEADS ---
  getLeads(filterDistrict?: string): CustomerLead[] {
    const list = getStoredItem<CustomerLead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    if (!filterDistrict) return list;
    return list.filter(l => l.districtId === filterDistrict);
  },

  createLead(data: Omit<CustomerLead, 'id' | 'leadCode' | 'createdAt'>, actor: StaffProfile): CustomerLead {
    const list = this.getLeads();
    const count = list.length + 1;
    const newLead: CustomerLead = {
      ...data,
      id: `lead-${Date.now()}`,
      leadCode: `LD-OD-${String(1050 + count)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newLead);
    setStoredItem(STORAGE_KEYS.LEADS, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'CREATE_LEAD', 'CRM', `Created lead ${newLead.leadCode} for customer ${newLead.customerName}`);
    return newLead;
  },

  updateLeadStatus(leadId: string, status: LeadStatus, actor: StaffProfile): void {
    const list = this.getLeads();
    const item = list.find(l => l.id === leadId || l.leadCode === leadId);
    if (item) {
      item.status = status;
      setStoredItem(STORAGE_KEYS.LEADS, list);
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_LEAD', 'CRM', `Updated lead ${item.leadCode} status to ${status}`);
    }
  },

  // --- CORPORATE PROSPECTS (9-STAGE PIPELINE) ---
  getCorporateProspects(): CorporateProspect[] {
    return getStoredItem<CorporateProspect[]>(STORAGE_KEYS.CORP_PROSPECTS, INITIAL_CORP_PROSPECTS);
  },

  createCorporateProspect(data: Omit<CorporateProspect, 'id' | 'prospectCode' | 'updatedAt'>, actor: StaffProfile): CorporateProspect {
    const list = this.getCorporateProspects();
    const count = list.length + 1;
    const newProspect: CorporateProspect = {
      ...data,
      id: `corp-${Date.now()}`,
      prospectCode: `CRP-OD-${String(500 + count)}`,
      updatedAt: new Date().toISOString()
    };
    list.unshift(newProspect);
    setStoredItem(STORAGE_KEYS.CORP_PROSPECTS, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'CREATE_CORP_PROSPECT', 'Corporate CRM', `Added corporate prospect ${newProspect.organizationName}`);
    return newProspect;
  },

  updateCorporateStage(id: string, stage: CorporatePipelineStage, actor: StaffProfile): void {
    const list = this.getCorporateProspects();
    const item = list.find(c => c.id === id || c.prospectCode === id);
    if (item) {
      item.pipelineStage = stage;
      item.updatedAt = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.CORP_PROSPECTS, list);
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_CORP_STAGE', 'Corporate CRM', `Advanced ${item.organizationName} to ${stage}`);
    }
  },

  // --- PARTNER RECRUITMENT ---
  getPartners(): PartnerApplication[] {
    return getStoredItem<PartnerApplication[]>(STORAGE_KEYS.PARTNERS, INITIAL_PARTNER_APPLICATIONS);
  },

  createPartner(data: Omit<PartnerApplication, 'id' | 'partnerCode' | 'submittedAt'>, actor: StaffProfile): PartnerApplication {
    const list = this.getPartners();
    const count = list.length + 1;
    const newPartner: PartnerApplication = {
      ...data,
      id: `ptr-${Date.now()}`,
      partnerCode: `PTR-OD-${String(300 + count)}`,
      submittedAt: new Date().toISOString()
    };
    list.unshift(newPartner);
    setStoredItem(STORAGE_KEYS.PARTNERS, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'CREATE_PARTNER', 'Partner Onboarding', `Registered partner application ${newPartner.partnerName} (${newPartner.districtName})`);
    return newPartner;
  },

  updatePartnerStatus(partnerId: string, status: PartnerApplicationStatus, actor: StaffProfile): void {
    const list = this.getPartners();
    const item = list.find(p => p.id === partnerId || p.partnerCode === partnerId);
    if (item) {
      item.applicationStatus = status;
      if (status === 'verified' || status === 'approved') {
        item.documentVerified = true;
      }
      setStoredItem(STORAGE_KEYS.PARTNERS, list);
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_PARTNER_STATUS', 'Partner Onboarding', `Updated partner ${item.partnerCode} status to ${status}`);
    }
  },

  // --- BOOKING PIPELINE (20% Markup Model) ---
  getBookings(): BookingRecord[] {
    return getStoredItem<BookingRecord[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  createBooking(data: {
    customerName: string;
    customerMobile: string;
    districtId: string;
    serviceTitle: string;
    serviceSubtotal: number;
    scheduledDate: string;
    assignedPartnerName?: string;
  }, actor: StaffProfile): BookingRecord {
    const list = this.getBookings();
    const districts = this.getDistricts();
    const dist = districts.find(d => d.id === data.districtId);
    const count = list.length + 1;

    // Financial formulas as per Section 18:
    // Proposed 20% Doorbly markup is incorporated in customer service price
    const subtotal = data.serviceSubtotal;
    const tax = Math.round(subtotal * 0.18);
    const payable = subtotal + tax;
    const commission = Math.round(subtotal * 0.20);
    const partnerPayout = subtotal - commission;

    const newBooking: BookingRecord = {
      id: `bk-${Date.now()}`,
      bookingCode: `DBL-BK-${String(8890 + count)}`,
      customerName: data.customerName,
      customerMobile: data.customerMobile,
      districtId: data.districtId,
      districtName: dist?.name || 'Khordha',
      serviceTitle: data.serviceTitle,
      serviceSubtotal: subtotal,
      applicableTax: tax,
      customerPayable: payable,
      doorblyCommissionRate: 20,
      doorblyCommission: commission,
      partnerPayout: partnerPayout,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid',
      scheduledDate: data.scheduledDate,
      assignedPartnerName: data.assignedPartnerName,
      participatingStaffId: actor.id,
      participatingStaffName: actor.fullName,
      reconciliationStatus: 'pending'
    };

    list.unshift(newBooking);
    setStoredItem(STORAGE_KEYS.BOOKINGS, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'CREATE_BOOKING', 'Bookings', `Created booking ${newBooking.bookingCode} for ₹${newBooking.serviceSubtotal}`);
    return newBooking;
  },

  updateBookingStatus(bookingId: string, bookingStatus: BookingStatus, paymentStatus?: PaymentStatus, actor?: StaffProfile): void {
    const list = this.getBookings();
    const item = list.find(b => b.id === bookingId || b.bookingCode === bookingId);
    if (item) {
      item.bookingStatus = bookingStatus;
      if (paymentStatus) item.paymentStatus = paymentStatus;
      if (bookingStatus === 'completed' && !item.completedDate) {
        item.completedDate = new Date().toISOString();
        item.reconciliationStatus = 'reconciled';

        // Update district completed subtotal
        const districts = this.getDistricts();
        const dist = districts.find(d => d.id === item.districtId);
        if (dist) {
          dist.actualCompletedSubtotal += item.serviceSubtotal;
          dist.completedBookingsCount += 1;
          setStoredItem(STORAGE_KEYS.DISTRICTS, districts);
        }
      }
      setStoredItem(STORAGE_KEYS.BOOKINGS, list);
      if (actor) {
        this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_BOOKING', 'Bookings', `Updated booking ${item.bookingCode} to ${bookingStatus}`);
      }
    }
  },

  // --- CUSTOMER SUPPORT ---
  getTickets(): ComplaintTicket[] {
    return getStoredItem<ComplaintTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_COMPLAINT_TICKETS);
  },

  createTicket(data: Omit<ComplaintTicket, 'id' | 'ticketCode' | 'createdAt' | 'isCustomerConfirmed'>, actor: StaffProfile): ComplaintTicket {
    const list = this.getTickets();
    const count = list.length + 1;
    const newTicket: ComplaintTicket = {
      ...data,
      id: `tkt-${Date.now()}`,
      ticketCode: `TKT-OD-${String(9920 + count)}`,
      isCustomerConfirmed: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newTicket);
    setStoredItem(STORAGE_KEYS.TICKETS, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'CREATE_TICKET', 'Customer Support', `Registered ticket ${newTicket.ticketCode} (${newTicket.complaintCategory})`);
    return newTicket;
  },

  updateTicketStatus(ticketId: string, status: TicketStatus, resolutionNotes?: string, actor?: StaffProfile): void {
    const list = this.getTickets();
    const item = list.find(t => t.id === ticketId || t.ticketCode === ticketId);
    if (item) {
      item.status = status;
      if (resolutionNotes) item.resolutionNotes = resolutionNotes;
      if (status === 'resolved') item.isCustomerConfirmed = true;
      setStoredItem(STORAGE_KEYS.TICKETS, list);
      if (actor) {
        this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_TICKET', 'Customer Support', `Ticket ${item.ticketCode} status updated to ${status}`);
      }
    }
  },

  // --- ANNOUNCEMENTS ---
  getAnnouncements(): SystemAnnouncement[] {
    return getStoredItem<SystemAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },

  createAnnouncement(data: Omit<SystemAnnouncement, 'id' | 'publishedAt'>, actor: StaffProfile): SystemAnnouncement {
    const list = this.getAnnouncements();
    const newAnc: SystemAnnouncement = {
      ...data,
      id: `anc-${Date.now()}`,
      publishedAt: new Date().toISOString()
    };
    list.unshift(newAnc);
    setStoredItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'PUBLISH_ANNOUNCEMENT', 'Announcements', `Published: "${newAnc.title}"`);
    return newAnc;
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): SystemAuditLog[] {
    return getStoredItem<SystemAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  logAudit(actorId: string, actorName: string, actorRole: string, action: string, module: string, details: string): void {
    const logs = this.getAuditLogs();
    const entry: SystemAuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actorId,
      actorName,
      actorRole,
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(entry);
    // Keep last 300 logs
    if (logs.length > 300) logs.pop();
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // --- DAILY REPORTS AUTOMATION ---
  getDepartmentDailyReports(): DepartmentDailyReport[] {
    return getStoredItem<DepartmentDailyReport[]>(STORAGE_KEYS.DAILY_REPORTS, []);
  },

  generateDailyReport(staff: StaffProfile, problemsEncountered: string, nextDayPlan: string): DepartmentDailyReport {
    const allTasks = this.getDailyTasks({ staffId: staff.id });
    const assignedCount = allTasks.length;
    const completedCount = allTasks.filter(t => t.status === 'submitted' || t.status === 'approved').length;
    const pendingCount = allTasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;
    const approvedCount = allTasks.filter(t => t.status === 'approved').length;
    const rejectedCount = allTasks.filter(t => t.status === 'rejected').length;

    const credits = this.getWorkCredits(staff.id);
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCredits = credits
      .filter(c => c.date === todayStr)
      .reduce((sum, c) => sum + c.totalCredits, 0);

    const leads = this.getLeads().filter(l => l.assignedStaffId === staff.id);
    const bookings = this.getBookings().filter(b => b.participatingStaffId === staff.id);
    const revenueAttributed = bookings
      .filter(b => b.bookingStatus === 'completed')
      .reduce((sum, b) => sum + b.serviceSubtotal, 0);

    const reports = this.getDepartmentDailyReports();
    const newReport: DepartmentDailyReport = {
      id: `rep-${Date.now()}`,
      reportDate: todayStr,
      departmentId: staff.departmentId,
      departmentName: staff.departmentName || 'General',
      districtId: staff.districtId,
      districtName: staff.districtName,
      employeeId: staff.employeeId,
      employeeName: staff.fullName,
      assignedTasks: assignedCount,
      completedTasks: completedCount,
      pendingTasks: pendingCount,
      approvedTasks: approvedCount,
      rejectedTasks: rejectedCount,
      productivityCredits: todayCredits,
      leadsGenerated: leads.length,
      bookingsGenerated: bookings.length,
      revenueAttributed: revenueAttributed,
      problemsEncountered: problemsEncountered || 'None',
      nextDayPlan: nextDayPlan || 'Continue standard district operations pipeline.',
      createdAt: new Date().toISOString()
    };

    reports.unshift(newReport);
    setStoredItem(STORAGE_KEYS.DAILY_REPORTS, reports);
    this.logAudit(staff.id, staff.fullName, staff.systemRole, 'GENERATE_DAILY_REPORT', 'Reports', `Generated daily department report for ${todayStr}`);
    return newReport;
  },

  // --- HR RECRUITMENT PIPELINE ---
  getCandidates(): JobCandidate[] {
    return getStoredItem<JobCandidate[]>(STORAGE_KEYS.CANDIDATES, []);
  },

  createCandidate(data: Omit<JobCandidate, 'id' | 'appliedDate' | 'updatedAt'>, actor?: StaffProfile): JobCandidate {
    const list = this.getCandidates();
    const newCandidate: JobCandidate = {
      ...data,
      id: `cand-${Date.now()}`,
      appliedDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newCandidate);
    setStoredItem(STORAGE_KEYS.CANDIDATES, list);
    if (actor) {
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'CREATE_CANDIDATE', 'Human Resources', `Added candidate ${newCandidate.fullName} for ${newCandidate.appliedDesignationTitle} (${newCandidate.districtName})`);
    }
    return newCandidate;
  },

  updateCandidate(id: string, updates: Partial<JobCandidate>, actor?: StaffProfile): JobCandidate | null {
    const list = this.getCandidates();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setStoredItem(STORAGE_KEYS.CANDIDATES, list);
    if (actor) {
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_CANDIDATE', 'Human Resources', `Updated candidate ${list[index].fullName} (Stage: ${list[index].stage})`);
    }
    return list[index];
  },

  deleteCandidate(id: string, actor?: StaffProfile): boolean {
    const list = this.getCandidates();
    const candidate = list.find(c => c.id === id);
    if (!candidate) return false;

    const filtered = list.filter(c => c.id !== id);
    setStoredItem(STORAGE_KEYS.CANDIDATES, filtered);
    if (actor) {
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'DELETE_CANDIDATE', 'Human Resources', `Removed candidate ${candidate.fullName}`);
    }
    return true;
  },

  onboardCandidateToStaff(candidateId: string, actor: StaffProfile): { success: boolean; staff?: StaffProfile; error?: string } {
    const candidate = this.getCandidates().find(c => c.id === candidateId);
    if (!candidate) {
      return { success: false, error: 'Candidate not found in recruitment pipeline.' };
    }

    const allStaff = this.getStaffProfiles();
    const designations = this.getDesignations();
    const desig = designations.find(d => d.id === candidate.appliedDesignationId);
    const count = allStaff.length + 1;
    const employeeId = `DBL-OD-${String(count).padStart(3, '0')}`;

    const newStaff: StaffProfile = {
      id: `staff-${Date.now()}`,
      employeeId,
      fullName: candidate.fullName,
      email: candidate.email,
      mobile: candidate.mobile,
      departmentId: desig?.departmentId || 'dept_gen_ops',
      departmentName: desig?.title || 'General Operations',
      designationId: candidate.appliedDesignationId,
      designationTitle: candidate.appliedDesignationTitle,
      systemRole: desig?.systemRole || 'employee',
      districtId: candidate.districtId,
      districtName: candidate.districtName,
      joiningDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      permissionLevel: desig?.systemRole === 'district_manager' ? 'manager' : desig?.systemRole === 'district_coordinator' ? 'coordinator' : 'staff',
      reportingManagerId: actor.id,
      reportingManagerName: actor.fullName
    };

    allStaff.push(newStaff);
    setStoredItem(STORAGE_KEYS.STAFF, allStaff);

    // Update candidate stage to Onboarded
    this.updateCandidate(candidateId, { stage: 'Onboarded' }, actor);

    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'ONBOARD_CANDIDATE', 'Human Resources', `Successfully converted candidate ${candidate.fullName} to active staff profile ${employeeId}`);

    return { success: true, staff: newStaff };
  },

  deleteStaffProfile(staffId: string, actor: StaffProfile): boolean {
    const list = this.getStaffProfiles();
    const index = list.findIndex(s => s.id === staffId);
    if (index === -1) return false;
    const removed = list.splice(index, 1)[0];
    setStoredItem(STORAGE_KEYS.STAFF, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'DELETE_EMPLOYEE', 'Staff Management', `Deleted employee ${removed.employeeId} (${removed.fullName})`);
    return true;
  },

  // --- LEAVE MANAGEMENT ---
  getLeaves(staffId?: string): LeaveRequest[] {
    const list = getStoredItem<LeaveRequest[]>(STORAGE_KEYS.LEAVES, []);
    if (!staffId) return list;
    return list.filter(l => l.staffId === staffId || l.employeeId === staffId);
  },

  applyLeave(data: Omit<LeaveRequest, 'id' | 'status' | 'appliedAt'>, actor: StaffProfile): LeaveRequest {
    const list = this.getLeaves();
    const newLeave: LeaveRequest = {
      ...data,
      id: `lev-${Date.now()}`,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    list.unshift(newLeave);
    setStoredItem(STORAGE_KEYS.LEAVES, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'APPLY_LEAVE', 'Leave Management', `Applied for ${newLeave.leaveType} leave from ${newLeave.startDate} to ${newLeave.endDate}`);
    return newLeave;
  },

  updateLeaveStatus(leaveId: string, status: LeaveStatus, actor: StaffProfile, notes?: string): void {
    const list = this.getLeaves();
    const leave = list.find(l => l.id === leaveId);
    if (leave) {
      leave.status = status;
      leave.approvedByStaffId = actor.id;
      leave.approvedByName = actor.fullName;
      if (notes) leave.approvalNotes = notes;
      setStoredItem(STORAGE_KEYS.LEAVES, list);
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_LEAVE', 'Leave Management', `Leave request for ${leave.employeeName} updated to ${status.toUpperCase()}`);
    }
  },

  // --- FINANCIAL & ACCOUNTS CONTROL ---
  getFinancialTransactions(): FinancialTransaction[] {
    const list = getStoredItem<FinancialTransaction[]>(STORAGE_KEYS.FINANCIAL_TXNS, []);
    return list;
  },

  createFinancialTransaction(data: Omit<FinancialTransaction, 'id' | 'referenceId' | 'createdAt'>, actor: StaffProfile): FinancialTransaction {
    const list = this.getFinancialTransactions();
    const count = list.length + 1;
    const newTxn: FinancialTransaction = {
      ...data,
      id: `txn-${Date.now()}`,
      referenceId: `TXN-OD-${String(9000 + count)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newTxn);
    setStoredItem(STORAGE_KEYS.FINANCIAL_TXNS, list);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'FINANCIAL_RECORD', 'Finance', `Recorded ${newTxn.direction.toUpperCase()} transaction ${newTxn.referenceId} of ₹${newTxn.amount} (${newTxn.type})`);
    return newTxn;
  },

  // --- DEPARTMENT EDITING ---
  updateDepartment(id: string, updates: Partial<Department>, actor: StaffProfile): Department {
    const depts = this.getDepartments();
    const index = depts.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Department not found');
    const updated = { ...depts[index], ...updates };
    depts[index] = updated;
    setStoredItem(STORAGE_KEYS.DEPARTMENTS, depts);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_DEPARTMENT', 'Departments', `Updated department ${updated.name}`);
    return updated;
  },

  // --- DISTRICT EDITING ---
  updateDistrict(id: string, updates: Partial<DistrictMaster>, actor: StaffProfile): DistrictMaster {
    const dists = this.getDistricts();
    const index = dists.findIndex(d => d.id === id);
    if (index === -1) throw new Error('District not found');
    const updated = { ...dists[index], ...updates };
    dists[index] = updated;
    setStoredItem(STORAGE_KEYS.DISTRICTS, dists);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'UPDATE_DISTRICT', 'Districts', `Updated district metadata for ${updated.name}`);
    return updated;
  },

  // --- TASK REASSIGNMENT & DELETION ---
  reassignTask(taskId: string, targetStaffId: string, actor: StaffProfile): void {
    const tasks = this.getDailyTasks();
    const staffList = this.getStaffProfiles();
    const task = tasks.find(t => t.id === taskId || t.taskId === taskId);
    const targetStaff = staffList.find(s => s.id === targetStaffId);
    if (task && targetStaff) {
      const prevName = task.employeeName;
      task.staffId = targetStaff.id;
      task.employeeId = targetStaff.employeeId;
      task.employeeName = targetStaff.fullName;
      task.districtId = targetStaff.districtId;
      task.departmentId = targetStaff.departmentId;
      task.designationId = targetStaff.designationId;
      task.status = 'reassigned';
      setStoredItem(STORAGE_KEYS.TASKS, tasks);
      this.logAudit(actor.id, actor.fullName, actor.systemRole, 'REASSIGN_TASK', 'Tasks', `Reassigned task ${task.taskId} from ${prevName} to ${targetStaff.fullName}`);
    }
  },

  deleteDailyTask(taskId: string, actor: StaffProfile): boolean {
    const tasks = this.getDailyTasks();
    const index = tasks.findIndex(t => t.id === taskId || t.taskId === taskId);
    if (index === -1) return false;
    const removed = tasks.splice(index, 1)[0];
    setStoredItem(STORAGE_KEYS.TASKS, tasks);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'DELETE_TASK', 'Tasks', `Deleted task ${removed.taskId} (${removed.taskTitle})`);
    return true;
  },

  deletePartner(partnerId: string, actor: StaffProfile): boolean {
    const partners = this.getPartners();
    const index = partners.findIndex(p => p.id === partnerId || p.partnerCode === partnerId);
    if (index === -1) return false;
    const removed = partners.splice(index, 1)[0];
    setStoredItem(STORAGE_KEYS.PARTNERS, partners);
    this.logAudit(actor.id, actor.fullName, actor.systemRole, 'DELETE_PARTNER', 'Partners', `Removed partner ${removed.partnerCode} (${removed.partnerName})`);
    return true;
  },

  // ==========================================
  // --- STAFF INDIVIDUAL WALLET ENGINE ---
  // ==========================================
  getWallets(): StaffWallet[] {
    const list = getStoredItem<StaffWallet[]>(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
    const allStaff = this.getStaffProfiles();
    let updated = false;

    // Ensure every staff member has an individual wallet automatically
    allStaff.forEach(staff => {
      const exists = list.some(w => w.staffId === staff.id || w.employeeId === staff.employeeId);
      if (!exists) {
        const newWallet: StaffWallet = {
          id: `wlt-${staff.id}`,
          staffId: staff.id,
          employeeId: staff.employeeId,
          fullName: staff.fullName,
          departmentId: staff.departmentId,
          departmentName: staff.departmentName || 'General Operations',
          designationTitle: staff.designationTitle || 'Staff Executive',
          districtName: staff.districtName,
          totalEarnings: 0,
          availableBalance: 0,
          pendingEarnings: 0,
          approvedEarnings: 0,
          totalWithdrawnAmount: 0,
          totalAdminAdjustments: 0,
          totalCompletedWork: 0,
          currentMonthEarnings: 0,
          bankAccountDetails: {
            accountHolderName: staff.fullName,
            accountNumber: '•••• •••• ' + (staff.mobile?.replace(/[^0-9]/g, '').slice(-4) || '9921'),
            ifscCode: 'SBIN0001024',
            bankName: 'State Bank of India',
            upiId: `${staff.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
            isKycVerified: true
          },
          updatedAt: new Date().toISOString()
        };
        list.push(newWallet);
        updated = true;
      }
    });

    if (updated) {
      setStoredItem(STORAGE_KEYS.WALLETS, list);
    }
    return list;
  },

  getStaffWallet(staffId: string): StaffWallet {
    const list = this.getWallets();
    let wallet = list.find(w => w.staffId === staffId || w.employeeId === staffId);
    if (!wallet) {
      const staff = this.getStaffById(staffId);
      wallet = {
        id: `wlt-${staffId}`,
        staffId: staff?.id || staffId,
        employeeId: staff?.employeeId || staffId,
        fullName: staff?.fullName || 'Doorbly Employee',
        departmentId: staff?.departmentId || 'dept_gen_ops',
        departmentName: staff?.departmentName || 'General Operations',
        designationTitle: staff?.designationTitle || 'Staff Executive',
        districtName: staff?.districtName || 'Khordha (Bhubaneswar HQ)',
        totalEarnings: 0,
        availableBalance: 0,
        pendingEarnings: 0,
        approvedEarnings: 0,
        totalWithdrawnAmount: 0,
        totalAdminAdjustments: 0,
        totalCompletedWork: 0,
        currentMonthEarnings: 0,
        bankAccountDetails: {
          accountHolderName: staff?.fullName || 'Doorbly Employee',
          accountNumber: '•••• •••• 9921',
          ifscCode: 'SBIN0001024',
          bankName: 'State Bank of India',
          upiId: 'doorbly.staff@upi',
          isKycVerified: true
        },
        updatedAt: new Date().toISOString()
      };
      list.push(wallet);
      setStoredItem(STORAGE_KEYS.WALLETS, list);
    }
    return wallet;
  },

  updateWalletBankDetails(staffId: string, details: StaffBankAccountDetails, actor?: StaffProfile): StaffWallet {
    const list = this.getWallets();
    const index = list.findIndex(w => w.staffId === staffId || w.employeeId === staffId);
    if (index === -1) throw new Error('Staff wallet not found');

    list[index].bankAccountDetails = {
      ...details,
      isKycVerified: true
    };
    list[index].updatedAt = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.WALLETS, list);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.fullName,
        actor.systemRole,
        'UPDATE_WALLET_KYC',
        'Staff Wallet',
        `Updated bank details & payout account for employee ${list[index].employeeId} (${list[index].fullName})`
      );
    }
    return list[index];
  },

  // --- WALLET TRANSACTIONS LEDGER ---
  getWalletTransactions(staffId?: string): StaffWalletTransaction[] {
    const list = getStoredItem<StaffWalletTransaction[]>(STORAGE_KEYS.WALLET_TXNS, INITIAL_WALLET_TXNS);
    if (!staffId) return list;
    return list.filter(t => t.staffId === staffId || t.employeeId === staffId);
  },

  recordWalletTransaction(data: Omit<StaffWalletTransaction, 'id' | 'transactionId' | 'createdAt'>): StaffWalletTransaction {
    const list = getStoredItem<StaffWalletTransaction[]>(STORAGE_KEYS.WALLET_TXNS, INITIAL_WALLET_TXNS);
    const count = list.length + 1;
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const newTxn: StaffWalletTransaction = {
      ...data,
      id: `wtx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      transactionId: `WLT-TXN-${dateStr}-${String(count).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newTxn);
    setStoredItem(STORAGE_KEYS.WALLET_TXNS, list);
    return newTxn;
  },

  // ==========================================
  // --- STAFF WORK & EARNINGS MANAGEMENT ---
  // ==========================================
  getStaffWorkAssignments(filter?: { staffId?: string; departmentId?: string; districtId?: string; status?: StaffWorkStatus }): StaffWorkAssignment[] {
    const list = getStoredItem<StaffWorkAssignment[]>(STORAGE_KEYS.WORK_ASSIGNMENTS, INITIAL_WORK_ASSIGNMENTS);
    if (!filter) return list;

    return list.filter(w => {
      if (filter.staffId && !w.assignedStaffIds.includes(filter.staffId)) return false;
      if (filter.departmentId && w.departmentId !== filter.departmentId) return false;
      if (filter.districtId && w.districtId !== filter.districtId) return false;
      if (filter.status && w.status !== filter.status) return false;
      return true;
    });
  },

  getStaffWorkById(workId: string): StaffWorkAssignment | undefined {
    const list = this.getStaffWorkAssignments();
    return list.find(w => w.id === workId || w.workCode === workId);
  },

  createWorkAssignment(
    data: Omit<StaffWorkAssignment, 'id' | 'workCode' | 'createdAt' | 'updatedAt' | 'isCredited'>,
    actor: StaffProfile
  ): StaffWorkAssignment {
    const list = this.getStaffWorkAssignments();
    const count = list.length + 1;
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const workCode = `WRK-OD-${dateStr}-${String(count).padStart(3, '0')}`;

    const newWork: StaffWorkAssignment = {
      ...data,
      id: `wrk-${Date.now()}`,
      workCode,
      isCredited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newWork);
    setStoredItem(STORAGE_KEYS.WORK_ASSIGNMENTS, list);

    // Update pending earnings on assigned staff wallets
    const wallets = this.getWallets();
    data.assignedStaffIds.forEach(staffId => {
      const w = wallets.find(wallet => wallet.staffId === staffId || wallet.employeeId === staffId);
      if (w) {
        w.pendingEarnings += data.staffEarningAmount;
        w.updatedAt = new Date().toISOString();
      }

      // Send in-app notification
      this.createNotification({
        staffId,
        title: `New Work Assigned: ${newWork.workCode}`,
        message: `You have been assigned "${newWork.title}" with earning credit value ₹${newWork.staffEarningAmount}. Deadline: ${newWork.completionDeadline}`,
        type: 'task',
        linkTarget: 'wallet'
      });
    });
    setStoredItem(STORAGE_KEYS.WALLETS, wallets);

    this.logAudit(
      actor.id,
      actor.fullName,
      actor.systemRole,
      'CREATE_WORK_ASSIGNMENT',
      'Staff Work & Earnings',
      `Created work ${newWork.workCode}: "${newWork.title}" (Customer Value: ₹${newWork.customerWorkValue}, Staff Earning: ₹${newWork.staffEarningAmount}) assigned to ${newWork.assignedStaffNames.join(', ')}`
    );

    return newWork;
  },

  updateWorkAssignment(workId: string, updates: Partial<StaffWorkAssignment>, actor: StaffProfile): StaffWorkAssignment {
    const list = this.getStaffWorkAssignments();
    const index = list.findIndex(w => w.id === workId || w.workCode === workId);
    if (index === -1) throw new Error('Work assignment not found');

    const prevWork = { ...list[index] };
    const updatedWork: StaffWorkAssignment = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // CRITICAL: Earning Amount Modification & Audited Adjustment / Reversal Handling
    if (updates.staffEarningAmount !== undefined && updates.staffEarningAmount !== prevWork.staffEarningAmount) {
      const oldAmount = prevWork.staffEarningAmount;
      const newAmount = updates.staffEarningAmount;
      const diff = newAmount - oldAmount;

      if (prevWork.isCredited) {
        // CASE A: Work was already credited to staff wallet!
        // We MUST NOT silently overwrite the past transaction.
        // Instead, post an audited adjustment or reversal transaction.
        const wallets = this.getWallets();
        prevWork.assignedStaffIds.forEach(staffId => {
          const w = wallets.find(wallet => wallet.staffId === staffId || wallet.employeeId === staffId);
          if (w) {
            if (diff > 0) {
              // Increase earning
              w.availableBalance += diff;
              w.totalEarnings += diff;
              w.approvedEarnings += diff;
              w.totalAdminAdjustments += diff;

              this.recordWalletTransaction({
                staffId: w.staffId,
                employeeId: w.employeeId,
                date: new Date().toISOString().replace('T', ' ').slice(0, 19),
                workId: updatedWork.workCode,
                workDescription: `Admin Earning Increase on ${updatedWork.workCode} (₹${oldAmount} ➔ ₹${newAmount})`,
                category: 'Admin Adjustment',
                type: 'adjustment_credit',
                credit: diff,
                debit: 0,
                runningBalance: w.availableBalance,
                status: 'completed',
                adminRemarks: updates.adminRemarks || `Authorized increase by ${actor.fullName}`,
                authorizedBy: actor.fullName
              });
            } else {
              // Decrease earning (reversal adjustment)
              const debitAmount = Math.abs(diff);
              w.availableBalance = Math.max(0, w.availableBalance - debitAmount);
              w.totalEarnings = Math.max(0, w.totalEarnings - debitAmount);
              w.approvedEarnings = Math.max(0, w.approvedEarnings - debitAmount);
              w.totalAdminAdjustments -= debitAmount;

              this.recordWalletTransaction({
                staffId: w.staffId,
                employeeId: w.employeeId,
                date: new Date().toISOString().replace('T', ' ').slice(0, 19),
                workId: updatedWork.workCode,
                workDescription: `Admin Earning Reduction on ${updatedWork.workCode} (₹${oldAmount} ➔ ₹${newAmount})`,
                category: 'Admin Adjustment',
                type: 'adjustment_debit',
                credit: 0,
                debit: debitAmount,
                runningBalance: w.availableBalance,
                status: 'completed',
                adminRemarks: updates.adminRemarks || `Authorized reduction by ${actor.fullName}`,
                authorizedBy: actor.fullName
              });
            }
            w.updatedAt = new Date().toISOString();

            this.createNotification({
              staffId,
              title: `Wallet Adjustment on ${updatedWork.workCode}`,
              message: `Earning amount was adjusted from ₹${oldAmount} to ₹${newAmount} (${diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}) by Admin ${actor.fullName}.`,
              type: 'alert',
              linkTarget: 'wallet'
            });
          }
        });
        setStoredItem(STORAGE_KEYS.WALLETS, wallets);

        this.logAudit(
          actor.id,
          actor.fullName,
          actor.systemRole,
          'ADJUST_CREDITED_WORK_AMOUNT',
          'Staff Work & Earnings',
          `Audited financial adjustment on credited work ${updatedWork.workCode}: earning changed from ₹${oldAmount} to ₹${newAmount} (${diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`})`
        );
      } else {
        // CASE B: Work not yet credited. Adjust pending earnings on wallets.
        const wallets = this.getWallets();
        prevWork.assignedStaffIds.forEach(staffId => {
          const w = wallets.find(wallet => wallet.staffId === staffId || wallet.employeeId === staffId);
          if (w) {
            w.pendingEarnings = Math.max(0, w.pendingEarnings + diff);
            w.updatedAt = new Date().toISOString();
          }
        });
        setStoredItem(STORAGE_KEYS.WALLETS, wallets);
      }
    }

    list[index] = updatedWork;
    setStoredItem(STORAGE_KEYS.WORK_ASSIGNMENTS, list);

    this.logAudit(
      actor.id,
      actor.fullName,
      actor.systemRole,
      'UPDATE_WORK_ASSIGNMENT',
      'Staff Work & Earnings',
      `Updated work ${updatedWork.workCode} (${updatedWork.title})`
    );

    return updatedWork;
  },

  submitWorkCompletion(
    workId: string,
    staff: StaffProfile,
    submissionNotes: string,
    evidenceFileName?: string,
    evidenceUrl?: string
  ): StaffWorkAssignment {
    const list = this.getStaffWorkAssignments();
    const work = list.find(w => w.id === workId || w.workCode === workId);
    if (!work) throw new Error('Work assignment not found');

    work.status = 'completed';
    work.submissionNotes = submissionNotes;
    if (evidenceFileName) work.evidenceFileName = evidenceFileName;
    if (evidenceUrl) work.evidenceUrl = evidenceUrl;
    work.completedAt = new Date().toISOString();
    work.updatedAt = new Date().toISOString();

    setStoredItem(STORAGE_KEYS.WORK_ASSIGNMENTS, list);

    this.logAudit(
      staff.id,
      staff.fullName,
      staff.systemRole,
      'SUBMIT_WORK_COMPLETION',
      'Staff Work & Earnings',
      `Submitted work completion for ${work.workCode}: "${work.title}". Earning pending approval: ₹${work.staffEarningAmount}`
    );

    return work;
  },

  // 5. WORK COMPLETION & WALLET CREDITING (With strict Idempotency Protection)
  approveWorkAndCreditWallet(
    workId: string,
    approver: StaffProfile,
    extraIncentive: number = 0,
    adminRemarks?: string
  ): { success: boolean; creditedAmount?: number; error?: string } {
    const list = this.getStaffWorkAssignments();
    const work = list.find(w => w.id === workId || w.workCode === workId);
    if (!work) return { success: false, error: 'Work record not found.' };

    // IDEMPOTENCY GUARD: Prevent duplicate credits if administrator clicks multiple times
    if (work.isCredited) {
      return {
        success: false,
        error: `Duplicate credit prevented! This work assignment was already credited on ${work.approvedAt} (Transaction: ${work.creditedTransactionId || 'RECORDED'}).`
      };
    }

    const baseAmount = work.staffEarningAmount;
    const totalCreditPerStaff = baseAmount + extraIncentive;
    const approvalTimestamp = new Date().toISOString();

    work.status = 'approved';
    work.isCredited = true;
    work.approvedAt = approvalTimestamp;
    work.approvedByStaffId = approver.id;
    work.approvedByName = approver.fullName;
    work.incentiveAmount = extraIncentive;
    if (adminRemarks) work.adminRemarks = adminRemarks;
    work.updatedAt = approvalTimestamp;

    // Credit each assigned staff member's individual wallet
    const wallets = this.getWallets();
    let lastTxnId = '';

    work.assignedStaffIds.forEach(staffId => {
      const wallet = wallets.find(w => w.staffId === staffId || w.employeeId === staffId);
      if (wallet) {
        wallet.availableBalance += totalCreditPerStaff;
        wallet.totalEarnings += totalCreditPerStaff;
        wallet.approvedEarnings += totalCreditPerStaff;
        wallet.totalCompletedWork += 1;
        wallet.currentMonthEarnings += totalCreditPerStaff;
        wallet.pendingEarnings = Math.max(0, wallet.pendingEarnings - baseAmount);
        wallet.updatedAt = approvalTimestamp;

        // Create transaction record
        const txn = this.recordWalletTransaction({
          staffId: wallet.staffId,
          employeeId: wallet.employeeId,
          date: approvalTimestamp.replace('T', ' ').slice(0, 19),
          workId: work.workCode,
          workDescription: `${work.title} (Approved Work Earning${extraIncentive > 0 ? ` + ₹${extraIncentive} Incentive` : ''})`,
          category: 'Work Completion',
          type: 'work_credit',
          credit: totalCreditPerStaff,
          debit: 0,
          runningBalance: wallet.availableBalance,
          status: 'completed',
          adminRemarks: adminRemarks || `Approved by ${approver.fullName}. Base: ₹${baseAmount}${extraIncentive > 0 ? `, Incentive: ₹${extraIncentive}` : ''}`,
          authorizedBy: approver.fullName
        });

        lastTxnId = txn.transactionId;

        // In-app notification for the employee
        this.createNotification({
          staffId,
          title: `Wallet Credited: ₹${totalCreditPerStaff}`,
          message: `Your work "${work.title}" has been approved. ₹${totalCreditPerStaff} has been credited to your available wallet balance.`,
          type: 'approval',
          linkTarget: 'wallet'
        });
      }
    });

    work.creditedTransactionId = lastTxnId;

    setStoredItem(STORAGE_KEYS.WALLETS, wallets);
    setStoredItem(STORAGE_KEYS.WORK_ASSIGNMENTS, list);

    this.logAudit(
      approver.id,
      approver.fullName,
      approver.systemRole,
      'APPROVE_WORK_WALLET_CREDIT',
      'Staff Work & Earnings',
      `Approved work ${work.workCode} and credited ₹${totalCreditPerStaff} to ${work.assignedStaffNames.join(', ')} (Txn: ${lastTxnId})`
    );

    return { success: true, creditedAmount: totalCreditPerStaff };
  },

  rejectWorkAssignment(workId: string, approver: StaffProfile, mandatoryReason: string): void {
    if (!mandatoryReason || mandatoryReason.trim().length < 5) {
      throw new Error('Mandatory rejection reason required (minimum 5 characters).');
    }

    const list = this.getStaffWorkAssignments();
    const work = list.find(w => w.id === workId || w.workCode === workId);
    if (!work) throw new Error('Work not found');

    work.status = 'rejected';
    work.rejectionReason = mandatoryReason;
    work.approvedByStaffId = approver.id;
    work.approvedByName = approver.fullName;
    work.updatedAt = new Date().toISOString();

    // Release pending earnings on staff wallet
    const wallets = this.getWallets();
    work.assignedStaffIds.forEach(staffId => {
      const w = wallets.find(wallet => wallet.staffId === staffId || wallet.employeeId === staffId);
      if (w) {
        w.pendingEarnings = Math.max(0, w.pendingEarnings - work.staffEarningAmount);
        w.updatedAt = new Date().toISOString();
      }

      this.createNotification({
        staffId,
        title: `Work Discrepancy on ${work.workCode}`,
        message: `Work "${work.title}" was rejected: ${mandatoryReason}. Please review notes and re-submit.`,
        type: 'rejection',
        linkTarget: 'wallet'
      });
    });

    setStoredItem(STORAGE_KEYS.WALLETS, wallets);
    setStoredItem(STORAGE_KEYS.WORK_ASSIGNMENTS, list);

    this.logAudit(
      approver.id,
      approver.fullName,
      approver.systemRole,
      'REJECT_WORK_ASSIGNMENT',
      'Staff Work & Earnings',
      `Rejected work ${work.workCode} for ${work.assignedStaffNames.join(', ')}. Reason: ${mandatoryReason}`
    );
  },

  // ==========================================
  // --- WALLET WITHDRAWAL MANAGEMENT ---
  // ==========================================
  getWithdrawalRequests(staffId?: string): StaffWithdrawalRequest[] {
    const list = getStoredItem<StaffWithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, INITIAL_WITHDRAWALS);
    if (!staffId) return list;
    return list.filter(w => w.staffId === staffId || w.employeeId === staffId);
  },

  requestWithdrawal(
    staff: StaffProfile,
    amount: number,
    payoutAccount: StaffBankAccountDetails,
    remarks?: string
  ): { success: boolean; request?: StaffWithdrawalRequest; error?: string } {
    if (amount < 100) {
      return { success: false, error: 'Minimum withdrawal amount is ₹100.' };
    }

    const wallet = this.getStaffWallet(staff.id);
    if (wallet.availableBalance < amount) {
      return {
        success: false,
        error: `Insufficient available wallet balance. Requested ₹${amount}, but your available balance is ₹${wallet.availableBalance}.`
      };
    }

    // Reserve funds immediately to prevent double spending
    wallet.availableBalance -= amount;
    wallet.updatedAt = new Date().toISOString();

    const allWallets = this.getWallets();
    const wIndex = allWallets.findIndex(w => w.staffId === staff.id || w.employeeId === staff.employeeId);
    if (wIndex !== -1) {
      allWallets[wIndex] = wallet;
      setStoredItem(STORAGE_KEYS.WALLETS, allWallets);
    }

    const requests = this.getWithdrawalRequests();
    const count = requests.length + 1;
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const withdrawalCode = `WDR-OD-${dateStr}-${String(count).padStart(3, '0')}`;

    const newRequest: StaffWithdrawalRequest = {
      id: `wdr-${Date.now()}`,
      withdrawalCode,
      staffId: staff.id,
      employeeId: staff.employeeId,
      employeeName: staff.fullName,
      departmentName: staff.departmentName || 'Operations',
      requestedAmount: amount,
      payoutAccount,
      isKycVerified: payoutAccount.isKycVerified ?? true,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      adminRemarks: remarks
    };

    requests.unshift(newRequest);
    setStoredItem(STORAGE_KEYS.WITHDRAWALS, requests);

    // Record pending withdrawal transaction
    this.recordWalletTransaction({
      staffId: staff.id,
      employeeId: staff.employeeId,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      workDescription: `Wallet Withdrawal Request (${withdrawalCode}) to ${payoutAccount.bankName || payoutAccount.upiId}`,
      category: 'Withdrawal Request',
      type: 'withdrawal',
      credit: 0,
      debit: amount,
      runningBalance: wallet.availableBalance,
      status: 'pending',
      adminRemarks: remarks || 'Awaiting administrative verification and payout processing'
    });

    this.createNotification({
      staffId: staff.id,
      title: `Withdrawal Requested: ₹${amount}`,
      message: `Your withdrawal request (${withdrawalCode}) of ₹${amount} is under review by Central Admin.`,
      type: 'approval',
      linkTarget: 'wallet'
    });

    this.logAudit(
      staff.id,
      staff.fullName,
      staff.systemRole,
      'REQUEST_WITHDRAWAL',
      'Staff Wallet',
      `Submitted withdrawal request ${withdrawalCode} for ₹${amount}`
    );

    return { success: true, request: newRequest };
  },

  reviewWithdrawalRequest(
    withdrawalId: string,
    decision: 'approve' | 'reject',
    reviewer: StaffProfile,
    notes?: string
  ): { success: boolean; error?: string } {
    const list = this.getWithdrawalRequests();
    const req = list.find(r => r.id === withdrawalId || r.withdrawalCode === withdrawalId);
    if (!req) return { success: false, error: 'Withdrawal request not found.' };

    if (decision === 'approve') {
      req.status = 'approved';
      req.reviewedAt = new Date().toISOString();
      req.reviewedByStaffId = reviewer.id;
      req.reviewedByName = reviewer.fullName;
      if (notes) req.adminRemarks = notes;

      this.createNotification({
        staffId: req.staffId,
        title: `Withdrawal Approved: ₹${req.requestedAmount}`,
        message: `Your withdrawal request ${req.withdrawalCode} has been verified and approved. Payout queue processing underway.`,
        type: 'approval',
        linkTarget: 'wallet'
      });
    } else {
      req.status = 'rejected';
      req.rejectionReason = notes || 'Administrative rejection';
      req.reviewedAt = new Date().toISOString();
      req.reviewedByStaffId = reviewer.id;
      req.reviewedByName = reviewer.fullName;

      // REFUND reserved funds back to employee wallet!
      const wallets = this.getWallets();
      const wallet = wallets.find(w => w.staffId === req.staffId || w.employeeId === req.employeeId);
      if (wallet) {
        wallet.availableBalance += req.requestedAmount;
        wallet.updatedAt = new Date().toISOString();
        setStoredItem(STORAGE_KEYS.WALLETS, wallets);

        // Record reversal transaction
        this.recordWalletTransaction({
          staffId: wallet.staffId,
          employeeId: wallet.employeeId,
          date: new Date().toISOString().replace('T', ' ').slice(0, 19),
          workDescription: `Reversal: Withdrawal ${req.withdrawalCode} Rejected (Refunded to Available Balance)`,
          category: 'Reversal',
          type: 'reversal',
          credit: req.requestedAmount,
          debit: 0,
          runningBalance: wallet.availableBalance,
          status: 'completed',
          adminRemarks: notes || 'Withdrawal rejected - funds restored to wallet balance',
          authorizedBy: reviewer.fullName
        });
      }

      this.createNotification({
        staffId: req.staffId,
        title: `Withdrawal Rejected: ₹${req.requestedAmount}`,
        message: `Your withdrawal request ${req.withdrawalCode} was rejected: ${notes || 'Contact Admin'}. Funds were restored to your wallet.`,
        type: 'rejection',
        linkTarget: 'wallet'
      });
    }

    setStoredItem(STORAGE_KEYS.WITHDRAWALS, list);

    this.logAudit(
      reviewer.id,
      reviewer.fullName,
      reviewer.systemRole,
      decision === 'approve' ? 'APPROVE_WITHDRAWAL' : 'REJECT_WITHDRAWAL',
      'Staff Wallet',
      `${decision === 'approve' ? 'Approved' : 'Rejected'} withdrawal ${req.withdrawalCode} of ₹${req.requestedAmount} for ${req.employeeName}`
    );

    return { success: true };
  },

  processWithdrawalPayout(
    withdrawalId: string,
    payoutMode: 'IMPS' | 'NEFT' | 'UPI' | 'Direct Bank Transfer',
    utrReference: string,
    admin: StaffProfile,
    remarks?: string
  ): { success: boolean; error?: string } {
    if (!utrReference || utrReference.trim().length < 4) {
      return { success: false, error: 'Valid UTR / Payment Reference ID is mandatory.' };
    }

    const list = this.getWithdrawalRequests();
    const req = list.find(r => r.id === withdrawalId || r.withdrawalCode === withdrawalId);
    if (!req) return { success: false, error: 'Withdrawal request not found.' };

    const timestamp = new Date().toISOString();
    req.status = 'completed';
    req.payoutMode = payoutMode;
    req.utrReference = utrReference;
    req.processedAt = timestamp;
    if (remarks) req.adminRemarks = remarks;

    // Update wallet withdrawn amount
    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.staffId === req.staffId || w.employeeId === req.employeeId);
    if (wallet) {
      wallet.totalWithdrawnAmount += req.requestedAmount;
      wallet.updatedAt = timestamp;
      setStoredItem(STORAGE_KEYS.WALLETS, wallets);

      // Update corresponding transaction to completed
      const txns = this.getWalletTransactions();
      const txn = txns.find(t => t.workDescription?.includes(req.withdrawalCode) && t.type === 'withdrawal');
      if (txn) {
        txn.status = 'completed';
        txn.adminRemarks = `Payout via ${payoutMode} (UTR: ${utrReference}). Processed by ${admin.fullName}`;
        txn.authorizedBy = admin.fullName;
        setStoredItem(STORAGE_KEYS.WALLET_TXNS, txns);
      }
    }

    setStoredItem(STORAGE_KEYS.WITHDRAWALS, list);

    this.createNotification({
      staffId: req.staffId,
      title: `Payout Completed: ₹${req.requestedAmount}`,
      message: `Your withdrawal of ₹${req.requestedAmount} has been paid via ${payoutMode}. Reference / UTR: ${utrReference}`,
      type: 'approval',
      linkTarget: 'wallet'
    });

    this.logAudit(
      admin.id,
      admin.fullName,
      admin.systemRole,
      'PROCESS_WITHDRAWAL_PAYOUT',
      'Staff Wallet',
      `Completed payout of ₹${req.requestedAmount} for ${req.employeeName} (${req.withdrawalCode}) via ${payoutMode} (UTR: ${utrReference})`
    );

    return { success: true };
  },

  // 4. MANUAL AUTHORIZED WALLET ADJUSTMENT
  adminManualWalletAdjustment(
    staffId: string,
    type: 'credit' | 'debit',
    amount: number,
    mandatoryReason: string,
    admin: StaffProfile
  ): { success: boolean; error?: string; newBalance?: number } {
    if (amount <= 0) return { success: false, error: 'Adjustment amount must be greater than zero.' };
    if (!mandatoryReason || mandatoryReason.trim().length < 5) {
      return { success: false, error: 'Mandatory justification reason required (minimum 5 characters).' };
    }

    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.staffId === staffId || w.employeeId === staffId);
    if (!wallet) return { success: false, error: 'Staff wallet not found.' };

    if (type === 'debit' && wallet.availableBalance < amount) {
      return {
        success: false,
        error: `Cannot debit ₹${amount}. Available balance is ₹${wallet.availableBalance}. Negative balance prevented.`
      };
    }

    const timestamp = new Date().toISOString();

    if (type === 'credit') {
      wallet.availableBalance += amount;
      wallet.totalEarnings += amount;
      wallet.totalAdminAdjustments += amount;
    } else {
      wallet.availableBalance -= amount;
      wallet.totalAdminAdjustments -= amount;
    }
    wallet.updatedAt = timestamp;

    const txn = this.recordWalletTransaction({
      staffId: wallet.staffId,
      employeeId: wallet.employeeId,
      date: timestamp.replace('T', ' ').slice(0, 19),
      workDescription: `Administrative ${type === 'credit' ? 'Credit' : 'Debit'} Adjustment: ${mandatoryReason}`,
      category: 'Admin Adjustment',
      type: type === 'credit' ? 'adjustment_credit' : 'adjustment_debit',
      credit: type === 'credit' ? amount : 0,
      debit: type === 'debit' ? amount : 0,
      runningBalance: wallet.availableBalance,
      status: 'completed',
      adminRemarks: mandatoryReason,
      authorizedBy: admin.fullName
    });

    setStoredItem(STORAGE_KEYS.WALLETS, wallets);

    this.createNotification({
      staffId: wallet.staffId,
      title: `Wallet Adjustment: ${type === 'credit' ? `+₹${amount}` : `-₹${amount}`}`,
      message: `An administrative ${type} adjustment of ₹${amount} was recorded by ${admin.fullName}. Reason: ${mandatoryReason}`,
      type: 'alert',
      linkTarget: 'wallet'
    });

    this.logAudit(
      admin.id,
      admin.fullName,
      admin.systemRole,
      'MANUAL_WALLET_ADJUSTMENT',
      'Staff Wallet',
      `Manual ${type.toUpperCase()} of ₹${amount} for ${wallet.employeeId} (${wallet.fullName}). Reason: ${mandatoryReason} (Txn: ${txn.transactionId})`
    );

    return { success: true, newBalance: wallet.availableBalance };
  },

  // ==========================================
  // --- IN-APP STAFF NOTIFICATIONS ---
  // ==========================================
  getStaffNotifications(staffId?: string): StaffNotification[] {
    const list = getStoredItem<StaffNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!staffId) return list;
    return list.filter(n => n.staffId === staffId);
  },

  createNotification(data: Omit<StaffNotification, 'id' | 'createdAt' | 'isRead'>): StaffNotification {
    const list = getStoredItem<StaffNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: StaffNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    // Keep max 150 notifications
    if (list.length > 150) list.pop();
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  },

  markNotificationRead(notifId: string): void {
    const list = this.getStaffNotifications();
    const item = list.find(n => n.id === notifId);
    if (item) {
      item.isRead = true;
      setStoredItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsRead(staffId: string): void {
    const list = this.getStaffNotifications();
    list.forEach(n => {
      if (n.staffId === staffId) n.isRead = true;
    });
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  async pullFromSupabase(): Promise<{ success: boolean; pulledCounts: Record<string, number>; error?: string }> {
    try {
      const { getSupabaseClient, isSupabaseConfigured, canonicalTableName, TABLE_METADATA_MASTER } = await import('./supabaseClient');
      const client = getSupabaseClient();
      if (!client || !isSupabaseConfigured()) {
        return { success: false, pulledCounts: {}, error: 'Supabase is not configured yet.' };
      }
      const counts: Record<string, number> = {};
      for (const t of TABLE_METADATA_MASTER) {
        const dbTable = canonicalTableName(t.name);
        const { data, error } = await client.from(dbTable).select('*');
        if (!error && data && data.length > 0) {
          counts[dbTable] = data.length;
          const matchingKey = Object.keys(KEY_TO_TABLE).find(k => KEY_TO_TABLE[k] === dbTable);
          if (matchingKey) {
            localStorage.setItem(matchingKey, JSON.stringify(data));
          }
        }
      }
      return { success: true, pulledCounts: counts };
    } catch (err: any) {
      return { success: false, pulledCounts: {}, error: err.message };
    }
  },

  purgeAndResetRealtime(): void {
    localStorage.removeItem(STORAGE_KEYS.VERSION);
    initializeStorageIfNeeded();
  }
};

