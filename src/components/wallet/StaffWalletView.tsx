/**
 * DOORBLY STAFF INDIVIDUAL WALLET & WORK-BASED EARNINGS VIEW
 * Dedicated personal workstation wallet for employees across 30 districts of Odisha.
 * Displays: Available Balance, Total Earnings, Pending, This Month, Withdrawals, Completed Works,
 * Transaction Ledger with filter & CSV statement download, and Payout Request workflow.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Filter,
  Search,
  Building,
  CreditCard,
  Send,
  Calendar,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  Printer
} from 'lucide-react';
import {
  StaffProfile,
  StaffWallet,
  StaffWalletTransaction,
  StaffWorkAssignment,
  StaffWithdrawalRequest,
  StaffBankAccountDetails
} from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface StaffWalletViewProps {
  currentUser: StaffProfile;
}

export const StaffWalletView: React.FC<StaffWalletViewProps> = ({ currentUser }) => {
  // State
  const [wallet, setWallet] = useState<StaffWallet>(() => StorageEngine.getStaffWallet(currentUser.id));
  const [transactions, setTransactions] = useState<StaffWalletTransaction[]>(() =>
    StorageEngine.getWalletTransactions(currentUser.id)
  );
  const [myWorks, setMyWorks] = useState<StaffWorkAssignment[]>(() =>
    StorageEngine.getStaffWorkAssignments({ staffId: currentUser.id })
  );
  const [withdrawalRequests, setWithdrawalRequests] = useState<StaffWithdrawalRequest[]>(() =>
    StorageEngine.getWithdrawalRequests(currentUser.id)
  );

  // Modals & UI states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [withdrawRemarks, setWithdrawRemarks] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Edit Bank / KYC Modal
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankHolderName, setBankHolderName] = useState(wallet.bankAccountDetails?.accountHolderName || currentUser.fullName);
  const [bankAccNumber, setBankAccNumber] = useState(wallet.bankAccountDetails?.accountNumber || '');
  const [bankIfsc, setBankIfsc] = useState(wallet.bankAccountDetails?.ifscCode || 'SBIN0001024');
  const [bankName, setBankName] = useState(wallet.bankAccountDetails?.bankName || 'State Bank of India');
  const [bankUpi, setBankUpi] = useState(wallet.bankAccountDetails?.upiId || '');

  // Work Submission Modal
  const [selectedWorkForSubmission, setSelectedWorkForSubmission] = useState<StaffWorkAssignment | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');

  // Selected Transaction for Details
  const [selectedTxn, setSelectedTxn] = useState<StaffWalletTransaction | null>(null);

  // Filters for Transactions
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'this_month' | 'prev_month'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh wallet and operational collections
  const refreshData = () => {
    setWallet(StorageEngine.getStaffWallet(currentUser.id));
    setTransactions(StorageEngine.getWalletTransactions(currentUser.id));
    setMyWorks(StorageEngine.getStaffWorkAssignments({ staffId: currentUser.id }));
    setWithdrawalRequests(StorageEngine.getWithdrawalRequests(currentUser.id));
  };

  useEffect(() => {
    refreshData();
  }, [currentUser.id]);

  // Handle work submission
  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkForSubmission) return;

    if (!submissionNotes || submissionNotes.trim().length < 5) {
      alert('Please provide detailed completion notes (minimum 5 characters).');
      return;
    }

    StorageEngine.submitWorkCompletion(
      selectedWorkForSubmission.id,
      currentUser,
      submissionNotes,
      evidenceFileName || 'completion_evidence.pdf'
    );

    setSelectedWorkForSubmission(null);
    setSubmissionNotes('');
    setEvidenceFileName('');
    refreshData();
  };

  // Handle Withdrawal Request Submission
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    if (withdrawAmount < 100) {
      setWithdrawError('Minimum withdrawal amount is ₹100.');
      return;
    }

    if (withdrawAmount > wallet.availableBalance) {
      setWithdrawError(`Requested amount ₹${withdrawAmount} exceeds available balance ₹${wallet.availableBalance}.`);
      return;
    }

    if (!wallet.bankAccountDetails?.accountNumber && !wallet.bankAccountDetails?.upiId) {
      setWithdrawError('Please register your Bank Account or UPI details first.');
      return;
    }

    const res = StorageEngine.requestWithdrawal(
      currentUser,
      withdrawAmount,
      wallet.bankAccountDetails,
      withdrawRemarks || 'Staff self withdrawal request'
    );

    if (res.success) {
      setWithdrawSuccess(`Withdrawal request of ₹${withdrawAmount} submitted successfully. Code: ${res.request?.withdrawalCode}`);
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawSuccess(null);
        setWithdrawRemarks('');
      }, 1800);
      refreshData();
    } else {
      setWithdrawError(res.error || 'Failed to submit withdrawal request.');
    }
  };

  // Handle Bank details update
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDetails: StaffBankAccountDetails = {
      accountHolderName: bankHolderName,
      accountNumber: bankAccNumber,
      ifscCode: bankIfsc.toUpperCase(),
      bankName: bankName,
      upiId: bankUpi,
      isKycVerified: true
    };

    StorageEngine.updateWalletBankDetails(currentUser.id, updatedDetails, currentUser);
    setIsBankModalOpen(false);
    refreshData();
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = t.workDescription?.toLowerCase().includes(q);
        const matchesId = t.transactionId?.toLowerCase().includes(q);
        const matchesWork = t.workId?.toLowerCase().includes(q);
        if (!matchesDesc && !matchesId && !matchesWork) return false;
      }

      // Type Filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'credit' && t.credit <= 0) return false;
        if (typeFilter === 'debit' && t.debit <= 0) return false;
        if (typeFilter === 'withdrawal' && t.type !== 'withdrawal') return false;
        if (typeFilter === 'adjustment' && !t.type.includes('adjustment')) return false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      // Date Filter
      if (dateFilter !== 'all') {
        const txnDate = new Date(t.date || t.createdAt);
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const txnDateStr = txnDate.toISOString().slice(0, 10);

        if (dateFilter === 'today') {
          if (txnDateStr !== todayStr) return false;
        } else if (dateFilter === '7days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (txnDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'this_month') {
          if (txnDate.getMonth() !== now.getMonth() || txnDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (dateFilter === 'prev_month') {
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          if (txnDate.getMonth() !== prevMonth || txnDate.getFullYear() !== prevYear) {
            return false;
          }
        }
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateFilter]);

  // Download Wallet Statement as CSV
  const handleDownloadStatement = () => {
    const headers = ['Transaction ID', 'Date', 'Work Description', 'Work Code', 'Category', 'Type', 'Credit (INR)', 'Debit (INR)', 'Balance (INR)', 'Status', 'Authorized By'];
    const rows = filteredTransactions.map(t => [
      `"${t.transactionId}"`,
      `"${t.date || t.createdAt}"`,
      `"${(t.workDescription || '').replace(/"/g, '""')}"`,
      `"${t.workId || 'N/A'}"`,
      `"${t.category || 'N/A'}"`,
      `"${t.type}"`,
      t.credit || 0,
      t.debit || 0,
      t.runningBalance || 0,
      `"${t.status}"`,
      `"${t.authorizedBy || 'System'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Doorbly_Wallet_Statement_${currentUser.employeeId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distinct categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Identity & Payout Info */}
      <div className="bg-gradient-to-r from-[#123C45] to-[#0F766E] rounded-xl text-white p-5 lg:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 uppercase tracking-wider">
                Staff Individual Wallet
              </span>
              <span className="text-teal-200 text-xs">
                {currentUser.employeeId} • {currentUser.departmentName}
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold mt-1.5 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-teal-300" />
              {currentUser.fullName}&apos;s Work & Earnings Wallet
            </h1>
            <p className="text-xs text-teal-100 mt-1 max-w-2xl">
              Real-time work earnings, approved productivity credits, and secure payout withdrawals for {currentUser.districtName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium text-white flex items-center space-x-2 transition"
            >
              <CreditCard className="w-4 h-4 text-teal-300" />
              <span>Payout Account / KYC</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={wallet.availableBalance < 100}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 shadow-xs transition ${
                wallet.availableBalance >= 100
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 cursor-pointer'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Request Withdrawal</span>
            </button>
          </div>
        </div>

        {/* Bank & Payout Snapshot */}
        <div className="mt-4 pt-3.5 border-t border-teal-700/50 flex flex-wrap items-center justify-between text-xs text-teal-100 gap-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-teal-300" />
              <span>Bank: {wallet.bankAccountDetails?.bankName || 'State Bank of India'} ({wallet.bankAccountDetails?.accountNumber || '•••• 9921'})</span>
            </span>
            {wallet.bankAccountDetails?.upiId && (
              <span className="hidden sm:inline text-teal-200">
                UPI: <span className="font-mono">{wallet.bankAccountDetails.upiId}</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-teal-200">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>KYC Verified & Authorised Payout Gateway</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards (7 Core Wallet Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Available Balance */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available Balance</span>
            <Wallet className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-xl font-bold text-[#0F766E] tabular-nums">
            ₹{wallet.availableBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Ready to withdraw</p>
          <div className="absolute top-0 right-0 w-12 h-12 bg-teal-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* 2. Total Earnings */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 tabular-nums">
            ₹{wallet.totalEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Approved lifetime</p>
        </div>

        {/* 3. Pending Earnings */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Earnings</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 tabular-nums">
            ₹{wallet.pendingEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Under verification</p>
        </div>

        {/* 4. This Month's Earnings */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">This Month</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-700 tabular-nums">
            ₹{wallet.currentMonthEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Current calendar month</p>
        </div>

        {/* 5. Total Withdrawn */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Withdrawn</span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-gray-800 tabular-nums">
            ₹{wallet.totalWithdrawnAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-purple-600 font-medium mt-1">Directly paid out</p>
        </div>

        {/* 6. Completed Work Count */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed Works</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 tabular-nums">
            {wallet.totalCompletedWork}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Approved assignments</p>
        </div>
      </div>

      {/* Assigned Work & Earning Pipeline Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F766E]" />
              My Assigned Works & Earning Values
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Each work has a configured staff earning amount credited to your wallet upon verification & approval.
            </p>
          </div>
          <span className="text-xs bg-teal-50 text-[#0F766E] border border-teal-200 px-2.5 py-1 rounded-md font-medium">
            {myWorks.length} Active / Assigned Works
          </span>
        </div>

        {myWorks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No work assignments assigned to your workstation currently.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Work Code & Title</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Customer Value</th>
                  <th className="px-3 py-3 font-semibold text-[#0F766E]">Your Staff Earning</th>
                  <th className="px-3 py-3 font-semibold">Deadline & Priority</th>
                  <th className="px-3 py-3 font-semibold">Work Status</th>
                  <th className="px-3 py-3 font-semibold">Wallet Credit</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myWorks.map((work) => {
                  const isCompleted = work.status === 'completed';
                  const isApproved = work.status === 'approved';
                  const isRejected = work.status === 'rejected';

                  return (
                    <tr key={work.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                        <div className="font-semibold text-gray-900 leading-tight">{work.title}</div>
                        <div className="text-[11px] font-mono text-teal-700 mt-0.5">{work.workCode}</div>
                        {work.adminRemarks && (
                          <div className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">
                            Note: {work.adminRemarks}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-gray-600">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                          {work.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-500 font-mono">
                        ₹{work.customerWorkValue.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 font-bold text-[#0F766E] font-mono text-sm">
                        ₹{work.staffEarningAmount.toLocaleString('en-IN')}
                        {work.incentiveAmount > 0 && (
                          <span className="block text-[10px] text-amber-600 font-normal">
                            +₹{work.incentiveAmount} Incentive
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-gray-600">
                        <div className="font-mono text-[11px]">{work.completionDeadline}</div>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
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
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCompleted
                              ? 'bg-blue-100 text-blue-800'
                              : isRejected
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {work.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {work.isCredited ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3" /> Credited
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending Credit
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isApproved && !isCompleted && (
                          <button
                            onClick={() => setSelectedWorkForSubmission(work)}
                            className="px-2.5 py-1 bg-[#0F766E] hover:bg-teal-800 text-white rounded text-[11px] font-medium transition cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                        {isCompleted && !isApproved && (
                          <span className="text-[11px] text-blue-600 font-medium">Awaiting Admin Verification</span>
                        )}
                        {isApproved && (
                          <span className="text-[11px] text-emerald-700 font-medium">Approved & Paid to Wallet</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Itemized Wallet Transaction History Table (Section 6 Requirement) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 space-y-3 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#0F766E]" />
                Wallet Transaction History & Ledger
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Every transaction contains a unique transaction ID, running balance, and work attribution.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadStatement}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 flex items-center space-x-1.5 shadow-2xs transition"
              >
                <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Export Statement (CSV)</span>
              </button>
            </div>
          </div>

          {/* Transaction Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search description / Txn ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white"
              />
            </div>

            {/* Date Range Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-gray-700"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="prev_month">Previous Month</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-gray-700"
            >
              <option value="all">All Transaction Types</option>
              <option value="credit">Credits (Income)</option>
              <option value="debit">Debits (Deductions)</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="adjustment">Administrative Adjustments</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-gray-700"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100/80 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Date & Txn ID</th>
                <th className="px-4 py-3 font-semibold">Work Description</th>
                <th className="px-3 py-3 font-semibold">Work ID</th>
                <th className="px-3 py-3 font-semibold text-right text-emerald-700">Credit (₹)</th>
                <th className="px-3 py-3 font-semibold text-right text-red-600">Debit (₹)</th>
                <th className="px-3 py-3 font-semibold text-right text-gray-900">Running Balance (₹)</th>
                <th className="px-3 py-3 font-semibold text-center">Status</th>
                <th className="px-3 py-3 font-semibold text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-xs">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isCredit = t.credit > 0;
                  const isDebit = t.debit > 0;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-gray-900">
                          {t.date ? t.date.slice(0, 16) : t.createdAt.slice(0, 16).replace('T', ' ')}
                        </div>
                        <div className="text-[10px] font-mono text-teal-700 font-semibold">{t.transactionId}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-800 max-w-sm">
                        <div className="font-medium text-gray-900 leading-snug">{t.workDescription}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                            {t.category}
                          </span>
                          {t.authorizedBy && (
                            <span className="text-[10px] text-gray-400">By: {t.authorizedBy}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600 font-mono text-[11px]">
                        {t.workId || '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-600 font-mono tabular-nums text-xs">
                        {isCredit ? `+₹${t.credit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-red-600 font-mono tabular-nums text-xs">
                        {isDebit ? `-₹${t.debit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-gray-900 font-mono tabular-nums text-xs">
                        ₹{(t.runningBalance || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => setSelectedTxn(t)}
                          className="p-1 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded transition"
                          title="View Audit Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
              My Withdrawal Requests & Payout Status
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Track the progress of your payout requests to your registered bank account or UPI ID.
            </p>
          </div>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={wallet.availableBalance < 100}
            className="px-3 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>New Withdrawal Request</span>
          </button>
        </div>

        {withdrawalRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs">
            No withdrawal requests made yet. Available balance is ready for payout request anytime.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Request Code</th>
                  <th className="px-3 py-3 font-semibold">Date Requested</th>
                  <th className="px-3 py-3 font-semibold text-right">Amount (₹)</th>
                  <th className="px-4 py-3 font-semibold">Payout Destination</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Payment Mode / UTR</th>
                  <th className="px-4 py-3 font-semibold">Admin Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {withdrawalRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-teal-800 text-xs">
                      {req.withdrawalCode}
                    </td>
                    <td className="px-3 py-3 text-gray-600 font-mono text-[11px]">
                      {req.requestedAt?.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-gray-900 font-mono text-xs">
                      ₹{req.requestedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="font-medium text-gray-900">
                        {req.payoutAccount.bankName || 'Direct Bank'}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500">
                        {req.payoutAccount.accountNumber || req.payoutAccount.upiId}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          req.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'rejected'
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
                          <span className="font-semibold text-emerald-700">{req.payoutMode || 'IMPS'}</span>
                          <span className="text-gray-600 block text-[10px]">UTR: {req.utrReference}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Queue Processing</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[11px] max-w-xs">
                      {req.adminRemarks || req.rejectionReason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Request Withdrawal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Request Wallet Withdrawal</h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="p-5 space-y-4 text-xs">
              {withdrawError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{withdrawSuccess}</span>
                </div>
              )}

              <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-gray-600 block text-[11px]">Available for Withdrawal</span>
                  <span className="text-lg font-bold text-[#0F766E] font-mono">
                    ₹{wallet.availableBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block">Min. Request: ₹100</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(wallet.availableBalance)}
                    className="text-[11px] text-teal-700 font-bold hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Withdrawal Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={100}
                  max={wallet.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-mono text-sm"
                />
              </div>

              {/* Registered Account summary */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <span className="font-semibold text-gray-800 block text-[11px]">Destination Payout Account</span>
                <p className="text-gray-600 font-mono text-[11px]">
                  {wallet.bankAccountDetails?.bankName} • {wallet.bankAccountDetails?.accountNumber}
                </p>
                {wallet.bankAccountDetails?.upiId && (
                  <p className="text-gray-500 text-[11px]">
                    UPI: <span className="font-mono text-teal-800">{wallet.bankAccountDetails.upiId}</span>
                  </p>
                )}
                <div className="flex items-center text-[10px] text-emerald-700 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified for Odisha District banking payout
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Optional Purpose / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly work payout request"
                  value={withdrawRemarks}
                  onChange={(e) => setWithdrawRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawAmount < 100 || withdrawAmount > wallet.availableBalance}
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-md font-semibold transition disabled:opacity-50"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Bank & KYC Account Details */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Payout Bank Account & KYC</h3>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  value={bankHolderName}
                  onChange={(e) => setBankHolderName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  placeholder="e.g. State Bank of India, HDFC Bank"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankAccNumber}
                  onChange={(e) => setBankAccNumber(e.target.value)}
                  required
                  placeholder="e.g. 334510992144"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. SBIN0001024"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">UPI ID (Optional for fast payouts)</label>
                <input
                  type="text"
                  value={bankUpi}
                  onChange={(e) => setBankUpi(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono"
                />
              </div>

              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                Note: Payout details are encrypted and securely verified by Central HR & Accounts.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-md font-semibold transition"
                >
                  Save Payout Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit Work Completion */}
      {selectedWorkForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Submit Work Completion</h3>
                <p className="text-[11px] text-teal-200 font-mono mt-0.5">{selectedWorkForSubmission.workCode}</p>
              </div>
              <button
                onClick={() => setSelectedWorkForSubmission(null)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900 block text-xs">{selectedWorkForSubmission.title}</span>
                  <span className="text-[11px] text-gray-500">Category: {selectedWorkForSubmission.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Staff Earning</span>
                  <span className="text-base font-bold text-[#0F766E] font-mono">
                    ₹{selectedWorkForSubmission.staffEarningAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Completion Notes & Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  required
                  placeholder="Detail the work performed, metrics achieved, customer feedback, and deliverables..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Evidence / Deliverable File Name
                </label>
                <input
                  type="text"
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  placeholder="e.g. cuttack_site_report.pdf, customer_call_log.csv"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedWorkForSubmission(null)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-md font-semibold transition"
                >
                  Submit for Admin Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Transaction Details Drilldown */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-[#123C45] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Transaction Ledger Audit</h3>
                <p className="text-[11px] text-teal-200 font-mono mt-0.5">{selectedTxn.transactionId}</p>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Date & Timestamp</span>
                <span className="font-mono text-gray-900">{selectedTxn.date || selectedTxn.createdAt}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Work Attribution</span>
                <span className="font-semibold text-gray-900">{selectedTxn.workId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Transaction Type</span>
                <span className="font-mono text-teal-700 uppercase font-semibold">{selectedTxn.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Credit Amount</span>
                <span className="font-mono font-bold text-emerald-600">
                  {selectedTxn.credit > 0 ? `+₹${selectedTxn.credit.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Debit Amount</span>
                <span className="font-mono font-bold text-red-600">
                  {selectedTxn.debit > 0 ? `-₹${selectedTxn.debit.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Resulting Balance</span>
                <span className="font-mono font-bold text-gray-900">
                  ₹{(selectedTxn.runningBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="py-1.5 border-b border-gray-100">
                <span className="text-gray-500 block mb-0.5">Description & Purpose</span>
                <span className="text-gray-800 leading-relaxed">{selectedTxn.workDescription}</span>
              </div>
              {selectedTxn.adminRemarks && (
                <div className="py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Admin Remarks / Reference</span>
                  <span className="text-gray-800 italic">{selectedTxn.adminRemarks}</span>
                </div>
              )}
              {selectedTxn.authorizedBy && (
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Authorised By</span>
                  <span className="font-semibold text-gray-900">{selectedTxn.authorizedBy}</span>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedTxn(null)}
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
