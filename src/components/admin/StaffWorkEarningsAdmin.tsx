/**
 * DOORBLY CENTRAL ADMIN - STAFF WORK & EARNINGS MANAGEMENT MODULE
 * Allows Super Admin and authorized administrators to:
 * - Create new work assignments with separate Customer Work Value and Staff Earning Amount
 * - Assign work to single or multiple staff members
 * - Edit work titles, descriptions, categories, deadlines, and staff earning amounts
 * - Automatic audited adjustments / reversals if earning amounts are edited post-crediting
 * - Verify and approve completed works with idempotency duplicate credit prevention
 * - Add special approved incentives
 * - Reject work submissions with mandatory discrepancy reasons
 * - Export work history and department reports
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Award,
  Download,
  Calendar,
  Users,
  Building,
  MapPin,
  Check,
  X,
  Eye,
  FileText,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import {
  StaffProfile,
  StaffWorkAssignment,
  StaffWorkStatus,
  Department,
  DistrictMaster
} from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface StaffWorkEarningsAdminProps {
  currentUser: StaffProfile;
}

export const StaffWorkEarningsAdmin: React.FC<StaffWorkEarningsAdminProps> = ({ currentUser }) => {
  // Core data states
  const [works, setWorks] = useState<StaffWorkAssignment[]>(() => StorageEngine.getStaffWorkAssignments());
  const [staffList, setStaffList] = useState<StaffProfile[]>(() => StorageEngine.getStaffProfiles());
  const [departments, setDepartments] = useState<Department[]>(() => StorageEngine.getDepartments());
  const [districts, setDistricts] = useState<DistrictMaster[]>(() => StorageEngine.getDistricts());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  // Selected work for operations
  const [selectedWork, setSelectedWork] = useState<StaffWorkAssignment | null>(null);

  // Create Work Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('General Operations');
  const [newAssignedStaffIds, setNewAssignedStaffIds] = useState<string[]>([]);
  const [newDeptId, setNewDeptId] = useState('dept_gen_ops');
  const [newDistrictId, setNewDistrictId] = useState('khordha');
  const [newAssignedDate, setNewAssignedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newDeadline, setNewDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [newPriority, setNewPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [newCustomerValue, setNewCustomerValue] = useState<number>(5000);
  const [newStaffEarning, setNewStaffEarning] = useState<number>(650);
  const [newAdminRemarks, setNewAdminRemarks] = useState('');

  // Edit Work Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAssignedStaffIds, setEditAssignedStaffIds] = useState<string[]>([]);
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [editCustomerValue, setEditCustomerValue] = useState<number>(0);
  const [editStaffEarning, setEditStaffEarning] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<StaffWorkStatus>('assigned');
  const [editRemarks, setEditRemarks] = useState('');

  // Approval Modal State
  const [extraIncentive, setExtraIncentive] = useState<number>(0);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Rejection Modal State
  const [rejectionReason, setRejectionReason] = useState('');

  const refreshData = () => {
    setWorks(StorageEngine.getStaffWorkAssignments());
    setStaffList(StorageEngine.getStaffProfiles());
    setDepartments(StorageEngine.getDepartments());
    setDistricts(StorageEngine.getDistricts());
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalWorks = works.length;
    const totalCustomerVal = works.reduce((sum, w) => sum + (w.customerWorkValue || 0), 0);
    const totalStaffEarningVal = works.reduce((sum, w) => sum + (w.staffEarningAmount || 0), 0);
    const approvedCount = works.filter(w => w.status === 'approved' || w.isCredited).length;
    const pendingApprovalCount = works.filter(w => w.status === 'completed' && !w.isCredited).length;
    const inProgressCount = works.filter(w => w.status === 'in_progress' || w.status === 'assigned').length;

    return {
      totalWorks,
      totalCustomerVal,
      totalStaffEarningVal,
      approvedCount,
      pendingApprovalCount,
      inProgressCount
    };
  }, [works]);

  // Filtered Works
  const filteredWorks = useMemo(() => {
    return works.filter(w => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = w.title.toLowerCase().includes(q);
        const matchesCode = w.workCode.toLowerCase().includes(q);
        const matchesStaff = w.assignedStaffNames.some(name => name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCode && !matchesStaff) return false;
      }
      if (deptFilter !== 'all' && w.departmentId !== deptFilter) return false;
      if (districtFilter !== 'all' && w.districtId !== districtFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending_approval') {
          if (w.status !== 'completed' || w.isCredited) return false;
        } else if (w.status !== statusFilter) {
          return false;
        }
      }
      return true;
    });
  }, [works, searchQuery, deptFilter, districtFilter, statusFilter]);

  // Handle Create Work
  const handleCreateWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignedStaffIds.length === 0) {
      showToast('Please assign at least one staff member to this work.', 'error');
      return;
    }

    const assignedNames = newAssignedStaffIds.map(id => {
      const s = staffList.find(staff => staff.id === id);
      return s ? `${s.fullName} (${s.employeeId})` : id;
    });

    const dept = departments.find(d => d.id === newDeptId);
    const dist = districts.find(d => d.id === newDistrictId);

    StorageEngine.createWorkAssignment(
      {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        assignedStaffIds: newAssignedStaffIds,
        assignedStaffNames: assignedNames,
        departmentId: newDeptId,
        departmentName: dept?.name || 'General Operations',
        districtId: newDistrictId,
        districtName: dist?.name || 'Khordha (Bhubaneswar HQ)',
        assignedDate: newAssignedDate,
        completionDeadline: newDeadline,
        priority: newPriority,
        customerWorkValue: Number(newCustomerValue),
        staffEarningAmount: Number(newStaffEarning),
        incentiveAmount: 0,
        status: 'assigned',
        adminRemarks: newAdminRemarks
      },
      currentUser
    );

    showToast(`Work created & assigned successfully with staff earning ₹${newStaffEarning}.`, 'success');
    setIsCreateModalOpen(false);
    resetCreateForm();
    refreshData();
  };

  const resetCreateForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewAssignedStaffIds([]);
    setNewCustomerValue(5000);
    setNewStaffEarning(650);
    setNewAdminRemarks('');
  };

  // Open Edit Modal
  const openEditModal = (work: StaffWorkAssignment) => {
    setSelectedWork(work);
    setEditTitle(work.title);
    setEditDescription(work.description);
    setEditCategory(work.category);
    setEditAssignedStaffIds(work.assignedStaffIds || []);
    setEditDeadline(work.completionDeadline);
    setEditPriority(work.priority);
    setEditCustomerValue(work.customerWorkValue);
    setEditStaffEarning(work.staffEarningAmount);
    setEditStatus(work.status);
    setEditRemarks(work.adminRemarks || '');
    setIsEditModalOpen(true);
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWork) return;

    const assignedNames = editAssignedStaffIds.map(id => {
      const s = staffList.find(staff => staff.id === id);
      return s ? `${s.fullName} (${s.employeeId})` : id;
    });

    StorageEngine.updateWorkAssignment(
      selectedWork.id,
      {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        assignedStaffIds: editAssignedStaffIds,
        assignedStaffNames: assignedNames,
        completionDeadline: editDeadline,
        priority: editPriority,
        customerWorkValue: Number(editCustomerValue),
        staffEarningAmount: Number(editStaffEarning),
        status: editStatus,
        adminRemarks: editRemarks
      },
      currentUser
    );

    showToast(`Work ${selectedWork.workCode} updated. Audited transactions adjusted if applicable.`, 'success');
    setIsEditModalOpen(false);
    setSelectedWork(null);
    refreshData();
  };

  // Open Approval Modal
  const openApproveModal = (work: StaffWorkAssignment) => {
    setSelectedWork(work);
    setExtraIncentive(0);
    setApprovalRemarks('');
    setIsApproveModalOpen(true);
  };

  // Confirm Approval & Wallet Credit
  const handleConfirmApproval = () => {
    if (!selectedWork || isSubmittingApproval) return;
    setIsSubmittingApproval(true);

    const res = StorageEngine.approveWorkAndCreditWallet(
      selectedWork.id,
      currentUser,
      Number(extraIncentive),
      approvalRemarks || 'Work verified and approved by Central Administration'
    );

    setIsSubmittingApproval(false);

    if (res.success) {
      showToast(`Work ${selectedWork.workCode} approved! ₹${res.creditedAmount} credited to employee wallet.`, 'success');
      setIsApproveModalOpen(false);
      setSelectedWork(null);
      refreshData();
    } else {
      showToast(res.error || 'Failed to approve work.', 'error');
    }
  };

  // Open Rejection Modal
  const openRejectModal = (work: StaffWorkAssignment) => {
    setSelectedWork(work);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  // Confirm Rejection
  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWork) return;

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      showToast('Mandatory rejection reason required (min 5 chars).', 'error');
      return;
    }

    StorageEngine.rejectWorkAssignment(selectedWork.id, currentUser, rejectionReason);
    showToast(`Work ${selectedWork.workCode} marked as rejected with discrepancy reason.`, 'info');
    setIsRejectModalOpen(false);
    setSelectedWork(null);
    refreshData();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Work Code',
      'Title',
      'Category',
      'Assigned Staff',
      'Department',
      'District',
      'Customer Work Value (INR)',
      'Staff Earning Amount (INR)',
      'Incentive (INR)',
      'Deadline',
      'Priority',
      'Status',
      'Is Credited',
      'Credited Transaction ID'
    ];

    const rows = filteredWorks.map(w => [
      `"${w.workCode}"`,
      `"${w.title.replace(/"/g, '""')}"`,
      `"${w.category}"`,
      `"${w.assignedStaffNames.join('; ')}"`,
      `"${w.departmentName}"`,
      `"${w.districtName}"`,
      w.customerWorkValue,
      w.staffEarningAmount,
      w.incentiveAmount || 0,
      `"${w.completionDeadline}"`,
      `"${w.priority}"`,
      `"${w.status}"`,
      w.isCredited ? 'YES' : 'NO',
      `"${w.creditedTransactionId || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Doorbly_Work_Assignments_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 p-3.5 rounded-lg shadow-lg text-xs font-medium flex items-center space-x-2 transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMsg.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#123C45] text-white p-5 lg:p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 uppercase tracking-wider">
                Central Admin Control
              </span>
              <span className="text-teal-200 text-xs">Work-Wise Earning Management</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold mt-1 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-teal-300" />
              Staff Work & Earnings Management
            </h1>
            <p className="text-xs text-teal-100 mt-1 max-w-3xl">
              Configure assigned works with separate Customer/Company Work Values and Staff Earning Amounts.
              Approve completed works to credit staff individual wallets atomically with duplicate credit protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Export Works (CSV)</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Works</span>
            <Briefcase className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 tabular-nums">{stats.totalWorks}</div>
          <p className="text-[10px] text-gray-500 mt-0.5">Assigned statewide</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Customer Value</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-700 tabular-nums">
            ₹{stats.totalCustomerVal.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Company billed subtotal</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Staff Earnings Pool</span>
            <Award className="w-3.5 h-3.5 text-[#0F766E]" />
          </div>
          <div className="text-xl font-bold text-[#0F766E] tabular-nums">
            ₹{stats.totalStaffEarningVal.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-teal-600 font-medium mt-0.5">Configured staff payout</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Verification</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 tabular-nums">{stats.pendingApprovalCount}</div>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">Ready for wallet credit</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-700 tabular-nums">{stats.inProgressCount}</div>
          <p className="text-[10px] text-gray-500 mt-0.5">Active execution</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approved & Credited</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums">{stats.approvedCount}</div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Transferred to wallets</p>
        </div>
      </div>

      {/* Works Registry Table & Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0F766E]" />
              Staff Work Assignment Records
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Showing {filteredWorks.length} of {works.length} assignments
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search work code, title, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-[#0F766E] bg-white text-gray-700"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-[#0F766E] bg-white text-gray-700"
            >
              <option value="all">All 30 Districts</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-[#0F766E] bg-white text-gray-700"
            >
              <option value="all">All Work Statuses</option>
              <option value="pending_approval">Pending Admin Approval (Completed)</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved & Credited</option>
              <option value="rejected">Rejected / Discrepancy</option>
            </select>
          </div>
        </div>

        {/* Works Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100/70 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Work Code & Details</th>
                <th className="px-3 py-3 font-semibold">Assigned Staff</th>
                <th className="px-3 py-3 font-semibold">District & Dept</th>
                <th className="px-3 py-3 font-semibold text-right">Customer Value</th>
                <th className="px-3 py-3 font-semibold text-right text-[#0F766E]">Staff Earning</th>
                <th className="px-3 py-3 font-semibold">Deadline</th>
                <th className="px-3 py-3 font-semibold text-center">Status</th>
                <th className="px-3 py-3 font-semibold text-center">Wallet Status</th>
                <th className="px-4 py-3 font-semibold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-xs">
                    No work assignments match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => {
                  const isReadyForApproval = work.status === 'completed' && !work.isCredited;
                  const isApproved = work.status === 'approved' || work.isCredited;

                  return (
                    <tr key={work.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                        <div className="font-semibold text-gray-900 leading-tight">{work.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-teal-700 font-bold">{work.workCode}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                            {work.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-800">
                        <div className="font-medium">{work.assignedStaffNames.join(', ')}</div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">
                        <div>{work.districtName}</div>
                        <div className="text-[10px] text-gray-400">{work.departmentName}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-gray-600">
                        ₹{work.customerWorkValue.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-[#0F766E] font-mono text-sm">
                        ₹{work.staffEarningAmount.toLocaleString('en-IN')}
                        {work.incentiveAmount > 0 && (
                          <span className="block text-[10px] text-amber-600 font-normal">
                            +₹{work.incentiveAmount} Inc.
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-gray-600 font-mono text-[11px]">
                        <div>{work.completionDeadline}</div>
                        <span
                          className={`text-[9px] uppercase font-bold px-1 rounded inline-block mt-0.5 ${
                            work.priority === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : work.priority === 'high'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {work.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            work.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : work.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : work.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {work.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {work.isCredited ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3" /> Credited
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Uncredited
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Verify & Approve Button */}
                          {isReadyForApproval && (
                            <button
                              onClick={() => openApproveModal(work)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center space-x-1 transition shadow-xs"
                              title="Verify completion & credit wallet"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Reject Discrepancy Button */}
                          {!isApproved && (
                            <button
                              onClick={() => openRejectModal(work)}
                              className="p-1 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                              title="Reject submission / Note discrepancy"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Work & Amount Button */}
                          <button
                            onClick={() => openEditModal(work)}
                            className="p-1 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded transition"
                            title="Edit Work & Amount"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedWork(work);
                              setIsViewDetailsOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                            title="View Submission Evidence & Logs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Work Assignment */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Create New Work Assignment</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWork} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Work Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cuttack Commercial AC Installation Quality Audit"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Work Description & Scope <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide precise scope of work, expected deliverables, and checklist items..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Work Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="Technical Audit">Technical Audit</option>
                    <option value="General Operations">General Operations</option>
                    <option value="Corporate Sales">Corporate Sales</option>
                    <option value="Partner Verification">Partner Verification</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Lead Generation">Lead Generation</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Field Inspection">Field Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Target District</label>
                  <select
                    value={newDistrictId}
                    onChange={(e) => setNewDistrictId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assign Staff (Single or Multiple) */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Assign Staff Member(s) <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-md p-2.5 max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 bg-gray-50/50">
                  {staffList.map((staff) => {
                    const isSelected = newAssignedStaffIds.includes(staff.id);
                    return (
                      <label
                        key={staff.id}
                        className={`flex items-center space-x-2 p-1.5 rounded cursor-pointer transition ${
                          isSelected ? 'bg-teal-100/70 text-teal-900 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAssignedStaffIds([...newAssignedStaffIds, staff.id]);
                            } else {
                              setNewAssignedStaffIds(newAssignedStaffIds.filter(id => id !== staff.id));
                            }
                          }}
                          className="rounded text-[#0F766E] focus:ring-[#0F766E]"
                        />
                        <span className="text-xs">
                          {staff.fullName} ({staff.employeeId}) • <span className="text-gray-500">{staff.departmentName} - {staff.districtName}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Critical Amounts Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-teal-50/60 rounded-lg border border-teal-200">
                <div>
                  <label className="block font-semibold text-gray-800 mb-1">
                    Customer / Company Work Value (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newCustomerValue}
                    onChange={(e) => setNewCustomerValue(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Total client billed value (Not credited to employee).</p>
                </div>

                <div>
                  <label className="block font-bold text-[#0F766E] mb-1">
                    Staff Earning Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newStaffEarning}
                    onChange={(e) => setNewStaffEarning(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 border border-teal-400 rounded-md font-mono font-bold text-teal-900 bg-white"
                  />
                  <p className="text-[10px] text-teal-800 font-medium mt-0.5">
                    Amount credited to staff individual wallet upon completion & approval.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Assignment Date</label>
                  <input
                    type="date"
                    value={newAssignedDate}
                    onChange={(e) => setNewAssignedDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Completion Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Work Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Admin Remarks & Instructions</label>
                <input
                  type="text"
                  placeholder="Optional guidance or special instructions..."
                  value={newAdminRemarks}
                  onChange={(e) => setNewAdminRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F766E] hover:bg-teal-700 text-white rounded-md font-bold transition"
                >
                  Assign Work & Commit Earning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Work and Edit Amount (With Post-Credit Audited Adjustment) */}
      {isEditModalOpen && selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-sm">Edit Work and Earning Amount</h3>
                <p className="text-[11px] text-teal-200 font-mono mt-0.5">{selectedWork.workCode}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              {/* Notice Banner if already credited */}
              {selectedWork.isCredited && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold block">Important: Work Already Credited to Employee Wallet</span>
                    Modifying the Staff Earning Amount will automatically generate an audited adjustment/reversal transaction in the staff wallet to maintain strict financial integrity.
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-1">Work Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Work Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Customer Work Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editCustomerValue}
                    onChange={(e) => setEditCustomerValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F766E] mb-1">Staff Earning Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editStaffEarning}
                    onChange={(e) => setEditStaffEarning(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-teal-500 rounded-md font-mono font-bold bg-teal-50 text-teal-900"
                  />
                  {selectedWork.isCredited && editStaffEarning !== selectedWork.staffEarningAmount && (
                    <span className="text-[10px] text-amber-700 block mt-0.5">
                      Adjustment: {editStaffEarning - selectedWork.staffEarningAmount > 0 ? `+₹${editStaffEarning - selectedWork.staffEarningAmount}` : `-₹${Math.abs(editStaffEarning - selectedWork.staffEarningAmount)}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Work Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Admin Remarks / Justification</label>
                <input
                  type="text"
                  placeholder="Reason for change..."
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0F766E] hover:bg-teal-700 text-white rounded-md font-bold transition"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Verify & Approve Completed Work (Credit Wallet Idempotently) */}
      {isApproveModalOpen && selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Approve Work & Credit Staff Wallet</h3>
              </div>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 space-y-1.5">
                <div className="font-semibold text-gray-900">{selectedWork.title}</div>
                <div className="text-[11px] text-gray-600">
                  Assigned Staff: <span className="font-semibold text-gray-900">{selectedWork.assignedStaffNames.join(', ')}</span>
                </div>
                {selectedWork.submissionNotes && (
                  <div className="text-[11px] text-teal-800 bg-white/70 p-2 rounded border border-teal-100 mt-1">
                    <span className="font-semibold block text-gray-700">Staff Submission Notes:</span>
                    {selectedWork.submissionNotes}
                  </div>
                )}
              </div>

              {/* Financial Crediting Breakdown */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Base Staff Earning Amount:</span>
                  <span className="font-mono font-bold text-gray-900">
                    ₹{selectedWork.staffEarningAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Add Special Incentive Bonus (₹):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={extraIncentive}
                    onChange={(e) => setExtraIncentive(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-xs"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-[#0F766E] pt-2 border-t border-gray-200">
                  <span>Total Credited to Wallet:</span>
                  <span className="font-mono text-base">
                    ₹{(selectedWork.staffEarningAmount + Number(extraIncentive)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Admin Verification Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified deliverables and customer satisfaction"
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Idempotent execution: Prevents duplicate crediting if retried.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={handleConfirmApproval}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold transition disabled:opacity-50"
                >
                  {isSubmittingApproval ? 'Processing...' : 'Authorize & Credit Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Reject Work Discrepancy */}
      {isRejectModalOpen && selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-red-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-300" />
                <h3 className="font-bold text-sm">Reject Work / Note Discrepancy</h3>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejection} className="p-5 space-y-3.5 text-xs">
              <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                <div className="font-semibold text-gray-900">{selectedWork.title}</div>
                <div className="text-[11px] text-gray-500 font-mono">{selectedWork.workCode}</div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Mandatory Discrepancy / Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Detail the exact defect, missing document, or requirement to be rectified..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: View Details & Evidence */}
      {isViewDetailsOpen && selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Work Assignment Dossier</h3>
                <p className="text-[11px] text-teal-200 font-mono mt-0.5">{selectedWork.workCode}</p>
              </div>
              <button onClick={() => setIsViewDetailsOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Title</span>
                <span className="font-semibold text-gray-900">{selectedWork.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Assigned Staff</span>
                <span className="font-semibold text-gray-900">{selectedWork.assignedStaffNames.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">District & Dept</span>
                <span className="text-gray-800">{selectedWork.districtName} • {selectedWork.departmentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Customer Work Value</span>
                <span className="font-mono font-bold text-gray-900">₹{selectedWork.customerWorkValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Staff Earning Amount</span>
                <span className="font-mono font-bold text-[#0F766E]">₹{selectedWork.staffEarningAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Credited Transaction ID</span>
                <span className="font-mono text-teal-700">{selectedWork.creditedTransactionId || 'Pending Credit'}</span>
              </div>

              {selectedWork.submissionNotes && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-gray-500 block mb-1">Employee Submission Notes</span>
                  <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-gray-800 leading-relaxed">
                    {selectedWork.submissionNotes}
                  </div>
                </div>
              )}

              {selectedWork.evidenceFileName && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Evidence File</span>
                  <span className="font-mono text-teal-800 underline flex items-center gap-1 cursor-pointer">
                    <FileText className="w-3.5 h-3.5" />
                    {selectedWork.evidenceFileName}
                  </span>
                </div>
              )}

              {selectedWork.rejectionReason && (
                <div className="py-2 border-b border-gray-100 bg-red-50 p-2.5 rounded">
                  <span className="text-red-700 font-semibold block mb-0.5">Rejection Discrepancy</span>
                  <span className="text-red-900">{selectedWork.rejectionReason}</span>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  onClick={() => setIsViewDetailsOpen(false)}
                  className="px-4 py-1.5 bg-[#0F766E] text-white rounded font-medium hover:bg-teal-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
