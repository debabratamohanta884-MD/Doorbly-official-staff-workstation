/**
 * PERFORMANCE ANALYTICS & SCORECARD - Section 19
 * Score formula: Approved Work Credits ÷ Assigned Work Credits × 100
 * Score tiers: Excellent (90-100%), Good (75-89%), Needs Improvement (60-74%), Poor (40-59%), Critical (<40%)
 */

import React from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface MyPerformanceViewProps {
  currentUser: StaffProfile;
}

export const MyPerformanceView: React.FC<MyPerformanceViewProps> = ({ currentUser }) => {
  const tasks = StorageEngine.getDailyTasks({ staffId: currentUser.id });
  const submissions = StorageEngine.getSubmissions().filter(s => s.staffId === currentUser.id);
  const credits = StorageEngine.getWorkCredits(currentUser.id);

  const assignedTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'submitted' || t.status === 'approved').length;
  const approvedTasksCount = tasks.filter(t => t.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  const totalAssignedCredits = tasks.reduce((sum, t) => sum + t.taskValueCredit, 0);
  const totalApprovedCredits = credits.reduce((sum, c) => sum + c.totalCredits, 0);

  // Performance Score calculation: Approved Credits ÷ Assigned Credits × 100
  const scoreRaw = totalAssignedCredits > 0
    ? Math.round((totalApprovedCredits / totalAssignedCredits) * 100)
    : 100;
  const performanceScore = Math.min(100, scoreRaw);

  const getScoreClassification = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Top tier productivity consistency.' };
    if (score >= 75) return { label: 'Good', color: 'bg-teal-50 text-teal-700 border-teal-200', text: 'Solid delivery meeting all primary deliverables.' };
    if (score >= 60) return { label: 'Needs Improvement', color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Moderate task conversion rate, attention required.' };
    if (score >= 40) return { label: 'Poor', color: 'bg-orange-50 text-orange-700 border-orange-200', text: 'Significant volume of pending/rejected submissions.' };
    return { label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200', text: 'Urgent performance escalation with District Coordinator.' };
  };

  const classification = getScoreClassification(performanceScore);

  // Weekly Trend Chart Data
  const weeklyData = [
    { day: 'Mon', assignedCredits: 220, approvedCredits: 200 },
    { day: 'Tue', assignedCredits: 240, approvedCredits: 230 },
    { day: 'Wed', assignedCredits: 210, approvedCredits: 190 },
    { day: 'Thu', assignedCredits: 250, approvedCredits: 240 },
    { day: 'Fri', assignedCredits: 230, approvedCredits: 210 },
    { day: 'Sat', assignedCredits: 180, approvedCredits: 180 },
    { day: 'Sun', assignedCredits: 120, approvedCredits: 120 }
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Performance Scorecard
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{currentUser.designationTitle}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Employee Productivity & Output Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Objective work measurement calculated via verified evidence and approved credit ledger.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#F7F9FA] p-3 px-5 rounded-xl border border-gray-200">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Official Performance Score
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-gray-900">{performanceScore}%</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${classification.color}`}>
                {classification.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Assigned Work Credits</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalAssignedCredits}</p>
          <p className="text-[11px] text-gray-400 mt-1">{assignedTasksCount} total tasks allocated</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Approved Work Credits</span>
          <p className="text-2xl font-bold text-[#16865D] mt-2">₹{totalApprovedCredits}</p>
          <p className="text-[11px] text-gray-400 mt-1">{approvedTasksCount} verified task rounds</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Task Completion Rate</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {assignedTasksCount > 0 ? Math.round((completedTasksCount / assignedTasksCount) * 100) : 100}%
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{completedTasksCount} / {assignedTasksCount} tasks submitted</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Quality / Rejection Rate</span>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {submissions.length > 0 ? Math.round((rejectedCount / submissions.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{rejectedCount} rejections requiring fix</p>
        </div>
      </div>

      {/* Chart: Assigned Credits vs Approved Credits */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Weekly Productivity Velocity</h3>
            <p className="text-xs text-gray-500">Assigned Credits vs Approved Ledger Credits (INR Value)</p>
          </div>
          <span className="text-xs text-[#0F766E] font-semibold bg-teal-50 px-2 py-0.5 rounded">
            Past 7 Days
          </span>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="assignedCredits" name="Assigned Credits" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approvedCredits" name="Approved Credits" fill="#0F766E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Official Rating Criteria Guide */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide pb-3 border-b border-gray-100">
          Official Doorbly Performance Classification Standards (Section 19)
        </h3>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <span className="font-bold text-emerald-800">90 – 100%</span>
            <p className="font-semibold text-emerald-900 mt-1">Excellent</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">High accuracy and top target achievement.</p>
          </div>

          <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/50">
            <span className="font-bold text-teal-800">75 – 89%</span>
            <p className="font-semibold text-teal-900 mt-1">Good</p>
            <p className="text-[10px] text-teal-700 mt-0.5">Consistently meets assigned quota and timeline.</p>
          </div>

          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <span className="font-bold text-amber-800">60 – 74%</span>
            <p className="font-semibold text-amber-900 mt-1">Needs Improvement</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Submissions delayed or partially unverified.</p>
          </div>

          <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50">
            <span className="font-bold text-orange-800">40 – 59%</span>
            <p className="font-semibold text-orange-900 mt-1">Poor</p>
            <p className="text-[10px] text-orange-700 mt-0.5">Significant gap between assigned and approved units.</p>
          </div>

          <div className="p-3 rounded-lg border border-red-200 bg-red-50/50">
            <span className="font-bold text-red-800">Below 40%</span>
            <p className="font-semibold text-red-900 mt-1">Critical</p>
            <p className="text-[10px] text-red-700 mt-0.5">Requires immediate supervisor intervention & review.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
