/**
 * MY DAILY TASKS VIEW - Section 11
 * Displays assigned tasks, priority, deadlines, credit values, start task, and work submission.
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Play,
  Send,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { DailyTask, StaffProfile, TaskPriority, TaskStatus } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { WorkSubmissionModal } from './WorkSubmissionModal';
import { TaskAssignmentModal } from './TaskAssignmentModal';

interface MyTasksViewProps {
  currentUser: StaffProfile;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({ currentUser }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubmissionTask, setActiveSubmissionTask] = useState<DailyTask | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const canAssign =
    currentUser.systemRole === 'super_admin' ||
    currentUser.systemRole === 'district_manager' ||
    currentUser.systemRole === 'district_coordinator' ||
    currentUser.permissionLevel === 'admin' ||
    currentUser.permissionLevel === 'manager' ||
    currentUser.permissionLevel === 'coordinator';

  // If user is Admin or Manager, show all or filtered; regular employee sees their tasks
  const isSupervisor = currentUser.permissionLevel === 'admin' || currentUser.systemRole === 'district_manager';
  const allTasks = isSupervisor
    ? StorageEngine.getDailyTasks()
    : StorageEngine.getDailyTasks({ staffId: currentUser.id });

  const filteredTasks = allTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.taskTitle.toLowerCase().includes(q) ||
        t.taskId.toLowerCase().includes(q) ||
        t.employeeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartTask = (taskId: string) => {
    StorageEngine.updateTaskStatus(taskId, 'in_progress');
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Task Engine
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{filteredTasks.length} Tasks Listed</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {isSupervisor ? 'Daily Task Allocation & Management' : 'My Daily Tasks & Operations'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Execute assigned deliverables, maintain activity counts, and submit verifiable evidence.
          </p>
        </div>

        {canAssign && (
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Task ID, title, or employee..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none uppercase"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3 max-h-[720px] overflow-y-auto custom-scrollbar pr-1">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-xs text-gray-500">
            No daily tasks match the selected criteria.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isAssigned = task.status === 'assigned';
            const isInProgress = task.status === 'in_progress';
            const isSubmitted = task.status === 'submitted' || task.status === 'under_review';
            const isApproved = task.status === 'approved';
            const isRejected = task.status === 'rejected';

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-gray-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-[#F7F9FA] border border-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {task.taskId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        task.priority === 'critical'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : task.priority === 'high'
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-xs font-bold text-[#0F766E]">
                      ₹{task.taskValueCredit} Credits
                    </span>
                    <span className="text-[11px] text-gray-400">
                      ({task.targetQuantity} units target)
                    </span>
                    {isSupervisor && (
                      <span className="text-[10px] bg-teal-50 text-[#0F766E] px-2 py-0.5 rounded font-medium">
                        Assignee: {task.employeeName} ({task.employeeId})
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900">{task.taskTitle}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{task.taskDescription}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Deadline: {new Date(task.deadline).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}</span>
                    </span>
                    <span>•</span>
                    <span>Evidence: <strong className="text-gray-600 capitalize">{task.requiredEvidenceType}</strong></span>
                    <span>•</span>
                    <span>Assigned By: {task.assignedByName}</span>
                  </div>
                </div>

                {/* Right Status & Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0 md:self-center">
                  {isApproved && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#16865D] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16865D]" />
                        <span>Work Approved (+₹{task.taskValueCredit})</span>
                      </span>
                    </div>
                  )}

                  {isSubmitted && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      Under Supervisor Review
                    </span>
                  )}

                  {isRejected && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                        Rejected
                      </span>
                      <button
                        onClick={() => setActiveSubmissionTask(task)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition"
                      >
                        Re-Submit
                      </button>
                    </div>
                  )}

                  {isAssigned && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition flex items-center space-x-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Task</span>
                    </button>
                  )}

                  {(isAssigned || isInProgress) && (
                    <button
                      onClick={() => setActiveSubmissionTask(task)}
                      className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-md transition flex items-center space-x-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Work</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {activeSubmissionTask && (
        <WorkSubmissionModal
          task={activeSubmissionTask}
          currentUser={currentUser}
          isOpen={Boolean(activeSubmissionTask)}
          onClose={() => setActiveSubmissionTask(null)}
          onSubmitted={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* Task Assignment Modal */}
      {isAssignModalOpen && (
        <TaskAssignmentModal
          currentUser={currentUser}
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onTaskAssigned={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
};
