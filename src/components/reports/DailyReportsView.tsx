/**
 * DAILY REPORT AUTOMATION ENGINE - Section 23
 * Generates automated Department Daily Reports, District Manager Consolidated Reports,
 * and Statewide Executive Reports with CSV export capability.
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { DepartmentDailyReport, StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface DailyReportsViewProps {
  currentUser: StaffProfile;
}

export const DailyReportsView: React.FC<DailyReportsViewProps> = ({ currentUser }) => {
  const [reports, setReports] = useState<DepartmentDailyReport[]>(StorageEngine.getDepartmentDailyReports());
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [problems, setProblems] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isAdmin = currentUser.systemRole === 'super_admin' || currentUser.permissionLevel === 'admin';
  const isDM = currentUser.systemRole === 'district_manager';

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = StorageEngine.generateDailyReport(currentUser, problems.trim(), nextPlan.trim());
    setReports(StorageEngine.getDepartmentDailyReports());
    setIsGenerateModalOpen(false);
    setProblems('');
    setNextPlan('');
    setSuccessToast(`Daily report generated successfully for ${newReport.employeeName}!`);
  };

  const handleExportCSV = () => {
    const headers = [
      'Report Date',
      'Department',
      'District',
      'Employee Name',
      'Employee ID',
      'Assigned Tasks',
      'Completed Tasks',
      'Pending Tasks',
      'Approved Tasks',
      'Rejected Tasks',
      'Productivity Credits (INR)',
      'Leads Generated',
      'Bookings Generated',
      'Revenue Attributed (INR)',
      'Problems Encountered',
      'Next Day Plan'
    ];

    const rows = reports.map(r => [
      r.reportDate,
      `"${r.departmentName}"`,
      `"${r.districtName}"`,
      `"${r.employeeName}"`,
      r.employeeId,
      r.assignedTasks,
      r.completedTasks,
      r.pendingTasks,
      r.approvedTasks,
      r.rejectedTasks,
      r.productivityCredits,
      r.leadsGenerated,
      r.bookingsGenerated,
      r.revenueAttributed,
      `"${r.problemsEncountered.replace(/"/g, '""')}"`,
      `"${r.nextDayPlan.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doorbly_daily_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Report Automation
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{reports.length} Reports Logged</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Department & District Daily Report Consolidation
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Automates the aggregation of assigned tasks, approved credits, leads, bookings, and revenue attribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reports.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Export CSV / Excel</span>
            </button>
          )}

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Today's Report</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4 max-h-[720px] overflow-y-auto custom-scrollbar pr-1">
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-xs text-gray-500">
            No daily reports generated yet for today. Click "Generate Today's Report" to auto-compile your department deliverables.
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-sm">{rep.employeeName}</span>
                    <span className="font-mono text-xs text-[#0F766E] font-semibold">({rep.employeeId})</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-gray-700">{rep.departmentName}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">District: {rep.districtName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    Date: {rep.reportDate}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs text-center">
                <div className="p-2 rounded-lg bg-[#F7F9FA] border border-gray-100">
                  <span className="text-gray-400 text-[10px]">Assigned</span>
                  <p className="font-bold text-gray-900 mt-0.5">{rep.assignedTasks}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F9FA] border border-gray-100">
                  <span className="text-gray-400 text-[10px]">Completed</span>
                  <p className="font-bold text-[#16865D] mt-0.5">{rep.completedTasks}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F9FA] border border-gray-100">
                  <span className="text-gray-400 text-[10px]">Approved</span>
                  <p className="font-bold text-blue-600 mt-0.5">{rep.approvedTasks}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F9FA] border border-gray-100">
                  <span className="text-gray-400 text-[10px]">Credits</span>
                  <p className="font-bold text-[#0F766E] mt-0.5">₹{rep.productivityCredits}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F9FA] border border-gray-100">
                  <span className="text-gray-400 text-[10px]">Leads</span>
                  <p className="font-bold text-gray-900 mt-0.5">{rep.leadsGenerated}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F9FA] border border-gray-100">
                  <span className="text-gray-400 text-[10px]">Bookings</span>
                  <p className="font-bold text-gray-900 mt-0.5">{rep.bookingsGenerated}</p>
                </div>
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-100">
                  <span className="text-teal-700 text-[10px] font-semibold">Attributed Rev</span>
                  <p className="font-bold text-teal-900 mt-0.5">₹{rep.revenueAttributed}</p>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-[#F7F9FA] p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-800 text-[11px] block mb-1">
                    Problems / Bottlenecks Encountered:
                  </span>
                  <p className="text-gray-600 leading-relaxed text-[11px]">{rep.problemsEncountered}</p>
                </div>
                <div className="bg-[#F7F9FA] p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-800 text-[11px] block mb-1">
                    Next-Day Tactical Plan:
                  </span>
                  <p className="text-gray-600 leading-relaxed text-[11px]">{rep.nextDayPlan}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Generate Daily Department Report</h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 leading-relaxed text-[11px]">
                The system will automatically snapshot your today's assigned tasks, completed activities, approved productivity credits, and customer bookings in <strong className="text-teal-950">{currentUser.districtName}</strong>.
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Problems / Operational Hurdles Encountered
                </label>
                <textarea
                  rows={2}
                  value={problems}
                  onChange={(e) => setProblems(e.target.value)}
                  placeholder="e.g. Technician shortage in Berhampur Old Bus Stand, customer network unreachable in evening..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Next-Day Operational Plan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={nextPlan}
                  onChange={(e) => setNextPlan(e.target.value)}
                  placeholder="e.g. Dial 50 AC maintenance prospects in CDA Sector 10 and coordinate morning technician dispatches..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Compile & Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
