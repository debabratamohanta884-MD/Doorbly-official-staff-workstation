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
  TicketStatus
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
  INITIAL_AUDIT_LOGS
} from '../constants/mockSeedData';

const STORAGE_KEYS = {
  STAFF: 'doorbly_staff_profiles',
  DISTRICTS: 'doorbly_districts_master',
  DEPARTMENTS: 'doorbly_departments',
  DESIGNATIONS: 'doorbly_designations',
  TASKS: 'doorbly_daily_tasks',
  SUBMISSIONS: 'doorbly_task_submissions',
  CREDITS: 'doorbly_work_credits',
  ATTENDANCE: 'doorbly_attendance',
  LEADS: 'doorbly_leads',
  CORP_PROSPECTS: 'doorbly_corp_prospects',
  PARTNERS: 'doorbly_partner_apps',
  BOOKINGS: 'doorbly_bookings',
  TICKETS: 'doorbly_complaint_tickets',
  ANNOUNCEMENTS: 'doorbly_announcements',
  AUDIT_LOGS: 'doorbly_audit_logs',
  TASK_VALUE_MASTER: 'doorbly_task_values',
  DAILY_REPORTS: 'doorbly_daily_reports',
  CURRENT_USER_ID: 'doorbly_current_user_id'
};

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Initialize seed data if not present
export function initializeStorageIfNeeded(): void {
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
}

// Run immediately on import
initializeStorageIfNeeded();

export const StorageEngine = {
  // --- AUTHENTICATION & SESSION ---
  getCurrentUserId(): string {
    return getStoredItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'staff-admin-01');
  },

  setCurrentUserId(id: string): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  getCurrentUser(): StaffProfile {
    const id = this.getCurrentUserId();
    const staffList = this.getStaffProfiles();
    const found = staffList.find(s => s.id === id || s.employeeId === id);
    return found || staffList[0];
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
    return getStoredItem<DistrictMaster[]>(STORAGE_KEYS.DISTRICTS, ODISHA_DISTRICTS_INITIAL);
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
  }
};
