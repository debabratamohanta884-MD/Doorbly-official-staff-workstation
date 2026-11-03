/**
 * TASK ASSIGNMENT MODAL - Section 9 & 10
 * For Admin, DM, and DC to create and assign tasks to remote employees
 * using the official Task Value Master templates.
 */

import React, { useState } from 'react';
import { X, CheckSquare, Plus, Award, AlertCircle } from 'lucide-react';
import { StaffProfile, TaskPriority } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface TaskAssignmentModalProps {
  currentUser: StaffProfile;
  isOpen: boolean;
  onClose: () => void;
  onTaskAssigned: () => void;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onTaskAssigned
}) => {
  const allStaff = StorageEngine.getStaffProfiles();
  const taskMaster = StorageEngine.getTaskValueMaster();

  const [selectedStaffId, setSelectedStaffId] = useState<string>(allStaff[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskCreditValue, setTaskCreditValue] = useState<number>(50);
  const [targetQuantity, setTargetQuantity] = useState<number>(5);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState<string>(
    new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [evidenceType, setEvidenceType] = useState<'document' | 'call_log' | 'lead_id' | 'booking_id' | 'screenshot'>('call_log');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetStaff = allStaff.find(s => s.id === selectedStaffId) || allStaff[0];

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = taskMaster.find(t => t.id === templateId);
    if (tmpl) {
      setTaskTitle(`${tmpl.activityName} - ${targetStaff.districtName}`);
      setTaskDescription(tmpl.description);
      setTaskCreditValue(tmpl.creditValue);
      setTargetQuantity(tmpl.defaultDailyQuota);
    }
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!taskTitle.trim()) {
      setErrorMsg('Please specify a task title.');
      return;
    }

    try {
      StorageEngine.createDailyTask(
        {
          staffId: targetStaff.id,
          employeeId: targetStaff.employeeId,
          employeeName: targetStaff.fullName,
          departmentId: targetStaff.departmentId,
          designationId: targetStaff.designationId,
          districtId: targetStaff.districtId,
          taskTitle: taskTitle.trim(),
          taskDescription: taskDescription.trim(),
          taskValueCredit: taskCreditValue * targetQuantity,
          targetQuantity: targetQuantity,
          priority: priority,
          assignedDate: new Date().toISOString().slice(0, 10),
          deadline: new Date(deadline).toISOString(),
          requiredEvidenceType: evidenceType,
          assignedByStaffId: currentUser.id,
          assignedByName: currentUser.fullName
        },
        currentUser
      );

      onTaskAssigned();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-[#0F766E] text-white flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Assign Daily Task</h3>
              <p className="text-[11px] text-gray-500">Allocate work to remote employee across Odisha</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-5 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Select Employee *</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
            >
              {allStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName} ({staff.employeeId}) • {staff.designationTitle} [{staff.districtName}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Task Value Master Template (Section 10 Standard)
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
            >
              <option value="">-- Choose standard activity template --</option>
              {taskMaster.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.designationTitle}: {tmpl.activityName} (₹{tmpl.creditValue} credits / {tmpl.quotaUnit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Outbound Customer Calling Batch - Sector 9"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Task Description & Instructions</label>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Provide specific guidelines, cluster localities, or target metrics..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Per-Unit Credits</label>
              <input
                type="number"
                min="1"
                value={taskCreditValue}
                onChange={(e) => setTaskCreditValue(parseInt(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Target Quantity</label>
              <input
                type="number"
                min="1"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Total Task Credits</label>
              <div className="px-2.5 py-1.5 bg-[#F7F9FA] border border-gray-200 rounded-md font-bold text-[#0F766E]">
                ₹{taskCreditValue * targetQuantity}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none uppercase text-xs"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Evidence Required</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
              >
                <option value="call_log">Call Log / Connected Records</option>
                <option value="booking_id">Booking ID Confirmation</option>
                <option value="lead_id">Lead ID in CRM</option>
                <option value="document">Document / PDF Upload</option>
                <option value="screenshot">Screenshot Proof</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Completion Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
            >
              Assign Task Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
