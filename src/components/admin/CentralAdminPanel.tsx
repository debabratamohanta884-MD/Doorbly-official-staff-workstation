/**
 * DOORBLY CENTRAL ADMINISTRATIVE CONTROL PANEL - UNIFIED COMPANY MANAGEMENT SYSTEM
 * Upgraded multi-department governance engine for Super Admin & Authorized Executives.
 * Manages 30 districts of Odisha, 9 departments, employees, service partners, customers,
 * recruitment pipeline, unified approvals, attendance, tasks, finance, communications & audit history.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Users,
  Building,
  Award,
  TrendingUp,
  MapPin,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  FileSpreadsheet,
  AlertTriangle,
  History,
  UserPlus,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  CalendarX,
  PhoneCall,
  Headphones,
  FileText,
  Megaphone,
  Download,
  RefreshCw,
  Eye,
  Search,
  Filter,
  ArrowRight,
  Briefcase,
  Layers,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Shield,
  CalendarCheck,
  CheckSquare,
  Wallet,
  Database
} from 'lucide-react';
import {
  StaffProfile,
  Department,
  JobDesignation,
  TaskValueItem,
  SystemAuditLog,
  DistrictMaster,
  DailyTask,
  TaskSubmission,
  PartnerApplication,
  CustomerLead,
  CorporateProspect,
  BookingRecord,
  ComplaintTicket,
  LeaveRequest,
  JobCandidate,
  FinancialTransaction,
  SystemAnnouncement,
  DepartmentDailyReport,
  CandidateStage,
  LeaveStatus,
  PartnerApplicationStatus,
  BookingStatus
} from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { COMPLETE_DOORBLY_SCHEMA_SQL } from '../../sql/schemaSql';
import { StaffWorkEarningsAdmin } from './StaffWorkEarningsAdmin';
import { AdminWalletControlCentre } from './AdminWalletControlCentre';
import { SqlSupabaseAdminIntegration } from './SqlSupabaseAdminIntegration';
import { DoorblyLogo } from '../common/DoorblyLogo';

interface CentralAdminPanelProps {
  currentUser: StaffProfile;
}

export type AdminSubTab =
  | 'overview'
  | 'work_earnings'
  | 'wallet_control'
  | 'sql_database'
  | 'departments'
  | 'employees'
  | 'partners'
  | 'customers'
  | 'recruitment'
  | 'approvals'
  | 'attendance'
  | 'tasks'
  | 'performance'
  | 'finance'
  | 'districts'
  | 'communication'
  | 'reports'
  | 'configuration'
  | 'audit_logs';

export const CentralAdminPanel: React.FC<CentralAdminPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('overview');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const navScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth'
      });
    }
  };

  // Core Data States
  const [staffList, setStaffList] = useState<StaffProfile[]>(() => StorageEngine.getStaffProfiles());
  const [districts, setDistricts] = useState<DistrictMaster[]>(() => StorageEngine.getDistricts());
  const [departments, setDepartments] = useState<Department[]>(() => StorageEngine.getDepartments());
  const [designations, setDesignations] = useState<JobDesignation[]>(() => StorageEngine.getDesignations());
  const [taskValues, setTaskValues] = useState<TaskValueItem[]>(() => StorageEngine.getTaskValueMaster());
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => StorageEngine.getAuditLogs());
  const [tasks, setTasks] = useState<DailyTask[]>(() => StorageEngine.getDailyTasks());
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(() => StorageEngine.getSubmissions());
  const [partners, setPartners] = useState<PartnerApplication[]>(() => StorageEngine.getPartners());
  const [bookings, setBookings] = useState<BookingRecord[]>(() => StorageEngine.getBookings());
  const [leads, setLeads] = useState<CustomerLead[]>(() => StorageEngine.getLeads());
  const [corpProspects, setCorpProspects] = useState<CorporateProspect[]>(() => StorageEngine.getCorporateProspects());
  const [tickets, setTickets] = useState<ComplaintTicket[]>(() => StorageEngine.getTickets());
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => StorageEngine.getLeaves());
  const [candidates, setCandidates] = useState<JobCandidate[]>(() => StorageEngine.getCandidates());
  const [financialTxns, setFinancialTxns] = useState<FinancialTransaction[]>(() => StorageEngine.getFinancialTransactions());
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => StorageEngine.getAnnouncements());
  const [dailyReports, setDailyReports] = useState<DepartmentDailyReport[]>(() => StorageEngine.getDepartmentDailyReports());

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffProfile | null>(null);

  // Modals
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferStaff, setTransferStaff] = useState<StaffProfile | null>(null);
  const [transferTargetDistrict, setTransferTargetDistrict] = useState('cuttack');
  const [transferReason, setTransferReason] = useState('');

  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isAddFinancialTxnOpen, setIsAddFinancialTxnOpen] = useState(false);
  const [editingTaskValue, setEditingTaskValue] = useState<TaskValueItem | null>(null);
  const [editCreditVal, setEditCreditVal] = useState<number>(0);
  const [editQuota, setEditQuota] = useState<number>(0);
  const [copiedSql, setCopiedSql] = useState(false);

  // Add Employee Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empMobile, setEmpMobile] = useState('+91 ');
  const [empDesignationId, setEmpDesignationId] = useState('tele_caller');
  const [empDistrictId, setEmpDistrictId] = useState('khordha');
  const [empRole, setEmpRole] = useState<StaffProfile['systemRole']>('employee');

  // Add Partner Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerMobile, setPartnerMobile] = useState('+91 ');
  const [partnerDistrictId, setPartnerDistrictId] = useState('khordha');
  const [partnerLocality, setPartnerLocality] = useState('');
  const [partnerServices, setPartnerServices] = useState('AC Repair, Electrical, Plumbing');
  const [partnerExp, setPartnerExp] = useState(2);

  // Create Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStaffId, setTaskStaffId] = useState('');
  const [taskTargetQty, setTaskTargetQty] = useState(10);
  const [taskCredit, setTaskCredit] = useState(50);
  const [taskPriority, setTaskPriority] = useState<DailyTask['priority']>('medium');
  const [taskDeadlineHours, setTaskDeadlineHours] = useState(8);

  // Announcement Form State
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancPriority, setAncPriority] = useState<SystemAnnouncement['priority']>('important');
  const [ancAudience, setAncAudience] = useState<SystemAnnouncement['targetAudience']>('all');

  // Financial Txn Form State
  const [txnAmount, setTxnAmount] = useState(5000);
  const [txnType, setTxnType] = useState<FinancialTransaction['type']>('manual_adjustment');
  const [txnDirection, setTxnDirection] = useState<'credit' | 'debit'>('credit');
  const [txnDesc, setTxnDesc] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const reloadAll = () => {
    setStaffList(StorageEngine.getStaffProfiles());
    setDistricts(StorageEngine.getDistricts());
    setDepartments(StorageEngine.getDepartments());
    setDesignations(StorageEngine.getDesignations());
    setTaskValues(StorageEngine.getTaskValueMaster());
    setAuditLogs(StorageEngine.getAuditLogs());
    setTasks(StorageEngine.getDailyTasks());
    setSubmissions(StorageEngine.getSubmissions());
    setPartners(StorageEngine.getPartners());
    setBookings(StorageEngine.getBookings());
    setLeads(StorageEngine.getLeads());
    setCorpProspects(StorageEngine.getCorporateProspects());
    setTickets(StorageEngine.getTickets());
    setLeaves(StorageEngine.getLeaves());
    setCandidates(StorageEngine.getCandidates());
    setFinancialTxns(StorageEngine.getFinancialTransactions());
    setAnnouncements(StorageEngine.getAnnouncements());
    setDailyReports(StorageEngine.getDepartmentDailyReports());
  };

  // --- ACTIONS ---

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empMobile.trim()) return;

    const count = staffList.length + 1;
    const desig = designations.find((d) => d.id === empDesignationId);
    const dist = districts.find((d) => d.id === empDistrictId);

    StorageEngine.createStaffProfile(
      {
        employeeId: `DBL-OD-${String(count).padStart(3, '0')}`,
        fullName: empName.trim(),
        email: empEmail.trim(),
        mobile: empMobile.trim(),
        departmentId: desig?.departmentId || 'dept_gen_ops',
        departmentName: desig?.title || 'General Operations',
        designationId: empDesignationId,
        designationTitle: desig?.title || 'Executive',
        systemRole: empRole,
        districtId: empDistrictId,
        districtName: dist?.name || 'Khordha',
        joiningDate: new Date().toISOString().slice(0, 10),
        status: 'active',
        permissionLevel:
          empRole === 'super_admin'
            ? 'admin'
            : empRole === 'district_manager'
            ? 'manager'
            : empRole === 'district_coordinator'
            ? 'coordinator'
            : 'staff',
        reportingManagerId: currentUser.id,
        reportingManagerName: currentUser.fullName
      },
      currentUser
    );

    reloadAll();
    setIsAddEmployeeOpen(false);
    setEmpName('');
    setEmpEmail('');
    setEmpMobile('+91 ');
    showToast(`Employee ${empName.trim()} created with workstation access!`);
  };

  const handleToggleStaffStatus = (staff: StaffProfile) => {
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    StorageEngine.updateStaffProfile(staff.id, { status: newStatus }, currentUser);
    reloadAll();
    showToast(`Staff ${staff.fullName} status updated to ${newStatus.toUpperCase()}`);
  };

  const handleSuspendStaff = (staff: StaffProfile) => {
    const newStatus = staff.status === 'suspended' ? 'active' : 'suspended';
    StorageEngine.updateStaffProfile(staff.id, { status: newStatus }, currentUser);
    reloadAll();
    showToast(`Staff ${staff.fullName} ${newStatus === 'suspended' ? 'suspended' : 'restored'}`);
  };

  const handleDeleteStaff = (staff: StaffProfile) => {
    if (confirm(`Permanently remove employee ${staff.fullName} (${staff.employeeId})?`)) {
      StorageEngine.deleteStaffProfile(staff.id, currentUser);
      reloadAll();
      showToast(`Employee ${staff.employeeId} removed.`);
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferStaff || !transferReason.trim()) return;

    StorageEngine.transferEmployeeDistrict(
      transferStaff.id,
      transferTargetDistrict,
      transferReason.trim(),
      currentUser
    );

    reloadAll();
    setIsTransferModalOpen(false);
    setTransferStaff(null);
    setTransferReason('');
    showToast(`District transfer approved and recorded.`);
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerMobile.trim()) return;

    const dist = districts.find((d) => d.id === partnerDistrictId);
    StorageEngine.createPartner(
      {
        partnerName: partnerName.trim(),
        mobile: partnerMobile.trim(),
        districtId: partnerDistrictId,
        districtName: dist?.name || 'Khordha',
        locality: partnerLocality.trim() || 'Central',
        skills: partnerServices.split(',').map((s) => s.trim()),
        serviceCategories: partnerServices.split(',').map((s) => s.trim()),
        experienceYears: partnerExp,
        documentVerified: true,
        applicationStatus: 'approved'
      },
      currentUser
    );

    reloadAll();
    setIsAddPartnerOpen(false);
    setPartnerName('');
    setPartnerMobile('+91 ');
    showToast(`Service Partner ${partnerName.trim()} registered & approved.`);
  };

  const handlePartnerStatusChange = (p: PartnerApplication, status: PartnerApplicationStatus) => {
    StorageEngine.updatePartnerStatus(p.id, status, currentUser);
    reloadAll();
    showToast(`Partner ${p.partnerName} updated to ${status.toUpperCase()}`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskStaffId) return;

    const targetStaff = staffList.find((s) => s.id === taskStaffId);
    if (!targetStaff) return;

    const deadline = new Date(Date.now() + taskDeadlineHours * 3600 * 1000).toISOString();

    StorageEngine.createDailyTask(
      {
        staffId: targetStaff.id,
        employeeId: targetStaff.employeeId,
        employeeName: targetStaff.fullName,
        departmentId: targetStaff.departmentId,
        designationId: targetStaff.designationId,
        districtId: targetStaff.districtId,
        taskTitle: taskTitle.trim(),
        taskDescription: taskDesc.trim(),
        taskValueCredit: taskCredit,
        targetQuantity: taskTargetQty,
        priority: taskPriority,
        assignedDate: new Date().toISOString().slice(0, 10),
        deadline,
        requiredEvidenceType: 'document',
        assignedByStaffId: currentUser.id,
        assignedByName: currentUser.fullName
      },
      currentUser
    );

    reloadAll();
    setIsCreateTaskOpen(false);
    setTaskTitle('');
    setTaskDesc('');
    showToast(`Task assigned to ${targetStaff.fullName}`);
  };

  const handleApproveSubmission = (sub: TaskSubmission) => {
    if (sub.staffId === currentUser.id) {
      alert('Self-approval restricted: Administrative policy prevents approving your own work submission.');
      return;
    }
    StorageEngine.approveSubmission(sub.id, currentUser);
    reloadAll();
    showToast(`Work submission ${sub.id} approved & productivity credits awarded.`);
  };

  const handleRejectSubmission = (sub: TaskSubmission) => {
    const reason = prompt('Please enter administrative rejection reason:');
    if (!reason) return;
    StorageEngine.rejectSubmission(sub.id, currentUser, reason);
    reloadAll();
    showToast(`Work submission ${sub.id} rejected.`);
  };

  const handleLeaveDecision = (leave: LeaveRequest, decision: LeaveStatus) => {
    StorageEngine.updateLeaveStatus(leave.id, decision, currentUser);
    reloadAll();
    showToast(`Leave application for ${leave.employeeName} ${decision.toUpperCase()}.`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancContent.trim()) return;

    StorageEngine.createAnnouncement(
      {
        title: ancTitle.trim(),
        content: ancContent.trim(),
        priority: ancPriority,
        targetAudience: ancAudience,
        publishedByName: `${currentUser.fullName} (${currentUser.designationTitle || 'Admin'})`,
        isActive: true
      },
      currentUser
    );

    reloadAll();
    setIsAnnouncementModalOpen(false);
    setAncTitle('');
    setAncContent('');
    showToast(`Announcement published organisation-wide!`);
  };

  const handleRecordFinancialTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnDesc.trim() || txnAmount <= 0) return;

    StorageEngine.createFinancialTransaction(
      {
        type: txnType,
        direction: txnDirection,
        amount: txnAmount,
        description: txnDesc.trim(),
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        status: 'completed'
      },
      currentUser
    );

    reloadAll();
    setIsAddFinancialTxnOpen(false);
    setTxnDesc('');
    setTxnAmount(5000);
    showToast(`Financial transaction recorded in ledger.`);
  };

  const handleSaveTaskValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskValue) return;

    StorageEngine.updateTaskValueItem(
      editingTaskValue.id,
      { creditValue: editCreditVal, defaultDailyQuota: editQuota },
      currentUser
    );

    reloadAll();
    setEditingTaskValue(null);
    showToast(`Task value rule updated: ₹${editCreditVal} credit.`);
  };

  // --- DATA EXPORT UTILITIES (CSV / JSON) ---
  const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) {
      alert('No records available to export.');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row: any) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${rows.length} rows to ${filename}.csv`);
  };

  // --- METRIC CALCULATIONS ---
  const activeStaffCount = staffList.filter((s) => s.status === 'active').length;
  const activePartnersCount = partners.filter((p) => p.applicationStatus === 'approved' || p.applicationStatus === 'activated').length;
  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending').length;
  const pendingPartnerAppsCount = partners.filter((p) => p.applicationStatus === 'applied' || p.applicationStatus === 'document_collected').length;
  const pendingCandidatesCount = candidates.filter((c) => c.stage !== 'Onboarded' && c.stage !== 'Rejected').length;
  const totalPendingApprovals = pendingSubmissionsCount + pendingLeavesCount + pendingPartnerAppsCount + pendingCandidatesCount;

  const totalBookingRevenue = bookings
    .filter((b) => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.serviceSubtotal, 0);

  const totalCompanyCommission = bookings
    .filter((b) => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.doorblyCommission, 0);

  const totalPartnerPayouts = bookings
    .filter((b) => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.partnerPayout, 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#123C45] text-white px-4 py-3 rounded-lg shadow-xl text-xs flex items-center space-x-2 border border-teal-500 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Administrative Control Header */}
      <div className="bg-[#123C45] text-white rounded-xl p-5 border border-teal-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <DoorblyLogo size="lg" rounded={true} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E] text-white">
                Statewide Directorate
              </span>
              <span className="text-xs text-teal-300">Central Control Panel</span>
              <span className="text-[10px] text-teal-200/80 bg-teal-900/60 px-2 py-0.5 rounded font-mono">
                30 Districts of Odisha
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Central Administrative Control Panel
            </h1>
            <p className="text-xs text-teal-100/80 mt-0.5">
              Unified governance across all 9 departments, employees, service partners, booking revenue, and audit trails.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono bg-black/20 text-teal-200 px-3 py-1.5 rounded-lg border border-teal-700/50">
            Admin: {currentUser.fullName} ({currentUser.employeeId})
          </span>
          <button
            onClick={reloadAll}
            className="p-1.5 bg-[#0F766E] hover:bg-teal-600 rounded-lg text-white text-xs transition"
            title="Refresh All Records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 16-Module Navigation Menu with Horizontal Scroll Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-xs flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => scrollNav('left')}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition shrink-0 hidden sm:flex items-center justify-center border border-gray-200 shadow-xs cursor-pointer"
          title="Scroll Left"
          aria-label="Scroll navigation left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={navScrollRef}
          className="flex-1 flex items-center space-x-1.5 overflow-x-auto horizontal-scroll-container pb-1 text-xs"
        >
          {[
            { id: 'overview', label: 'Executive Overview', icon: Layers },
            { id: 'sql_database', label: 'SQL & Supabase Hub', count: 23, icon: Database, badgeColor: 'bg-[#0F766E]' },
            { id: 'work_earnings', label: 'Work & Earnings', icon: Briefcase },
            { id: 'wallet_control', label: 'Wallet Control', count: staffList.length, icon: Wallet },
            { id: 'departments', label: 'Department Control', count: departments.length, icon: Building },
            { id: 'employees', label: 'Employees', count: staffList.length, icon: Users },
            { id: 'partners', label: 'Service Partners', count: partners.length, icon: UserPlus },
            { id: 'customers', label: 'Bookings & CRM', count: bookings.length + leads.length, icon: CalendarCheck },
            { id: 'recruitment', label: 'Recruitment', count: candidates.length, icon: Briefcase },
            { id: 'approvals', label: 'Approval Centre', count: totalPendingApprovals, icon: CheckCircle2, badgeColor: 'bg-amber-500' },
            { id: 'attendance', label: 'Attendance & Leaves', count: leaves.filter(l => l.status === 'pending').length, icon: Clock },
            { id: 'tasks', label: 'Task Distribution', count: tasks.length, icon: CheckSquare },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'finance', label: 'Finance & Accounts', icon: DollarSign },
            { id: 'districts', label: '30 Districts', count: districts.length, icon: MapPin },
            { id: 'communication', label: 'Communications', count: announcements.length, icon: Megaphone },
            { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
            { id: 'configuration', label: 'System Config', icon: Sliders },
            { id: 'audit_logs', label: 'Audit History', count: auditLogs.length, icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminSubTab);
                  setSelectedDeptId(null);
                  setSelectedStaffDetail(null);
                }}
                className={`px-3 py-2 rounded-lg font-semibold transition shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.badgeColor
                        ? `${tab.badgeColor} text-white`
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollNav('right')}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition shrink-0 hidden sm:flex items-center justify-center border border-gray-200 shadow-xs cursor-pointer"
          title="Scroll Right"
          aria-label="Scroll navigation right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* =========================================================================
          MODULE 1: EXECUTIVE OVERVIEW (ORGANISATION-WIDE DASHBOARD)
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setActiveTab('employees')}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-left hover:border-teal-500 transition group"
            >
              <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>Active Staff</span>
                <Users className="w-4 h-4 text-teal-600" />
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">{activeStaffCount}</p>
              <p className="text-[10px] text-gray-400 mt-1">{staffList.length} total registered</p>
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-left hover:border-teal-500 transition group"
            >
              <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>Active Partners</span>
                <UserPlus className="w-4 h-4 text-emerald-600" />
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-2">{activePartnersCount}</p>
              <p className="text-[10px] text-gray-400 mt-1">{partners.length} applications</p>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-left hover:border-teal-500 transition group"
            >
              <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>Pending Approvals</span>
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
              </span>
              <p className="text-2xl font-bold text-amber-600 mt-2">{totalPendingApprovals}</p>
              <p className="text-[10px] text-gray-400 mt-1">Submissions, leaves, KYC</p>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-left hover:border-teal-500 transition group"
            >
              <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>Completed Jobs</span>
                <CalendarCheck className="w-4 h-4 text-blue-600" />
              </span>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {bookings.filter((b) => b.bookingStatus === 'completed').length}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">{bookings.length} total bookings</p>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-left hover:border-teal-500 transition group"
            >
              <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>Revenue Attained</span>
                <DollarSign className="w-4 h-4 text-teal-700" />
              </span>
              <p className="text-xl font-bold text-gray-900 mt-2">₹{totalBookingRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-gray-400 mt-1">20% commission: ₹{totalCompanyCommission.toLocaleString('en-IN')}</p>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-left hover:border-teal-500 transition group"
            >
              <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
                <span>Departments</span>
                <Building className="w-4 h-4 text-purple-600" />
              </span>
              <p className="text-2xl font-bold text-purple-700 mt-2">{departments.length}</p>
              <p className="text-[10px] text-gray-400 mt-1">Statewide divisions</p>
            </button>
          </div>

          {/* Quick Action Bar - Three Horizontal Lines */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Quick Operations</span>
              <span className="text-[11px] text-gray-400 font-medium">Statewide Administrative Actions</span>
            </div>

            <div className="space-y-2.5">
              {/* Line 1 - Personnel & Tasks */}
              <div className="flex items-center gap-3 overflow-x-auto horizontal-scroll-container pb-1">
                <button
                  onClick={() => {
                    setEmpName('');
                    setEmpEmail('');
                    setEmpMobile('+91 ');
                    setIsAddEmployeeOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-2 cursor-pointer min-w-[170px] shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>Add Employee</span>
                </button>
                <button
                  onClick={() => {
                    if (staffList.length > 0) setTaskStaffId(staffList[0].id);
                    setIsCreateTaskOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-2 cursor-pointer min-w-[170px] shrink-0"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-white" />
                  <span>Assign Task</span>
                </button>
              </div>

              {/* Line 2 - Network & Communication */}
              <div className="flex items-center gap-3 overflow-x-auto horizontal-scroll-container pb-1">
                <button
                  onClick={() => setIsAddPartnerOpen(true)}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-2 cursor-pointer min-w-[170px] shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span>Register Partner</span>
                </button>
                <button
                  onClick={() => setIsAnnouncementModalOpen(true)}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-2 cursor-pointer min-w-[170px] shrink-0"
                >
                  <Megaphone className="w-3.5 h-3.5 text-white" />
                  <span>Broadcast Alert</span>
                </button>
              </div>

              {/* Line 3 - Governance & Data */}
              <div className="flex items-center gap-3 overflow-x-auto horizontal-scroll-container pb-1">
                <button
                  onClick={() => exportToCsv('doorbly_organisation_snapshot', staffList)}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-2 cursor-pointer min-w-[170px] shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Export Org Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Department Performance Matrix & Recent Audit Trail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Department Summary Matrix */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <Building className="w-4 h-4 text-[#0F766E]" />
                  <span>Departmental Operational Health</span>
                </h3>
                <button
                  onClick={() => setActiveTab('departments')}
                  className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center space-x-1"
                >
                  <span>Manage All ({departments.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-gray-100 text-xs max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {departments.map((dept) => {
                  const deptStaff = staffList.filter((s) => s.departmentId === dept.id);
                  const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
                  const completedTasks = deptTasks.filter((t) => t.status === 'approved').length;
                  return (
                    <div key={dept.id} className="py-2.5 flex items-center justify-between hover:bg-gray-50/60 rounded px-2 transition">
                      <div>
                        <p className="font-bold text-gray-900">{dept.name}</p>
                        <p className="text-[10px] text-gray-500">
                          Code: {dept.code} • {deptStaff.length} active staff • {deptTasks.length} tasks assigned
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                          {deptTasks.length > 0 ? `${Math.round((completedTasks / deptTasks.length) * 100)}% Tasks Done` : 'Ready'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedDeptId(dept.id);
                            setActiveTab('departments');
                          }}
                          className="text-xs text-[#0F766E] font-semibold hover:underline"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Administrative Audit Trail */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <History className="w-4 h-4 text-[#0F766E]" />
                  <span>Recent Administrative Actions</span>
                </h3>
                <button
                  onClick={() => setActiveTab('audit_logs')}
                  className="text-xs text-[#0F766E] font-semibold hover:underline"
                >
                  View All ({auditLogs.length})
                </button>
              </div>

              <div className="divide-y divide-gray-100 text-xs max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {auditLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-tight">{log.details}</p>
                    <p className="text-[10px] text-gray-400">By: {log.actorName} ({log.actorRole})</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 2: DEPARTMENT CONTROL CENTRE
         ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Department Control Centre</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Inspect live operational queues, rosters, targets, and employee distributions across all 9 Doorbly divisions.
              </p>
            </div>
            {selectedDeptId && (
              <button
                onClick={() => setSelectedDeptId(null)}
                className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold transition"
              >
                ← Back to All Departments
              </button>
            )}
          </div>

          {/* Department Detail View or Grid */}
          {selectedDeptId ? (
            (() => {
              const dept = departments.find((d) => d.id === selectedDeptId);
              if (!dept) return null;
              const deptStaff = staffList.filter((s) => s.departmentId === dept.id);
              const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
              const completedTasks = deptTasks.filter((t) => t.status === 'approved');
              const pendingTasks = deptTasks.filter((t) => t.status === 'assigned' || t.status === 'in_progress');

              return (
                <div className="space-y-5">
                  <div className="bg-[#123C45] text-white p-5 rounded-xl border border-teal-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono bg-[#0F766E] px-2 py-0.5 rounded text-white font-bold">
                        {dept.code}
                      </span>
                      <h3 className="text-xl font-bold mt-1 text-white">{dept.name}</h3>
                      <p className="text-xs text-teal-200/90 mt-0.5">{dept.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-teal-300">Staff Count</span>
                      <p className="text-2xl font-bold text-white">{deptStaff.length} Employees</p>
                    </div>
                  </div>

                  {/* Department KPI Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <span className="text-xs font-medium text-gray-500">Active Roster</span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{deptStaff.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <span className="text-xs font-medium text-gray-500">Daily Tasks</span>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{deptTasks.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <span className="text-xs font-medium text-gray-500">Completed Work</span>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">{completedTasks.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <span className="text-xs font-medium text-gray-500">Pending Review</span>
                      <p className="text-2xl font-bold text-amber-600 mt-1">{pendingTasks.length}</p>
                    </div>
                  </div>

                  {/* Department Staff List */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Assigned Personnel in {dept.name}
                    </h4>
                    <div className="divide-y divide-gray-100 text-xs max-h-80 overflow-y-auto custom-scrollbar pr-1">
                      {deptStaff.length === 0 ? (
                        <p className="py-4 text-center text-gray-400">No employees assigned to this department yet.</p>
                      ) : (
                        deptStaff.map((staff) => (
                          <div key={staff.id} className="py-2.5 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900">{staff.fullName}</p>
                              <p className="text-[10px] text-gray-500">
                                {staff.employeeId} • {staff.designationTitle} • {staff.districtName}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {staff.systemRole}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const deptStaff = staffList.filter((s) => s.departmentId === dept.id);
                const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
                return (
                  <div
                    key={dept.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-teal-500 transition space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {dept.code}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 mt-2">{dept.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dept.description}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{deptStaff.length}</span>{' '}
                        <span className="text-gray-400">staff</span>
                        <span className="mx-1 text-gray-300">•</span>
                        <span className="font-bold text-gray-900">{deptTasks.length}</span>{' '}
                        <span className="text-gray-400">tasks</span>
                      </div>
                      <button
                        onClick={() => setSelectedDeptId(dept.id)}
                        className="px-2.5 py-1 text-xs text-[#0F766E] bg-teal-50 hover:bg-teal-100 font-semibold rounded transition"
                      >
                        Inspect →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODULE 3: COMPLETE EMPLOYEE MANAGEMENT
         ========================================================================= */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Complete Employee Management</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Employee lifecycle, credentials, district assignments, reporting managers, probation & suspension control.
              </p>
            </div>
            <button
              onClick={() => {
                setEmpName('');
                setEmpEmail('');
                setEmpMobile('+91 ');
                setIsAddEmployeeOpen(true);
              }}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          </div>

          {/* Employee Directory Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[580px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Employee Details</th>
                    <th className="px-4 py-3">Department & Designation</th>
                    <th className="px-4 py-3">District Location</th>
                    <th className="px-4 py-3">System Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{staff.fullName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{staff.employeeId} • {staff.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{staff.designationTitle}</p>
                        <p className="text-[10px] text-gray-500">{staff.departmentName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center space-x-1 text-gray-700">
                          <MapPin className="w-3 h-3 text-teal-600" />
                          <span>{staff.districtName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {staff.systemRole}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            staff.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : staff.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setTransferStaff(staff);
                              setTransferTargetDistrict(staff.districtId === 'khordha' ? 'cuttack' : 'khordha');
                              setIsTransferModalOpen(true);
                            }}
                            title="Transfer District"
                            className="px-2 py-1 text-[11px] text-[#0F766E] bg-teal-50 hover:bg-teal-100 rounded font-semibold transition border border-teal-200"
                          >
                            Transfer
                          </button>
                          <button
                            onClick={() => handleToggleStaffStatus(staff)}
                            title="Toggle Active/Inactive"
                            className="p-1 text-gray-500 hover:text-gray-900 transition"
                          >
                            {staff.status === 'active' ? (
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <UserX className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleSuspendStaff(staff)}
                            title="Suspend/Restore"
                            className="p-1 text-gray-500 hover:text-rose-600 transition"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          {staff.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteStaff(staff)}
                              title="Delete Record"
                              className="p-1 text-gray-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 4: COMPLETE SERVICE PARTNER MANAGEMENT
         ========================================================================= */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Complete Service Partner Management</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Vetting, KYC verification, service category allocation, subscriptions, payouts, and activation across Odisha.
              </p>
            </div>
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Partner</span>
            </button>
          </div>

          {/* Partner Directory Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[580px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Partner Name & Code</th>
                    <th className="px-4 py-3">District & Locality</th>
                    <th className="px-4 py-3">Service Skills</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">KYC Status</th>
                    <th className="px-4 py-3">Application Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partners.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No service partners currently registered. Click "Register Partner" above.
                      </td>
                    </tr>
                  ) : (
                    partners.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{p.partnerName}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{p.partnerCode} • {p.mobile}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{p.districtName}</p>
                          <p className="text-[10px] text-gray-400">{p.locality}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700 truncate max-w-xs">{p.skills?.join(', ') || 'General'}</p>
                        </td>
                        <td className="px-4 py-3">{p.experienceYears} Years</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              p.documentVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {p.documentVerified ? 'KYC Verified' : 'KYC Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                            {p.applicationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {p.applicationStatus !== 'activated' && (
                              <button
                                onClick={() => handlePartnerStatusChange(p, 'activated')}
                                className="px-2 py-1 text-[11px] text-white bg-[#0F766E] hover:bg-[#123C45] rounded font-semibold transition shadow-xs"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                StorageEngine.deletePartner(p.id, currentUser);
                                reloadAll();
                                showToast(`Partner ${p.partnerName} removed.`);
                              }}
                              className="p-1 text-gray-400 hover:text-rose-600 transition"
                              title="Delete Partner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 5: CUSTOMER & BUSINESS OPERATIONS
         ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customer & Booking Operations</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitoring customer bookings, 20% commission rates, corporate B2B prospects & support tickets.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                Bookings: {bookings.length} • Leads: {leads.length} • B2B: {corpProspects.length}
              </span>
            </div>
          </div>

          {/* Live Bookings Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Recent Service Bookings & Financial Settlement
            </h3>
            <div className="overflow-x-auto horizontal-scroll-container max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Booking Code</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Subtotal</th>
                    <th className="px-4 py-3">Commission (20%)</th>
                    <th className="px-4 py-3">Partner Payout (80%)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                        No active service bookings in pipeline.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">{b.bookingCode}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-800">{b.customerName}</p>
                          <p className="text-[10px] text-gray-500">{b.customerMobile}</p>
                        </td>
                        <td className="px-4 py-3">{b.districtName}</td>
                        <td className="px-4 py-3 font-medium text-gray-700">{b.serviceTitle}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{b.serviceSubtotal}</td>
                        <td className="px-4 py-3 font-bold text-[#16865D]">₹{b.doorblyCommission}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">₹{b.partnerPayout}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 6: RECRUITMENT & JOINING PIPELINE
         ========================================================================= */}
      {activeTab === 'recruitment' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recruitment & Joining Pipeline</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review applicant screening scorecards, verify KYC documents, and 1-click convert approved candidates into active staff.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[550px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3 text-center">Scorecard</th>
                    <th className="px-4 py-3 text-center">Docs Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No candidates currently in recruitment pipeline.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{c.fullName}</p>
                          <p className="text-[10px] text-gray-500">{c.mobile} • {c.email}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{c.appliedDesignationTitle}</td>
                        <td className="px-4 py-3">{c.districtName}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                            {c.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-[#16865D]">{c.screeningScore}%</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              c.documentsVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {c.documentsVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.stage !== 'Onboarded' && c.stage !== 'Rejected' && (
                            <button
                              onClick={() => {
                                const res = StorageEngine.onboardCandidateToStaff(c.id, currentUser);
                                if (res.success && res.staff) {
                                  reloadAll();
                                  showToast(`Candidate ${c.fullName} officially onboarded as ${res.staff.employeeId}!`);
                                }
                              }}
                              className="px-2.5 py-1 text-xs text-white bg-[#0F766E] hover:bg-[#123C45] rounded font-semibold transition shadow-xs"
                            >
                              Onboard as Staff
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 7: CENTRAL APPROVAL MANAGEMENT
         ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Unified Central Approval Centre</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Centralized queue for work proof verification, leave authorizations, partner activations & joining approvals.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                Pending Actions: {totalPendingApprovals}
              </span>
            </div>
          </div>

          {/* Pending Work Proof Submissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center justify-between">
              <span>Task Work Proof Submissions ({pendingSubmissionsCount})</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold">Productivity Ledger</span>
            </h3>
            <div className="divide-y divide-gray-100 text-xs max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {submissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length === 0 ? (
                <p className="py-4 text-center text-gray-400">All submitted daily tasks have been reviewed.</p>
              ) : (
                submissions
                  .filter((s) => s.status === 'under_review' || s.status === 'submitted')
                  .map((sub) => (
                    <div key={sub.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{sub.employeeName}</p>
                        <p className="text-[11px] text-gray-700 mt-0.5">{sub.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Task ID: {sub.taskId} • Quantity: {sub.completedQuantity} • Submitted: {new Date(sub.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleApproveSubmission(sub)}
                          className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded text-xs transition shadow-xs"
                        >
                          Approve & Credit
                        </button>
                        <button
                          onClick={() => handleRejectSubmission(sub)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-xs transition border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center justify-between">
              <span>Employee Leave Authorizations ({pendingLeavesCount})</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold">HR Leave Matrix</span>
            </h3>
            <div className="divide-y divide-gray-100 text-xs max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {leaves.filter((l) => l.status === 'pending').length === 0 ? (
                <p className="py-4 text-center text-gray-400">No pending leave requests.</p>
              ) : (
                leaves
                  .filter((l) => l.status === 'pending')
                  .map((leave) => (
                    <div key={leave.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{leave.employeeName} ({leave.employeeId})</p>
                        <p className="text-[11px] text-gray-700 mt-0.5">
                          {leave.leaveType.toUpperCase()} Leave: {leave.startDate} to {leave.endDate} ({leave.totalDays} days)
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Reason: "{leave.reason}"</p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleLeaveDecision(leave, 'approved')}
                          className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded text-xs transition"
                        >
                          Grant Leave
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(leave, 'rejected')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-xs transition border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 8: ATTENDANCE & LEAVE MANAGEMENT
         ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Organisation Attendance & Leave Tracking</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time punch-in/out records, location notes, working hours, and approved leaves across 30 Odisha districts.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportToCsv('doorbly_attendance_ledger', StorageEngine.getAttendance())}
                className="px-3 py-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold rounded border border-teal-200 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Attendance</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[550px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Login Time (IST)</th>
                    <th className="px-4 py-3">Logout Time (IST)</th>
                    <th className="px-4 py-3">Break Duration</th>
                    <th className="px-4 py-3">Location Verified</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {StorageEngine.getAttendance().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No attendance records logged for today yet.
                      </td>
                    </tr>
                  ) : (
                    StorageEngine.getAttendance().map((att) => {
                      const staff = staffList.find((s) => s.id === att.staffId || s.employeeId === att.employeeId);
                      return (
                        <tr key={att.id} className="hover:bg-gray-50/70 transition">
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {staff?.fullName || att.employeeId} ({att.employeeId})
                          </td>
                          <td className="px-4 py-3 text-gray-600">{att.date}</td>
                          <td className="px-4 py-3 font-mono font-medium text-emerald-700">{att.loginTime || '—'}</td>
                          <td className="px-4 py-3 font-mono text-gray-500">{att.logoutTime || 'In Session'}</td>
                          <td className="px-4 py-3">{att.breakMinutes} mins</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {att.locationNote || 'Verified'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 9: TASK ASSIGNMENT & WORK DISTRIBUTION
         ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Task Assignment & Work Distribution</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Allocate calling batches, lead validations, and field checks to individual staff or teams with productivity credit values.
              </p>
            </div>
            <button
              onClick={() => {
                if (staffList.length > 0) setTaskStaffId(staffList[0].id);
                setIsCreateTaskOpen(true);
              }}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[550px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Task ID & Title</th>
                    <th className="px-4 py-3">Assigned Employee</th>
                    <th className="px-4 py-3">Credit Value</th>
                    <th className="px-4 py-3">Target Qty</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No tasks currently assigned. Click "Assign New Task" above.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{t.taskTitle}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{t.taskId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{t.employeeName}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{t.employeeId}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#16865D]">₹{t.taskValueCredit}</td>
                        <td className="px-4 py-3">{t.targetQuantity} units</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(t.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              StorageEngine.deleteDailyTask(t.id, currentUser);
                              reloadAll();
                              showToast(`Task ${t.taskId} deleted.`);
                            }}
                            className="p-1 text-gray-400 hover:text-rose-600 transition"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 10: PERFORMANCE & TARGET MONITORING
         ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Performance & Target Management</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time productivity scoring, target vs achievement ratios, and verified credits ledger across Odisha.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Employee Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center justify-between pb-2 border-b border-gray-100">
                <span>Employee Productivity Ranking</span>
                <Award className="w-4 h-4 text-amber-500" />
              </h3>
              <div className="divide-y divide-gray-100 text-xs max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {staffList.map((staff, i) => {
                  const staffCredits = StorageEngine.getWorkCredits(staff.id);
                  const totalCredits = staffCredits.reduce((sum, c) => sum + c.totalCredits, 0);
                  return (
                    <div key={staff.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-gray-400 w-4 text-center">#{i + 1}</span>
                        <div>
                          <p className="font-bold text-gray-900">{staff.fullName}</p>
                          <p className="text-[10px] text-gray-500">{staff.designationTitle} • {staff.districtName}</p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#16865D] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        ₹{totalCredits} Credits
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* District Targets Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center justify-between pb-2 border-b border-gray-100">
                <span>Statewide ₹1,00,000 Target Allocation</span>
                <TrendingUp className="w-4 h-4 text-[#0F766E]" />
              </h3>
              <div className="divide-y divide-gray-100 text-xs max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {districts.slice(0, 10).map((d) => (
                  <div key={d.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{d.name}</p>
                      <p className="text-[10px] text-gray-400">Target: ₹{d.dailyTarget.toLocaleString('en-IN')} / day</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{d.actualCompletedSubtotal.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-teal-600 font-semibold">
                        {d.dailyTarget > 0 ? `${Math.round((d.actualCompletedSubtotal / d.dailyTarget) * 100)}% Met` : '0%'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 11: FINANCE & ACCOUNTS CONTROL
         ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Finance & Accounts Control</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Financial audit ledger, 20% Doorbly markups, 80% partner payouts, 18% GST tax reconciliations.
              </p>
            </div>
            <button
              onClick={() => setIsAddFinancialTxnOpen(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Financial Entry</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Service Gross Subtotal</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalBookingRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Doorbly Commission (20%)</span>
              <p className="text-2xl font-bold text-[#16865D] mt-1">₹{totalCompanyCommission.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Partner Payouts (80%)</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{totalPartnerPayouts.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Financial Entries</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">{financialTxns.length}</p>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[550px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Reference ID</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Direction</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Recorded By</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financialTxns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                        No manual financial adjustment records yet.
                      </td>
                    </tr>
                  ) : (
                    financialTxns.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">{txn.referenceId}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{txn.description}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-gray-600">{txn.type}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              txn.direction === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {txn.direction}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{txn.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-gray-500">{txn.actorName}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 12: DISTRICT & LOCATION MANAGEMENT
         ========================================================================= */}
      {activeTab === 'districts' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Odisha 30 Districts Management</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Target allocations, District Manager (DM) assignments, and active field executive transfers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[550px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3">Daily Target</th>
                    <th className="px-4 py-3">Completed Revenue</th>
                    <th className="px-4 py-3">District Manager</th>
                    <th className="px-4 py-3">District Coordinator</th>
                    <th className="px-4 py-3">Assigned Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {districts.map((d) => {
                    const distStaff = staffList.filter((s) => s.districtId === d.id);
                    return (
                      <tr key={d.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 font-bold text-gray-900">{d.name}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            Tier {d.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{d.dailyTarget.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-bold text-[#16865D]">₹{d.actualCompletedSubtotal.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-gray-700">{d.managerName || 'Unassigned'}</td>
                        <td className="px-4 py-3 text-gray-700">{d.coordinatorName || 'Unassigned'}</td>
                        <td className="px-4 py-3 font-semibold text-teal-700">{distStaff.length} Employees</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 13: INTERNAL COMMUNICATION CENTRE
         ========================================================================= */}
      {activeTab === 'communication' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Internal Communication Centre</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Broadcast organisation-wide notices, emergency bulletins, and department instructions directly to employee dashboards.
              </p>
            </div>
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
            >
              <Megaphone className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-400">
                <Megaphone className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-600">No active notices published.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Click "Publish Notice" above to broadcast to all remote employees.</p>
              </div>
            ) : (
              announcements.map((anc) => (
                <div key={anc.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{anc.title}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        anc.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : anc.priority === 'important'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {anc.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{anc.content}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                    <span>Published by: {anc.publishedByName}</span>
                    <span>{new Date(anc.publishedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 14: REPORTS & DATA EXPORT
         ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Reports & Analytics Data Export</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate real CSV exports and review daily department operational reports from managers and coordinators.
              </p>
            </div>
          </div>

          {/* Export Buttons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Employees Directory', data: staffList, filename: 'doorbly_employees' },
              { label: 'Attendance Ledger', data: StorageEngine.getAttendance(), filename: 'doorbly_attendance' },
              { label: 'Daily Tasks Log', data: tasks, filename: 'doorbly_tasks' },
              { label: 'Service Partners', data: partners, filename: 'doorbly_partners' },
              { label: 'Bookings & Revenue', data: bookings, filename: 'doorbly_bookings' },
              { label: 'Audit History', data: auditLogs, filename: 'doorbly_audit_logs' }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => exportToCsv(btn.filename, btn.data)}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs text-left hover:border-teal-500 hover:bg-teal-50/30 transition flex flex-col justify-between"
              >
                <FileSpreadsheet className="w-5 h-5 text-[#0F766E] mb-2" />
                <span className="text-xs font-bold text-gray-900">{btn.label}</span>
                <span className="text-[10px] text-teal-600 font-semibold mt-1">Download CSV →</span>
              </button>
            ))}
          </div>

          {/* Department Daily Reports Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Submitted Daily Department Operational Reports ({dailyReports.length})
            </h3>
            <div className="divide-y divide-gray-100 text-xs">
              {dailyReports.length === 0 ? (
                <p className="py-6 text-center text-gray-400">No daily reports generated for today yet.</p>
              ) : (
                dailyReports.map((r) => (
                  <div key={r.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{r.employeeName} ({r.departmentName})</p>
                      <span className="text-[10px] text-gray-400 font-mono">{r.reportDate}</span>
                    </div>
                    <p className="text-[11px] text-gray-600">District: {r.districtName} • Tasks: {r.completedTasks}/{r.assignedTasks} completed • Credits: ₹{r.productivityCredits}</p>
                    <p className="text-[11px] text-gray-500 italic">Plan: "{r.nextDayPlan}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 15: SYSTEM CONFIGURATION & RBAC
         ========================================================================= */}
      {activeTab === 'configuration' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">System Configuration & Security</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Task Value Master credit rates, role-based access control, and PostgreSQL database migration definitions.
              </p>
            </div>
          </div>

          {/* Task Value Master (Section 10) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                Section 10: Task Credit Value Master Matrix
              </h3>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold">Internal Productivity Rates</span>
            </div>

            <div className="divide-y divide-gray-100 text-xs max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {taskValues.map((tv) => (
                <div key={tv.id} className="py-2.5 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition">
                  <div>
                    <p className="font-bold text-gray-900">{tv.activityName}</p>
                    <p className="text-[10px] text-gray-500">{tv.designationTitle} • Daily Quota: {tv.defaultDailyQuota} / {tv.quotaUnit}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-[#16865D]">₹{tv.creditValue}</span>
                    <button
                      onClick={() => {
                        setEditingTaskValue(tv);
                        setEditCreditVal(tv.creditValue);
                        setEditQuota(tv.defaultDailyQuota);
                      }}
                      className="p-1 text-[#0F766E] hover:text-[#123C45] transition"
                      title="Edit Credit Rate"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick shortcut to SQL & Supabase Hub */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#0F766E] text-white rounded-lg shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Interactive SQL Console & Supabase Cloud Hub</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Execute live or simulated SQL queries, inspect all 23 database tables, test connection pings, and push local data to Supabase.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('sql_database')}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-bold rounded-lg text-xs transition flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <span>Open SQL & Supabase Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Supabase SQL Migration Exporter */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-[#0F766E]" />
                <span>Production PostgreSQL / Supabase Schema (23 Tables)</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('sql_database')}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-md transition flex items-center space-x-1"
                >
                  <Database className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Full SQL Hub</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(COMPLETE_DOORBLY_SCHEMA_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                    showToast('SQL migration copied to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-md transition flex items-center space-x-1"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy Schema SQL'}</span>
                </button>
              </div>
            </div>
            <pre className="p-3 bg-gray-900 text-teal-300 font-mono text-[11px] rounded-lg max-h-48 overflow-y-auto">
              {COMPLETE_DOORBLY_SCHEMA_SQL.slice(0, 800)}...
            </pre>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE: SQL & SUPABASE INTEGRATION HUB
         ========================================================================= */}
      {activeTab === 'sql_database' && (
        <SqlSupabaseAdminIntegration currentUser={currentUser} />
      )}

      {/* =========================================================================
          MODULE 16: AUDIT HISTORY & ADMINISTRATIVE LOGS
         ========================================================================= */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Permanent System Audit Logs</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Tamper-resistant audit history documenting administrative actions, transfers, role modifications, and approvals.
              </p>
            </div>
            <button
              onClick={() => exportToCsv('doorbly_audit_history', auditLogs)}
              className="px-3 py-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold rounded border border-teal-200 flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit History</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto horizontal-scroll-container max-h-[550px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-3">Timestamp (IST)</th>
                    <th className="px-4 py-3">Actor Details</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Details & Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3 font-mono text-gray-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{log.actorName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{log.actorRole}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">{log.module}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 leading-tight">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE: STAFF WORK & EARNINGS MANAGEMENT
         ========================================================================= */}
      {activeTab === 'work_earnings' && (
        <StaffWorkEarningsAdmin currentUser={currentUser} />
      )}

      {/* =========================================================================
          MODULE: WALLET CONTROL CENTRE
         ========================================================================= */}
      {activeTab === 'wallet_control' && (
        <AdminWalletControlCentre currentUser={currentUser} />
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* MODAL: ADD EMPLOYEE */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <h3 className="font-bold text-sm text-white">Add New Employee</h3>
              <button onClick={() => setIsAddEmployeeOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyabrata Mohanty"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="employee@doorbly.com"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94370 12345"
                    value={empMobile}
                    onChange={(e) => setEmpMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Designation *</label>
                  <select
                    value={empDesignationId}
                    onChange={(e) => setEmpDesignationId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">District *</label>
                  <select
                    value={empDistrictId}
                    onChange={(e) => setEmpDistrictId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">System Role</label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value as StaffProfile['systemRole'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                >
                  <option value="employee">Employee / Remote Executive</option>
                  <option value="district_coordinator">District Coordinator (DC)</option>
                  <option value="district_manager">District Manager (DM)</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Save & Provision Workstation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISTRICT TRANSFER */}
      {isTransferModalOpen && transferStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <h3 className="font-bold text-sm text-white">Transfer District Location</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-3.5">
              <p className="text-gray-600">
                Transferring <span className="font-bold text-gray-900">{transferStaff.fullName}</span> ({transferStaff.employeeId}) from current district <span className="font-bold text-teal-700">{transferStaff.districtName}</span>.
              </p>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Target District *</label>
                <select
                  value={transferTargetDistrict}
                  onChange={(e) => setTransferTargetDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Administrative Transfer Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Operational requirement in Cuttack field coordination..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER SERVICE PARTNER */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <h3 className="font-bold text-sm text-white">Register & Onboard Service Partner</h3>
              <button onClick={() => setIsAddPartnerOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePartner} className="p-5 space-y-3.5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Partner / Agency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QuickFix Electricals"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={partnerMobile}
                    onChange={(e) => setPartnerMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">District *</label>
                  <select
                    value={partnerDistrictId}
                    onChange={(e) => setPartnerDistrictId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Service Categories (comma separated)</label>
                <input
                  type="text"
                  value={partnerServices}
                  onChange={(e) => setPartnerServices(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Approve & Onboard Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TASK */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <h3 className="font-bold text-sm text-white">Assign Daily Task</h3>
              <button onClick={() => setIsCreateTaskOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Assign to Employee *</label>
                <select
                  value={taskStaffId}
                  onChange={(e) => setTaskStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.employeeId} • {s.designationTitle} • {s.districtName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tele-verify 25 Residential AC Maintenance Leads"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Task Description / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Specific requirements, script guidelines, or document reference..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Credit Value (₹)</label>
                  <input
                    type="number"
                    value={taskCredit}
                    onChange={(e) => setTaskCredit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Units</label>
                  <input
                    type="number"
                    value={taskTargetQty}
                    onChange={(e) => setTaskTargetQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as DailyTask['priority'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ANNOUNCEMENT */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <h3 className="font-bold text-sm text-white">Publish Internal Notice</h3>
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="p-5 space-y-3.5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Statewide Target Achievement & Verification Guidelines"
                  value={ancTitle}
                  onChange={(e) => setAncTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Notice Body Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed instructions for remote staff across Odisha..."
                  value={ancContent}
                  onChange={(e) => setAncContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Priority Level</label>
                  <select
                    value={ancPriority}
                    onChange={(e) => setAncPriority(e.target.value as SystemAnnouncement['priority'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent / Emergency Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Audience</label>
                  <select
                    value={ancAudience}
                    onChange={(e) => setAncAudience(e.target.value as SystemAnnouncement['targetAudience'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="all">All 30 Districts (Organisation-wide)</option>
                    <option value="district">Specific District</option>
                    <option value="department">Specific Department</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD FINANCIAL ENTRY */}
      {isAddFinancialTxnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <h3 className="font-bold text-sm text-white">Record Financial Transaction</h3>
              <button onClick={() => setIsAddFinancialTxnOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordFinancialTxn} className="p-5 space-y-3.5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={txnAmount}
                  onChange={(e) => setTxnAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Transaction Direction</label>
                  <select
                    value={txnDirection}
                    onChange={(e) => setTxnDirection(e.target.value as 'credit' | 'debit')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="credit">Credit (+ Inflow)</option>
                    <option value="debit">Debit (- Outflow)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category Type</label>
                  <select
                    value={txnType}
                    onChange={(e) => setTxnType(e.target.value as FinancialTransaction['type'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="manual_adjustment">Manual Adjustment</option>
                    <option value="business_expense">Business Expense</option>
                    <option value="partner_withdrawal">Partner Withdrawal</option>
                    <option value="partner_subscription">Partner Subscription</option>
                    <option value="salary_disbursement">Salary Disbursement</option>
                    <option value="tax_payment">Tax Payment (18% GST)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Description / Narration *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Details of payout, voucher reference, or invoice number..."
                  value={txnDesc}
                  onChange={(e) => setTxnDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddFinancialTxnOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TASK CREDIT VALUE MASTER */}
      {editingTaskValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <h3 className="font-bold text-sm text-white">Edit Task Credit Rule</h3>
              <button onClick={() => setEditingTaskValue(null)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTaskValue} className="p-5 space-y-3.5">
              <p className="font-bold text-gray-900">{editingTaskValue.activityName}</p>
              <p className="text-[11px] text-gray-500">{editingTaskValue.designationTitle}</p>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Credit Value (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editCreditVal}
                  onChange={(e) => setEditCreditVal(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Default Daily Quota *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editQuota}
                  onChange={(e) => setEditQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTaskValue(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
