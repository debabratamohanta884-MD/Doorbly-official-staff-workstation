/**
 * PERSONALIZED EMPLOYEE DASHBOARD
 * Displays personalized metrics, assigned tasks, approved productivity credits,
 * target achievement %, announcements, and upcoming deadlines.
 */

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Send,
  CheckSquare,
  AlertTriangle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { StaffProfile, DailyTask, TaskSubmission, WorkCreditEntry, SystemAnnouncement } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { ActiveTab } from '../layout/Sidebar';

interface EmployeeDashboardProps {
  currentUser: StaffProfile;
  onNavigate: (tab: ActiveTab) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ currentUser, onNavigate }) => {
  const tasks = StorageEngine.getDailyTasks({ staffId: currentUser.id });
  const submissions = StorageEngine.getSubmissions().filter(s => s.staffId === currentUser.id);
  const credits = StorageEngine.getWorkCredits(currentUser.id);
  const attendance = StorageEngine.getTodayAttendance(currentUser.id);
  const announcements = StorageEngine.getAnnouncements();

  // Metrics
  const assignedTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'submitted' || t.status === 'approved').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  const totalCreditsEarned = credits.reduce((sum, c) => sum + c.totalCredits, 0);
  const totalAssignedCredits = tasks.reduce((sum, t) => sum + t.taskValueCredit, 0);

  // Performance Score: Approved Credits / Assigned Credits * 100
  const performanceScore = totalAssignedCredits > 0
    ? Math.min(100, Math.round((totalCreditsEarned / totalAssignedCredits) * 100))
    : 100;

  const getScoreClassification = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 75) return { label: 'Good', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    if (score >= 60) return { label: 'Needs Improvement', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (score >= 40) return { label: 'Poor', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200' };
  };

  const perfRating = getScoreClassification(performanceScore);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              {currentUser.departmentName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-mono text-gray-500">{currentUser.employeeId}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Designation: <span className="font-semibold text-gray-700">{currentUser.designationTitle}</span> | District: <span className="font-semibold text-gray-700">{currentUser.districtName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>View Assigned Tasks</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 bg-[#F7F9FA] hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Attendance Status: {attendance?.status.toUpperCase() || 'NOT PUNCHED'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Assigned Tasks</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{assignedTasksCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Today's active pipeline</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Completed / Under Review</span>
            <CheckCircle2 className="w-4 h-4 text-[#16865D]" />
          </div>
          <p className="text-2xl font-bold text-[#16865D] mt-2">{completedTasksCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">{pendingTasksCount} pending action</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Rejected Submissions</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">{rejectedCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Requires re-submission</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Productivity Credits</span>
            <Award className="w-4 h-4 text-[#0F766E]" />
          </div>
          <p className="text-2xl font-bold text-[#0F766E] mt-2">₹{totalCreditsEarned}</p>
          <p className="text-[11px] text-gray-400 mt-1">Approved ledger credits</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Performance Score</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <p className="text-2xl font-bold text-gray-900">{performanceScore}%</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${perfRating.color}`}>
              {perfRating.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Approved / Assigned Work</p>
        </div>
      </div>

      {/* Two Column Layout: Active Tasks vs Announcements & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Assigned Tasks List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Today's Assigned Tasks</h2>
                <p className="text-xs text-gray-500">Review deliverables, deadlines, and submission requirements</p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-[#0F766E] hover:underline font-semibold flex items-center space-x-1"
              >
                <span>All Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No tasks currently assigned for today. Contact your District Coordinator ({currentUser.reportingManagerName || 'Supervisor'}).
                </div>
              ) : (
                tasks.map((task) => {
                  const isSubmitted = task.status === 'submitted' || task.status === 'under_review';
                  const isApproved = task.status === 'approved';
                  const isRejected = task.status === 'rejected';

                  return (
                    <div key={task.id} className="p-4 hover:bg-gray-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                            {task.taskId}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            task.priority === 'critical' ? 'bg-red-50 text-red-600 border border-red-200' :
                            task.priority === 'high' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs font-semibold text-[#0F766E]">
                            ₹{task.taskValueCredit} Credits
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">{task.taskTitle}</h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{task.taskDescription}</p>
                        <p className="text-[10px] text-gray-400">
                          Deadline: {new Date(task.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • Target: {task.targetQuantity} units
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {isApproved ? (
                          <span className="text-[11px] font-bold text-[#16865D] bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        ) : isSubmitted ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Under Review
                          </span>
                        ) : isRejected ? (
                          <button
                            onClick={() => onNavigate('submissions')}
                            className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition"
                          >
                            Re-submit
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate('submissions')}
                            className="text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#123C45] px-3 py-1.5 rounded transition flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Submit Work</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Important Announcements & Work Credit Ledger Snapshot */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Important Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                State & District Announcements
              </h3>
              <span className="text-[10px] text-[#0F766E] font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                Odisha HQ
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              {announcements.map((anc) => (
                <div key={anc.id} className="p-2.5 rounded-lg bg-[#F7F9FA] border border-gray-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-xs">{anc.title}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      anc.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {anc.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">{anc.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">{anc.publishedByName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Credits Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Recent Work Credits
                </h3>
                <p className="text-[10px] text-gray-400">Awarded after supervisor verification</p>
              </div>
              <button
                onClick={() => onNavigate('work_credits')}
                className="text-xs text-[#0F766E] font-semibold hover:underline"
              >
                View Ledger
              </button>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {credits.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">No credits awarded yet.</p>
              ) : (
                credits.slice(0, 3).map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-gray-800 line-clamp-1">{c.taskDescription}</p>
                      <p className="text-[10px] text-gray-500">Verified by {c.approverName}</p>
                    </div>
                    <span className="text-xs font-bold text-[#16865D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-2 shrink-0">
                      +₹{c.totalCredits}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
