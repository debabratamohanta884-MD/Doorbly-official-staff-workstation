/**
 * ITEMIZABLE WORK CREDITS LEDGER - Section 11 & Section 10
 * Itemized productivity credit log. Internal work measurement, not a financial wallet.
 */

import React, { useState } from 'react';
import { Award, ShieldAlert, FileText, CheckCircle2, Search, ArrowDownRight } from 'lucide-react';
import { StaffProfile, WorkCreditEntry } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface WorkCreditsLedgerProps {
  currentUser: StaffProfile;
}

export const WorkCreditsLedger: React.FC<WorkCreditsLedgerProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admins see all or filter; employees see their own credits
  const isSupervisor = currentUser.permissionLevel === 'admin' || currentUser.systemRole === 'district_manager';
  const allCredits = isSupervisor
    ? StorageEngine.getWorkCredits()
    : StorageEngine.getWorkCredits(currentUser.id);

  const filteredCredits = allCredits.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.taskDescription.toLowerCase().includes(q) ||
      c.taskId.toLowerCase().includes(q) ||
      c.approverName.toLowerCase().includes(q) ||
      c.employeeId.toLowerCase().includes(q)
    );
  });

  const totalCredits = filteredCredits.reduce((sum, c) => sum + c.totalCredits, 0);

  return (
    <div className="space-y-5">
      {/* Compliance Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900">Important Internal Measurement Notice (Section 10 Compliance)</p>
          <p className="mt-0.5 text-amber-700 leading-relaxed text-[11px]">
            These credits represent internal productivity measurement units for remote performance assessment. They are not an employee salary, statutory wages, wallet balance, or automatic monetary compensation. Statutory salary is remitted separately by Doorbly HR Administration.
          </p>
        </div>
      </div>

      {/* Header with Total Credits KPI */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Productivity Ledger
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{filteredCredits.length} Verified Entries</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {isSupervisor ? 'Statewide Work Credits Ledger' : 'My Itemized Work Credits'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit history of approved task units and awarded productivity credits.
          </p>
        </div>

        <div className="bg-[#F7F9FA] border border-gray-200 rounded-xl p-3 px-5 text-right">
          <span className="text-xs font-semibold text-gray-500">Cumulative Approved Credits</span>
          <p className="text-2xl font-black text-[#0F766E] mt-0.5">₹{totalCredits.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Task ID, activity description, or approver..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
          />
        </div>
      </div>

      {/* Itemized Ledger Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto horizontal-scroll-container max-h-[580px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-4 py-3">Credit Date</th>
                <th className="px-4 py-3">Task ID</th>
                <th className="px-4 py-3">Activity Description</th>
                {isSupervisor && <th className="px-4 py-3">Employee</th>}
                <th className="px-4 py-3 text-right">Approved Qty</th>
                <th className="px-4 py-3 text-right">Per-Unit Value</th>
                <th className="px-4 py-3 text-right">Total Credits</th>
                <th className="px-4 py-3">Verified By</th>
                <th className="px-4 py-3">Approval Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={isSupervisor ? 9 : 8} className="px-4 py-10 text-center text-gray-500 text-xs">
                    No verified credit ledger entries found.
                  </td>
                </tr>
              ) : (
                filteredCredits.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{entry.date}</td>
                    <td className="px-4 py-3 font-mono font-bold text-gray-700 whitespace-nowrap">
                      {entry.taskId}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {entry.taskDescription}
                    </td>
                    {isSupervisor && (
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono">
                        {entry.employeeId}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-gray-700">{entry.approvedQuantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">₹{entry.perTaskValue}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#16865D] whitespace-nowrap">
                      +₹{entry.totalCredits}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{entry.approverName}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(entry.approvalDate).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
