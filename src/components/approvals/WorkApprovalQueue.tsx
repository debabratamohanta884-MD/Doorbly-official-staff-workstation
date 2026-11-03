/**
 * WORK APPROVAL VERIFICATION QUEUE - Section 14
 * Allows Supervisors, District Coordinators, District Managers, and Admins to
 * inspect evidence, verify deliverables, reject with mandatory reason, or approve and award productivity credits.
 * Enforces rule: Submitters / department heads cannot approve their own submissions.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Award,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import { StaffProfile, TaskSubmission, DailyTask } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface WorkApprovalQueueProps {
  currentUser: StaffProfile;
}

export const WorkApprovalQueue: React.FC<WorkApprovalQueueProps> = ({ currentUser }) => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const allSubmissions = StorageEngine.getSubmissions();
  const allTasks = StorageEngine.getDailyTasks();

  const filteredSubmissions = allSubmissions.filter((s) => {
    if (filterStatus === 'pending') return s.status === 'under_review' || s.status === 'submitted';
    if (filterStatus === 'approved') return s.status === 'approved';
    if (filterStatus === 'rejected') return s.status === 'rejected';
    return true;
  });

  const handleApprove = (submission: TaskSubmission) => {
    setActionError(null);
    setSuccessToast(null);

    // Rule 8 of Section 10: Department heads / submitters cannot approve their own work
    if (submission.staffId === currentUser.id) {
      setActionError('Self-approval violation: You cannot verify or approve your own submissions.');
      return;
    }

    try {
      StorageEngine.approveSubmission(submission.id, currentUser);
      setSuccessToast(`Successfully verified work for ${submission.employeeName}. Productivity credits awarded to ledger!`);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve submission.');
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSubId) return;
    setActionError(null);

    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setActionError('A specific rejection reason (min 5 characters) is mandatory.');
      return;
    }

    try {
      StorageEngine.rejectSubmission(rejectingSubId, currentUser, rejectionReason.trim());
      setSuccessToast('Submission rejected and returned to employee with required correction note.');
      setRejectingSubId(null);
      setRejectionReason('');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject submission.');
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Verification Engine
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{filteredSubmissions.length} Items</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Work Submission Verification & Credit Award Queue
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit evidence attachments, verify customer/booking references, and award verified internal productivity credits.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#F7F9FA] p-1 rounded-lg border border-gray-200 text-xs">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterStatus === 'pending'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Review ({allSubmissions.filter(s => s.status === 'under_review' || s.status === 'submitted').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterStatus === 'approved'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved ({allSubmissions.filter(s => s.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterStatus === 'rejected'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rejected ({allSubmissions.filter(s => s.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Alerts */}
      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Verification Queue Cards */}
      <div className="space-y-3.5">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-xs text-gray-500">
            No submissions found in this status queue.
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const task = allTasks.find((t) => t.id === sub.taskId);
            const isSelfSubmission = sub.staffId === currentUser.id;
            const isUnderReview = sub.status === 'under_review' || sub.status === 'submitted';
            const isApproved = sub.status === 'approved';
            const isRejected = sub.status === 'rejected';

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-[#F7F9FA] border border-gray-200 text-gray-700 px-2 py-0.5 rounded">
                        {task?.taskId || 'TSK-AUDIT'}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {sub.employeeName} ({sub.employeeId})
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        Submitted: {new Date(sub.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isRejected
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-800">
                      Task: {task?.taskTitle || 'Ad-hoc Task Deliverable'}
                    </h4>

                    <div className="bg-[#F7F9FA] rounded-lg p-3 border border-gray-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Completed Quantity: <strong className="text-gray-800">{sub.completedQuantity} activities</strong></span>
                        <span>Reference ID: <strong className="text-[#0F766E] font-mono">{sub.referenceId || 'N/A'}</strong></span>
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">
                        "{sub.description}"
                      </p>
                    </div>

                    {/* Evidence Document Preview link */}
                    <div className="flex items-center space-x-2 pt-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600 font-medium">
                        Evidence Attached: <strong className="text-gray-800">{sub.evidenceFileName || 'evidence.pdf'}</strong>
                      </span>
                      <button
                        onClick={() => alert(`Opening verified evidence viewer for file: ${sub.evidenceFileName || 'evidence.pdf'}`)}
                        className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center space-x-1"
                      >
                        <span>Inspect Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {isRejected && sub.rejectionReason && (
                      <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                        <strong>Rejection Reason Recorded:</strong> {sub.rejectionReason}
                      </div>
                    )}

                    {isApproved && (
                      <div className="text-[11px] text-gray-500">
                        Verified by <strong className="text-gray-800">{sub.approvedByName}</strong> • Credits Awarded: <strong className="text-emerald-700 font-bold">+₹{sub.awardedCredits}</strong>
                      </div>
                    )}
                  </div>

                  {/* Verification Actions */}
                  {isUnderReview && (
                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 md:self-center">
                      {isSelfSubmission ? (
                        <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 font-medium max-w-xs text-center">
                          Self-approval prevented by policy. Your DC or DM must verify this work.
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setRejectingSubId(sub.id);
                              setRejectionReason('');
                            }}
                            className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-300 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject with Reason</span>
                          </button>
                          <button
                            onClick={() => handleApprove(sub)}
                            className="w-full sm:w-auto px-4 py-2 bg-[#16865D] hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify & Award Credits</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {rejectingSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900">Mandatory Discrepancy Reason</h3>
              </div>
              <button onClick={() => setRejectingSubId(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-5 space-y-3.5 text-xs">
              <p className="text-gray-600 leading-relaxed">
                As per Section 14, rejected tasks must contain a transparent, actionable reason explaining the discrepancy (missing call recording, unreachable customer, or unsupported evidence).
              </p>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Rejection Reason (Audit Trail) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Call logs show only 12 calls connected instead of target 20, or booking reference DBL-BK-8891 could not be validated."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingSubId(null)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
