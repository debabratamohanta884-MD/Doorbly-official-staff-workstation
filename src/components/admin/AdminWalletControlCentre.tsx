/**
 * DOORBLY CENTRAL ADMIN - WALLET CONTROL CENTRE
 * Unified financial governance engine for all employee individual wallets across 30 districts of Odisha.
 * Features:
 * - Searchable Staff Wallet Directory with individual ledger drilldown
 * - Payout & Withdrawal Management Queue (Approve, Process Payout with UTR, Reject with balance refund)
 * - Manual Authorized Wallet Adjustment Tool (Credit/Debit with mandatory justification & audit trail)
 * - Department-wise & District-wise Earnings and Payout Analytics with CSV export
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Eye,
  Check,
  X,
  Plus,
  MinusCircle,
  FileText
} from 'lucide-react';
import {
  StaffProfile,
  StaffWallet,
  StaffWalletTransaction,
  StaffWithdrawalRequest,
  Department,
  DistrictMaster
} from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface AdminWalletControlCentreProps {
  currentUser: StaffProfile;
}

export type WalletControlTab = 'directory' | 'withdrawals' | 'adjustments' | 'reports';

export const AdminWalletControlCentre: React.FC<AdminWalletControlCentreProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<WalletControlTab>('directory');

  // Core data states
  const [wallets, setWallets] = useState<StaffWallet[]>(() => StorageEngine.getWallets());
  const [withdrawals, setWithdrawals] = useState<StaffWithdrawalRequest[]>(() => StorageEngine.getWithdrawalRequests());
  const [transactions, setTransactions] = useState<StaffWalletTransaction[]>(() => StorageEngine.getWalletTransactions());
  const [staffList, setStaffList] = useState<StaffProfile[]>(() => StorageEngine.getStaffProfiles());
  const [departments, setDepartments] = useState<Department[]>(() => StorageEngine.getDepartments());
  const [districts, setDistricts] = useState<DistrictMaster[]>(() => StorageEngine.getDistricts());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals
  const [selectedWalletForDrilldown, setSelectedWalletForDrilldown] = useState<StaffWallet | null>(null);
  const [selectedWithdrawalForPayout, setSelectedWithdrawalForPayout] = useState<StaffWithdrawalRequest | null>(null);
  const [payoutMode, setPayoutMode] = useState<'IMPS' | 'NEFT' | 'UPI' | 'Direct Bank Transfer'>('IMPS');
  const [payoutUtr, setPayoutUtr] = useState('');
  const [payoutRemarks, setPayoutRemarks] = useState('');

  const [selectedWithdrawalForReject, setSelectedWithdrawalForReject] = useState<StaffWithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Manual Adjustment Form State
  const [adjustStaffId, setAdjustStaffId] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState('');

  const refreshData = () => {
    setWallets(StorageEngine.getWallets());
    setWithdrawals(StorageEngine.getWithdrawalRequests());
    setTransactions(StorageEngine.getWalletTransactions());
    setStaffList(StorageEngine.getStaffProfiles());
    setDepartments(StorageEngine.getDepartments());
    setDistricts(StorageEngine.getDistricts());
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Organization-wide Metrics
  const orgMetrics = useMemo(() => {
    const totalWallets = wallets.length;
    const totalAvailableBalance = wallets.reduce((sum, w) => sum + (w.availableBalance || 0), 0);
    const totalLifetimeEarnings = wallets.reduce((sum, w) => sum + (w.totalEarnings || 0), 0);
    const totalPendingEarnings = wallets.reduce((sum, w) => sum + (w.pendingEarnings || 0), 0);
    const totalWithdrawn = wallets.reduce((sum, w) => sum + (w.totalWithdrawnAmount || 0), 0);
    const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

    return {
      totalWallets,
      totalAvailableBalance,
      totalLifetimeEarnings,
      totalPendingEarnings,
      totalWithdrawn,
      pendingWithdrawalsCount
    };
  }, [wallets, withdrawals]);

  // Filtered Wallets for Directory
  const filteredWallets = useMemo(() => {
    return wallets.filter(w => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = w.fullName?.toLowerCase().includes(q);
        const matchesId = w.employeeId?.toLowerCase().includes(q);
        const matchesDept = w.departmentName?.toLowerCase().includes(q);
        const matchesDist = w.districtName?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDept && !matchesDist) return false;
      }
      if (deptFilter !== 'all' && w.departmentId !== deptFilter) return false;
      if (districtFilter !== 'all') {
        const staff = staffList.find(s => s.id === w.staffId || s.employeeId === w.employeeId);
        if (staff && staff.districtId !== districtFilter) return false;
      }
      return true;
    });
  }, [wallets, searchQuery, deptFilter, districtFilter, staffList]);

  // Handle Process Payout
  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawalForPayout) return;

    if (!payoutUtr || payoutUtr.trim().length < 4) {
      showToast('Mandatory UTR / Payment Reference Number required (min 4 chars).', 'error');
      return;
    }

    const res = StorageEngine.processWithdrawalPayout(
      selectedWithdrawalForPayout.id,
      payoutMode,
      payoutUtr.trim(),
      currentUser,
      payoutRemarks || `Payout processed via ${payoutMode}`
    );

    if (res.success) {
      showToast(`Payout completed for ${selectedWithdrawalForPayout.employeeName}. UTR: ${payoutUtr}`, 'success');
      setSelectedWithdrawalForPayout(null);
      setPayoutUtr('');
      setPayoutRemarks('');
      refreshData();
    } else {
      showToast(res.error || 'Failed to process payout.', 'error');
    }
  };

  // Handle Reject Withdrawal (with refund)
  const handleConfirmRejectWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawalForReject) return;

    if (!rejectReason || rejectReason.trim().length < 5) {
      showToast('Mandatory rejection reason required (min 5 chars).', 'error');
      return;
    }

    const res = StorageEngine.reviewWithdrawalRequest(
      selectedWithdrawalForReject.id,
      'reject',
      currentUser,
      rejectReason
    );

    if (res.success) {
      showToast(`Withdrawal rejected and ₹${selectedWithdrawalForReject.requestedAmount} restored to staff wallet.`, 'info');
      setSelectedWithdrawalForReject(null);
      setRejectReason('');
      refreshData();
    } else {
      showToast(res.error || 'Failed to reject withdrawal.', 'error');
    }
  };

  // Handle Approve Withdrawal
  const handleApproveWithdrawal = (req: StaffWithdrawalRequest) => {
    const res = StorageEngine.reviewWithdrawalRequest(req.id, 'approve', currentUser, 'Verified for payout queue');
    if (res.success) {
      showToast(`Withdrawal ${req.withdrawalCode} approved for payment processing.`, 'success');
      refreshData();
    } else {
      showToast(res.error || 'Failed to approve withdrawal.', 'error');
    }
  };

  // Handle Manual Financial Adjustment
  const handleManualAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustStaffId) {
      showToast('Please select a staff member.', 'error');
      return;
    }
    if (adjustAmount <= 0) {
      showToast('Adjustment amount must be greater than zero.', 'error');
      return;
    }
    if (!adjustReason || adjustReason.trim().length < 5) {
      showToast('Mandatory justification reason required (min 5 chars).', 'error');
      return;
    }

    const res = StorageEngine.adminManualWalletAdjustment(
      adjustStaffId,
      adjustType,
      Number(adjustAmount),
      adjustReason,
      currentUser
    );

    if (res.success) {
      showToast(`Recorded ${adjustType.toUpperCase()} of ₹${adjustAmount}. Resulting balance: ₹${res.newBalance}`, 'success');
      setAdjustReason('');
      setAdjustAmount(500);
      refreshData();
    } else {
      showToast(res.error || 'Adjustment failed.', 'error');
    }
  };

  // Department-wise aggregated metrics
  const deptSummary = useMemo(() => {
    return departments.map(d => {
      const deptWallets = wallets.filter(w => w.departmentId === d.id);
      const staffCount = deptWallets.length;
      const totalEarned = deptWallets.reduce((s, w) => s + w.totalEarnings, 0);
      const totalAvailable = deptWallets.reduce((s, w) => s + w.availableBalance, 0);
      const totalWithdrawn = deptWallets.reduce((s, w) => s + w.totalWithdrawnAmount, 0);

      return {
        id: d.id,
        name: d.name,
        code: d.code,
        staffCount,
        totalEarned,
        totalAvailable,
        totalWithdrawn
      };
    });
  }, [departments, wallets]);

  // Export Department Report to CSV
  const handleExportDeptCSV = () => {
    const headers = ['Department Code', 'Department Name', 'Staff Count', 'Total Earned (INR)', 'Available Balance (INR)', 'Total Withdrawn (INR)'];
    const rows = deptSummary.map(d => [
      `"${d.code}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      d.staffCount,
      d.totalEarned,
      d.totalAvailable,
      d.totalWithdrawn
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Doorbly_Department_Wallet_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Staff Wallet Directory CSV
  const handleExportWalletsCSV = () => {
    const headers = ['Employee ID', 'Full Name', 'Department', 'District', 'Available Balance (INR)', 'Total Earnings (INR)', 'Pending Earnings (INR)', 'Total Withdrawn (INR)', 'Completed Works', 'Bank Name', 'Account No', 'UPI ID'];
    const rows = filteredWallets.map(w => [
      `"${w.employeeId}"`,
      `"${w.fullName}"`,
      `"${w.departmentName}"`,
      `"${w.districtName}"`,
      w.availableBalance,
      w.totalEarnings,
      w.pendingEarnings,
      w.totalWithdrawnAmount,
      w.totalCompletedWork,
      `"${w.bankAccountDetails?.bankName || 'N/A'}"`,
      `"${w.bankAccountDetails?.accountNumber || 'N/A'}"`,
      `"${w.bankAccountDetails?.upiId || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Doorbly_Staff_Wallets_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
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
                Financial Administration
              </span>
              <span className="text-teal-200 text-xs">Staff Wallets & Work Earnings</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold mt-1 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-teal-300" />
              Central Wallet Control Centre
            </h1>
            <p className="text-xs text-teal-100 mt-1 max-w-3xl">
              Super Admin authority over employee wallets across all 9 departments and 30 districts of Odisha.
              Manage payout withdrawals, review ledgers, and execute authorized financial adjustments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportWalletsCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Export Directory (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Organization Financial Metrics (5 Core Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Wallets</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 tabular-nums">
            {orgMetrics.totalWallets}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Employees registered</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Available Balance</span>
            <Wallet className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-bold text-[#0F766E] tabular-nums">
            ₹{orgMetrics.totalAvailableBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-teal-600 font-medium mt-0.5">Spendable liability</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Earnings Pool</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">
            ₹{orgMetrics.totalPendingEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">In-progress work pipeline</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Lifetime Paid Out</span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 tabular-nums">
            ₹{orgMetrics.totalWithdrawn.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-purple-600 font-medium mt-0.5">Completed withdrawals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Withdrawals Queue</span>
            <CreditCard className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 tabular-nums">
            {orgMetrics.pendingWithdrawalsCount}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Pending review & payout</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'directory'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Wallets Directory ({wallets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 relative ${
            activeTab === 'withdrawals'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdrawal Management Queue</span>
          {orgMetrics.pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {orgMetrics.pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('adjustments')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'adjustments'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Manual Financial Adjustment</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'reports'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Department-Wise Reports</span>
        </button>
      </div>

      {/* TAB 1: Employee Wallets Directory */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-bold text-sm text-gray-900">Searchable Staff Wallet Directory</span>
              <span className="text-xs text-gray-500 font-mono">
                Showing {filteredWallets.length} of {wallets.length} active wallets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff name, employee ID, district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-[#0F766E] bg-white"
                />
              </div>

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
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Employee ID & Name</th>
                  <th className="px-3 py-3 font-semibold">Department & District</th>
                  <th className="px-3 py-3 font-semibold text-right text-[#0F766E]">Available Balance</th>
                  <th className="px-3 py-3 font-semibold text-right">Total Earnings</th>
                  <th className="px-3 py-3 font-semibold text-right text-amber-600">Pending</th>
                  <th className="px-3 py-3 font-semibold text-right text-purple-700">Total Withdrawn</th>
                  <th className="px-3 py-3 font-semibold text-center">Completed Works</th>
                  <th className="px-3 py-3 font-semibold">KYC / Payout Account</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="font-semibold text-gray-900">{wallet.fullName}</div>
                      <div className="font-mono text-[10px] text-teal-700 font-bold">{wallet.employeeId}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      <div>{wallet.departmentName}</div>
                      <div className="text-[10px] text-gray-400">{wallet.districtName}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-[#0F766E] font-mono text-sm">
                      ₹{wallet.availableBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-gray-900">
                      ₹{wallet.totalEarnings.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-amber-600">
                      ₹{wallet.pendingEarnings.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-purple-700">
                      ₹{wallet.totalWithdrawnAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-center font-mono">
                      {wallet.totalCompletedWork}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-[11px] truncate max-w-[120px]">
                          {wallet.bankAccountDetails?.bankName || 'SBI'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {wallet.bankAccountDetails?.accountNumber || wallet.bankAccountDetails?.upiId || '•••• 9921'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedWalletForDrilldown(wallet)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded text-[11px] font-semibold flex items-center space-x-1 ml-auto transition shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-[#0F766E]" />
                        <span>Inspect Ledger</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Withdrawal Management Queue */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-purple-600" />
                Staff Wallet Withdrawal & Payout Processing Queue
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review pending requests, verify registered payout accounts, and record payment gateway UTR references.
              </p>
            </div>
            <span className="text-xs bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-md font-bold">
              {withdrawals.length} Total Requests
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Request Code</th>
                  <th className="px-3 py-3 font-semibold">Employee</th>
                  <th className="px-3 py-3 font-semibold">Requested At</th>
                  <th className="px-3 py-3 font-semibold text-right">Amount (₹)</th>
                  <th className="px-4 py-3 font-semibold">Payout Destination & KYC</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Payment Mode / UTR</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-xs">
                      No withdrawal requests in queue.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((req) => {
                    const isPending = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const isCompleted = req.status === 'completed';
                    const isRejected = req.status === 'rejected';

                    return (
                      <tr key={req.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-4 py-3 font-mono font-bold text-teal-800 text-xs">
                          {req.withdrawalCode}
                        </td>
                        <td className="px-3 py-3 text-gray-900">
                          <div className="font-semibold">{req.employeeName}</div>
                          <div className="font-mono text-[10px] text-gray-500">{req.employeeId}</div>
                        </td>
                        <td className="px-3 py-3 text-gray-600 font-mono text-[11px]">
                          {req.requestedAt?.slice(0, 16).replace('T', ' ')}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-gray-900 font-mono text-sm">
                          ₹{req.requestedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="font-medium text-gray-900">
                            {req.payoutAccount.bankName || 'Bank Transfer'}
                          </div>
                          <div className="text-[11px] font-mono text-gray-500">
                            Acc: {req.payoutAccount.accountNumber || req.payoutAccount.upiId} • IFSC: {req.payoutAccount.ifscCode}
                          </div>
                          {req.payoutAccount.upiId && (
                            <div className="text-[10px] text-teal-700 font-mono">UPI: {req.payoutAccount.upiId}</div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isApproved
                                ? 'bg-blue-100 text-blue-800'
                                : isRejected
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-[11px]">
                          {req.utrReference ? (
                            <div>
                              <span className="font-semibold text-emerald-700">{req.payoutMode}</span>
                              <span className="text-gray-600 block text-[10px]">UTR: {req.utrReference}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not Disbursed</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* If pending, Admin can Approve or Reject */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApproveWithdrawal(req)}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition"
                                  title="Approve for payout"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawalForReject(req);
                                    setRejectReason('');
                                  }}
                                  className="p-1 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                                  title="Reject & refund balance"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* If approved (or pending), Admin can Process Payout with UTR */}
                            {(isApproved || isPending) && (
                              <button
                                onClick={() => {
                                  setSelectedWithdrawalForPayout(req);
                                  setPayoutUtr('');
                                  setPayoutRemarks('');
                                }}
                                className="px-2.5 py-1 bg-[#0F766E] hover:bg-teal-700 text-white rounded text-[11px] font-bold transition shadow-xs"
                                title="Record payment reference / UTR"
                              >
                                Process Payout
                              </button>
                            )}

                            {isCompleted && (
                              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Disbursed
                              </span>
                            )}
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
      )}

      {/* TAB 3: Manual Financial Adjustment Tool */}
      {activeTab === 'adjustments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Adjustment Entry Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0F766E]" />
                Execute Authorized Adjustment
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Adjust employee wallet with mandatory audit justification and instant ledger recording.
              </p>
            </div>

            <form onSubmit={handleManualAdjustmentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Select Staff Member <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustStaffId}
                  onChange={(e) => setAdjustStaffId(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#0F766E]"
                >
                  <option value="">-- Choose Employee --</option>
                  {wallets.map(w => (
                    <option key={w.staffId} value={w.staffId}>
                      {w.fullName} ({w.employeeId}) • Bal: ₹{w.availableBalance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Adjustment Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 rounded-md font-bold text-xs flex items-center justify-center space-x-1.5 border transition ${
                      adjustType === 'credit'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Credit (Add)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 rounded-md font-bold text-xs flex items-center justify-center space-x-1.5 border transition ${
                      adjustType === 'debit'
                        ? 'bg-red-50 border-red-500 text-red-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4 text-red-600" />
                    <span>Debit (Deduct)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Adjustment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Mandatory Audit Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Explain authorized reason (e.g. Disputed booking commission reconciliation, performance correction, penalty reversal)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-[11px] text-gray-600">
                Authorizer: <span className="font-semibold text-gray-900">{currentUser.fullName} ({currentUser.employeeId})</span>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#0F766E] hover:bg-teal-700 text-white rounded-md font-bold transition shadow-xs"
              >
                Execute {adjustType.toUpperCase()} Adjustment
              </button>
            </form>
          </div>

          {/* Recent Adjustments Ledger Feed */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F766E]" />
                Recent Financial Adjustments Ledger
              </h3>
              <span className="text-xs text-gray-500 font-mono">
                {transactions.filter(t => t.type.includes('adjustment')).length} recorded adjustments
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Date & Txn ID</th>
                    <th className="px-3 py-2.5 font-semibold">Employee</th>
                    <th className="px-3 py-2.5 font-semibold">Direction</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Amount (₹)</th>
                    <th className="px-3 py-2.5 font-semibold">Reason & Authorizer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions
                    .filter(t => t.type.includes('adjustment'))
                    .slice(0, 15)
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-3 py-2.5 font-mono text-[11px] text-gray-600">
                          <div>{t.date ? t.date.slice(0, 16) : t.createdAt.slice(0, 16).replace('T', ' ')}</div>
                          <div className="text-[10px] text-teal-700 font-bold">{t.transactionId}</div>
                        </td>
                        <td className="px-3 py-2.5 font-mono font-medium text-gray-800">
                          {t.employeeId}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.type === 'adjustment_credit'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {t.type === 'adjustment_credit' ? '+ CREDIT' : '- DEBIT'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-xs">
                          {t.credit > 0 ? (
                            <span className="text-emerald-600">+₹{t.credit.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-red-600">-₹{t.debit.toLocaleString('en-IN')}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-gray-700 max-w-xs">
                          <div className="truncate">{t.adminRemarks || t.workDescription}</div>
                          {t.authorizedBy && (
                            <div className="text-[10px] text-gray-400">By: {t.authorizedBy}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Department-Wise Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />
                Department-Wise Staff Earnings & Payout Analytics
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Aggregated wallet earnings, spendable liabilities, and payouts by operational department.
              </p>
            </div>
            <button
              onClick={handleExportDeptCSV}
              className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Department Analytics (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Dept Code & Name</th>
                  <th className="px-3 py-3 font-semibold text-center">Active Staff</th>
                  <th className="px-3 py-3 font-semibold text-right">Lifetime Staff Earned (₹)</th>
                  <th className="px-3 py-3 font-semibold text-right text-[#0F766E]">Current Available Balance (₹)</th>
                  <th className="px-3 py-3 font-semibold text-right text-purple-700">Total Paid Out (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deptSummary.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-[10px] font-mono text-teal-700">{d.code}</div>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-gray-800">
                      {d.staffCount}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-gray-900">
                      ₹{d.totalEarned.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-[#0F766E] text-sm">
                      ₹{d.totalAvailable.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-purple-700">
                      ₹{d.totalWithdrawn.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Process Withdrawal Payout (Record UTR) */}
      {selectedWithdrawalForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Process Withdrawal Payout</h3>
                <p className="text-[11px] text-teal-200 font-mono mt-0.5">{selectedWithdrawalForPayout.withdrawalCode}</p>
              </div>
              <button onClick={() => setSelectedWithdrawalForPayout(null)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900 block text-xs">{selectedWithdrawalForPayout.employeeName}</span>
                  <span className="text-[11px] text-gray-500 font-mono">{selectedWithdrawalForPayout.employeeId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Disbursement Amount</span>
                  <span className="text-lg font-bold text-[#0F766E] font-mono">
                    ₹{selectedWithdrawalForPayout.requestedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Destination Account */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <span className="font-semibold text-gray-800 block text-[11px]">Registered Payout Destination</span>
                <p className="text-gray-700 font-mono text-[11px]">
                  {selectedWithdrawalForPayout.payoutAccount.bankName} • {selectedWithdrawalForPayout.payoutAccount.accountNumber}
                </p>
                <p className="text-gray-500 text-[11px] font-mono">
                  IFSC: {selectedWithdrawalForPayout.payoutAccount.ifscCode}
                  {selectedWithdrawalForPayout.payoutAccount.upiId && ` • UPI: ${selectedWithdrawalForPayout.payoutAccount.upiId}`}
                </p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Payment Method / Gateway</label>
                <select
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium"
                >
                  <option value="IMPS">IMPS (Immediate Payment Service)</option>
                  <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
                  <option value="UPI">UPI Direct Instant Transfer</option>
                  <option value="Direct Bank Transfer">Direct Bank Corporate Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Banking UTR / Transaction Reference ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-OD-992144810 or 334918274910"
                  value={payoutUtr}
                  onChange={(e) => setPayoutUtr(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm uppercase focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Admin Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via corporate banking portal"
                  value={payoutRemarks}
                  onChange={(e) => setPayoutRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedWithdrawalForPayout(null)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-teal-700 text-white rounded-md font-bold transition"
                >
                  Confirm Payout & Record UTR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reject Withdrawal (With Balance Refund) */}
      {selectedWithdrawalForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-red-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Reject Withdrawal Request</h3>
                <p className="text-[11px] text-red-200 font-mono mt-0.5">{selectedWithdrawalForReject.withdrawalCode}</p>
              </div>
              <button onClick={() => setSelectedWithdrawalForReject(null)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejectWithdrawal} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-900 space-y-1">
                <div className="font-semibold">{selectedWithdrawalForReject.employeeName} ({selectedWithdrawalForReject.employeeId})</div>
                <div className="font-mono text-sm font-bold text-red-700">₹{selectedWithdrawalForReject.requestedAmount.toLocaleString('en-IN')}</div>
                <p className="text-[11px] text-red-800 leading-relaxed pt-1">
                  Upon rejection, the reserved amount will be immediately refunded back to the employee&apos;s available wallet balance.
                </p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Mandatory Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="State the reason (e.g. Bank IFSC mismatch, pending KYC verification)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedWithdrawalForReject(null)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold transition"
                >
                  Reject & Refund Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Inspect Individual Wallet Ledger (Drilldown) */}
      {selectedWalletForDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-sm">{selectedWalletForDrilldown.fullName}&apos;s Individual Ledger</h3>
                <p className="text-[11px] text-teal-200 font-mono mt-0.5">
                  {selectedWalletForDrilldown.employeeId} • {selectedWalletForDrilldown.departmentName}
                </p>
              </div>
              <button onClick={() => setSelectedWalletForDrilldown(null)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Quick KPIs for this staff */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Available Balance</span>
                  <div className="text-lg font-bold text-[#0F766E] font-mono mt-0.5">
                    ₹{selectedWalletForDrilldown.availableBalance.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Total Earnings</span>
                  <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
                    ₹{selectedWalletForDrilldown.totalEarnings.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-[10px] text-purple-700 uppercase font-bold">Total Withdrawn</span>
                  <div className="text-lg font-bold text-purple-800 font-mono mt-0.5">
                    ₹{selectedWalletForDrilldown.totalWithdrawnAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Payout Account details */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <span className="font-semibold text-gray-900 block text-xs">Registered Payout Account</span>
                <p className="text-gray-700 font-mono text-[11px]">
                  {selectedWalletForDrilldown.bankAccountDetails?.bankName || 'SBI'} • {selectedWalletForDrilldown.bankAccountDetails?.accountNumber || '•••• 9921'}
                </p>
                <p className="text-gray-500 text-[11px] font-mono">
                  IFSC: {selectedWalletForDrilldown.bankAccountDetails?.ifscCode || 'SBIN0001024'}
                  {selectedWalletForDrilldown.bankAccountDetails?.upiId && ` • UPI: ${selectedWalletForDrilldown.bankAccountDetails.upiId}`}
                </p>
              </div>

              {/* Transactions table for this staff */}
              <div>
                <span className="font-bold text-xs text-gray-900 block mb-2">Itemized Transaction Ledger</span>
                <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-60 custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-600 border-b border-gray-200 uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Date & Txn ID</th>
                        <th className="px-3 py-2 font-semibold">Description</th>
                        <th className="px-2 py-2 font-semibold text-right">Credit</th>
                        <th className="px-2 py-2 font-semibold text-right">Debit</th>
                        <th className="px-2 py-2 font-semibold text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions
                        .filter(t => t.staffId === selectedWalletForDrilldown.staffId || t.employeeId === selectedWalletForDrilldown.employeeId)
                        .map(t => (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono text-[10px] text-gray-600">
                              <div>{t.date ? t.date.slice(0, 10) : t.createdAt.slice(0, 10)}</div>
                              <div className="text-teal-700 font-semibold">{t.transactionId}</div>
                            </td>
                            <td className="px-3 py-2 text-gray-800 max-w-xs truncate">
                              {t.workDescription}
                            </td>
                            <td className="px-2 py-2 text-right font-mono text-emerald-600 font-bold">
                              {t.credit > 0 ? `+₹${t.credit}` : '—'}
                            </td>
                            <td className="px-2 py-2 text-right font-mono text-red-600 font-bold">
                              {t.debit > 0 ? `-₹${t.debit}` : '—'}
                            </td>
                            <td className="px-2 py-2 text-right font-mono text-gray-900 font-bold">
                              ₹{t.runningBalance}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedWalletForDrilldown(null)}
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
