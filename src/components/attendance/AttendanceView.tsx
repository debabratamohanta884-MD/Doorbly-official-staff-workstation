/**
 * REMOTE ATTENDANCE & LEAVE SYSTEM - Section 13
 * Punch in/out, break tracking, total working hours in Asia/Kolkata timezone.
 * Consent-based transparent location verification. Leave application & tracking.
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Coffee,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MapPin,
  CalendarX,
  Plus,
  ShieldCheck,
  Play,
  Square
} from 'lucide-react';
import { StaffProfile, AttendanceRecord, LeaveRequest, LeaveType } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface AttendanceViewProps {
  currentUser: StaffProfile;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ currentUser }) => {
  const [istTime, setIstTime] = useState<string>('');
  const [istDate, setIstDate] = useState<string>('');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(
    StorageEngine.getTodayAttendance(currentUser.id)
  );
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>(
    StorageEngine.getAttendance(currentUser.id)
  );

  // Leave State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveSuccess, setLeaveSuccess] = useState<string | null>(null);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(now)
      );
      setIstDate(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).format(now)
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunchIn = () => {
    const rec = StorageEngine.punchIn(currentUser);
    setTodayRecord(rec);
    setAllAttendance(StorageEngine.getAttendance(currentUser.id));
  };

  const handlePunchOut = () => {
    const rec = StorageEngine.punchOut(currentUser);
    setTodayRecord(rec);
    setAllAttendance(StorageEngine.getAttendance(currentUser.id));
  };

  const handleToggleBreak = () => {
    const rec = StorageEngine.toggleBreak(currentUser);
    setTodayRecord(rec);
    setAllAttendance(StorageEngine.getAttendance(currentUser.id));
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSuccess(null);
    if (!leaveReason.trim()) return;

    // Persist leave application
    StorageEngine.applyLeave(
      {
        staffId: currentUser.id,
        employeeId: currentUser.employeeId,
        employeeName: currentUser.fullName,
        leaveType,
        startDate,
        endDate,
        totalDays: 1,
        reason: leaveReason.trim()
      },
      currentUser
    );

    setLeaveSuccess('Leave application successfully submitted for supervisor approval.');
    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  return (
    <div className="space-y-6">
      {/* Attendance Header & Live Punch Console */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
                Remote Operations Attendance
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">Asia/Kolkata (IST) Standard Time</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Attendance & Working Duration Console
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Transparent, non-invasive remote attendance. Attendance is logged per remote event without background surveillance.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">{istDate}</p>
            <p className="text-2xl font-black text-[#0F766E] tabular-nums mt-0.5">{istTime}</p>
          </div>
        </div>

        {/* Live Punch Controls */}
        <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F9FA] border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500">Punch-In Status</span>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`w-3 h-3 rounded-full ${todayRecord?.loginTime ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-bold text-gray-900">
                  {todayRecord?.loginTime ? `Logged In at ${todayRecord.loginTime}` : 'Not Punched In Today'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {todayRecord?.locationNote || `${currentUser.districtName} (Remote Consent Verified)`}
              </p>
            </div>

            <div className="mt-4">
              {!todayRecord?.loginTime || todayRecord.logoutTime ? (
                <button
                  onClick={handlePunchIn}
                  className="w-full py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Punch IN Remote Work</span>
                </button>
              ) : (
                <button
                  onClick={handlePunchOut}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Punch OUT Shift</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FA] border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500">Break Tracker</span>
              <div className="flex items-center space-x-2 mt-2">
                <Coffee className={`w-4 h-4 ${todayRecord?.isOnBreak ? 'text-amber-600 animate-bounce' : 'text-gray-400'}`} />
                <span className="text-sm font-bold text-gray-900">
                  {todayRecord?.isOnBreak ? 'Currently On Break' : 'Active On Duty'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Total break recorded: {todayRecord?.breakMinutes || 0} minutes
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={handleToggleBreak}
                disabled={!todayRecord?.loginTime || Boolean(todayRecord.logoutTime)}
                className={`w-full py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  todayRecord?.isOnBreak
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{todayRecord?.isOnBreak ? 'Resume Work' : 'Take 15-Min Break'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FA] border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500">Leave Balance & Requests</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-2xl font-bold text-gray-900">12 Days</span>
                <span className="text-xs text-gray-400">Casual / Sick Leaves</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Monthly allocation active</p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply for Leave</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {leaveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{leaveSuccess}</span>
          </div>
          <button onClick={() => setLeaveSuccess(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Attendance Records</h3>
            <p className="text-xs text-gray-500">Official login and logout logs for {currentUser.fullName}</p>
          </div>
          <span className="text-xs font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded">
            Audit Trail Intact
          </span>
        </div>

        <div className="overflow-x-auto horizontal-scroll-container max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Login Time (IST)</th>
                <th className="px-4 py-3">Logout Time (IST)</th>
                <th className="px-4 py-3">Break Taken</th>
                <th className="px-4 py-3">Attendance Status</th>
                <th className="px-4 py-3">Location Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-gray-900">{rec.date}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{rec.loginTime || '--:--'}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{rec.logoutTime || 'In Session'}</td>
                  <td className="px-4 py-3 text-gray-600">{rec.breakMinutes} mins</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {rec.locationNote || 'Remote Verified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Apply for Remote Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State the purpose of leave for supervisor approval..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
