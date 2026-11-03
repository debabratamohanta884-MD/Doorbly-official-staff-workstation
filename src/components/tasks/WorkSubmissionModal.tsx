/**
 * WORK SUBMISSION MODAL - Section 11
 * Form to submit work evidence, reference IDs (booking/lead), activity quantity,
 * and description for supervisor verification.
 */

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { DailyTask, StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface WorkSubmissionModalProps {
  task: DailyTask;
  currentUser: StaffProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const WorkSubmissionModal: React.FC<WorkSubmissionModalProps> = ({
  task,
  currentUser,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const [completedQuantity, setCompletedQuantity] = useState<number>(task.targetQuantity || 1);
  const [referenceId, setReferenceId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [fileName, setFileName] = useState<string>('call_log_evidence.pdf');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (completedQuantity <= 0) {
      setErrorMsg('Please specify a valid completed activity quantity greater than 0.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Please provide a descriptive explanation of completed work (minimum 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      StorageEngine.submitWork(
        {
          taskId: task.id,
          completedQuantity,
          referenceId: referenceId.trim() || undefined,
          description: description.trim(),
          evidenceUrl: `https://workstation.doorbly.com/evidence/${encodeURIComponent(fileName)}`,
          evidenceFileName: fileName
        },
        currentUser
      );
      setIsSubmitting(false);
      onSubmitted();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit task work.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // File size limit: 15MB
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('Evidence file size must not exceed 15MB.');
        return;
      }
      setFileName(file.name);
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] bg-teal-50 text-[#0F766E] border border-teal-200 px-1.5 py-0.5 rounded font-semibold">
                {task.taskId}
              </span>
              <span className="text-xs font-semibold text-gray-500">Work Submission</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{task.taskTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Completed Units / Activities *
              </label>
              <input
                type="number"
                min="1"
                required
                value={completedQuantity}
                onChange={(e) => setCompletedQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              />
              <span className="text-[10px] text-gray-400">Target was {task.targetQuantity} units</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Customer / Lead / Booking Ref
              </label>
              <input
                type="text"
                placeholder="e.g. DBL-BK-8891 or LD-1049"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-mono"
              />
              <span className="text-[10px] text-gray-400">Primary audit reference</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Work Description & Accomplishments *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the outcome of calls made, customer confirmations, partner KYC verified, or code commits deployed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Evidence Document / Screenshot (JPG, PNG, PDF up to 15MB)
            </label>
            <div className="border-2 border-dashed border-gray-200 hover:border-[#0F766E] rounded-lg p-3 text-center transition bg-[#F7F9FA]">
              <input
                type="file"
                id="evidence-upload"
                accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer block">
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">
                  {fileName ? `Attached: ${fileName}` : 'Click to attach evidence file'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Call logs, signed quotes, KYC documents or screenshots
                </p>
              </label>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Independent Verification Policy</p>
              <p className="text-teal-700 text-[10px]">
                Upon submission, this record moves to your District Coordinator / Department Head for review. Productivity credits are awarded only after approval.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md transition shadow-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Submit to Approval Chain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
