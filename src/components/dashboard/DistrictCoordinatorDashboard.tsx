/**
 * DISTRICT COORDINATOR (DC) DASHBOARD - Section 16
 * Field team roster, daily attendance, assigned task progress,
 * submissions awaiting verification, booking dispatch, and daily report generator.
 */

import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  PhoneForwarded,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  FileSpreadsheet,
  Wallet
} from 'lucide-react';
import { StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { ActiveTab } from '../layout/Sidebar';

interface DistrictCoordinatorDashboardProps {
  currentUser: StaffProfile;
  onNavigate: (tab: ActiveTab) => void;
}

export const DistrictCoordinatorDashboard: React.FC<DistrictCoordinatorDashboardProps> = ({
  currentUser,
  onNavigate
}) => {
  const allStaff = StorageEngine.getStaffProfiles();
  const districtStaff = allStaff.filter(s => s.districtId === currentUser.districtId);
  const districtTasks = StorageEngine.getDailyTasks({ districtId: currentUser.districtId });
  const pendingSubmissions = StorageEngine.getSubmissions().filter(s => s.status === 'under_review' || s.status === 'submitted');
  const attendanceRecords = StorageEngine.getAttendance();
  const bookings = StorageEngine.getBookings().filter(b => b.districtId === currentUser.districtId);

  const todayStr = new Date().toISOString().slice(0, 10);
  const presentStaff = districtStaff.filter(s => {
    const att = attendanceRecords.find(a => (a.staffId === s.id || a.employeeId === s.employeeId) && a.date === todayStr);
    return att && att.status === 'present';
  });

  return (
    <div className="space-y-6">
      {/* DC Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
              District Coordinator Console
            </span>
            <span className="text-xs font-mono text-gray-500">{currentUser.districtName}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Field Operations & Work Allocation: {currentUser.districtName}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Coordinator: <span className="font-semibold text-gray-700">{currentUser.fullName}</span> • Team Roster: {districtStaff.length} Remote Executives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('approvals')}
            className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Verify Submissions ({pendingSubmissions.length})</span>
          </button>
          <button
            onClick={() => onNavigate('wallet')}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-slate-950" />
            <span>My Wallet (₹{StorageEngine.getStaffWallet(currentUser.id).availableBalance.toLocaleString('en-IN')})</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 bg-[#F7F9FA] hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Submit DC Daily Report</span>
          </button>
        </div>
      </div>

      {/* Roster & Attendance KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Today's Assigned Team</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{districtStaff.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Coordinators, Callers & Field Techs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Attendance Logged</span>
          <p className="text-2xl font-bold text-[#16865D] mt-2">{presentStaff.length} Active</p>
          <p className="text-[11px] text-gray-400 mt-1">{districtStaff.length - presentStaff.length} not punched in</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Tasks in Progress</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">{districtTasks.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Calling batches & lead followups</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Submissions Awaiting Verification</span>
          <p className="text-2xl font-bold text-amber-600 mt-2">{pendingSubmissions.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Needs DC/DM approval</p>
        </div>
      </div>

      {/* Team Roster & Verification Queue Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: District Team Roster */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              District Team Roster & Attendance
            </h3>
            <span className="text-xs text-teal-700 font-semibold">{currentUser.districtName}</span>
          </div>

          <div className="divide-y divide-gray-100">
            {districtStaff.map((staff) => {
              const att = attendanceRecords.find(a => (a.staffId === staff.id || a.employeeId === staff.employeeId) && a.date === todayStr);
              const isPresent = att && att.status === 'present';

              return (
                <div key={staff.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{staff.fullName}</span>
                      <span className="text-[10px] font-mono text-gray-400">{staff.employeeId}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{staff.designationTitle}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isPresent ? `Present (${att.loginTime})` : 'Offline'}
                    </span>
                    <button
                      onClick={() => onNavigate('tasks')}
                      className="text-[11px] text-[#0F766E] hover:underline font-semibold"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Submissions Requiring Verification */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Submissions Awaiting Verification
            </h3>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs text-[#0F766E] font-semibold hover:underline"
            >
              Open Queue
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingSubmissions.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No pending submissions awaiting review.</p>
            ) : (
              pendingSubmissions.map((sub) => (
                <div key={sub.id} className="py-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{sub.employeeName}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-medium">
                      Under Review
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] line-clamp-1">{sub.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-400">Qty: {sub.completedQuantity} units</span>
                    <button
                      onClick={() => onNavigate('approvals')}
                      className="text-[10px] bg-[#0F766E] text-white px-2 py-0.5 rounded font-semibold hover:bg-[#123C45]"
                    >
                      Verify Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
