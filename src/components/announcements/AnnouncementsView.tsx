/**
 * STATEWIDE & DISTRICT ANNOUNCEMENTS - Section 20
 * Broadcasts operational notices, guidelines, and milestone targets.
 */

import React, { useState } from 'react';
import { Megaphone, Plus, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { StaffProfile, SystemAnnouncement } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface AnnouncementsViewProps {
  currentUser: StaffProfile;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ currentUser }) => {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(StorageEngine.getAnnouncements());
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const canPublish =
    currentUser.systemRole === 'super_admin' ||
    currentUser.systemRole === 'district_manager' ||
    currentUser.permissionLevel === 'admin' ||
    currentUser.permissionLevel === 'manager';

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    StorageEngine.createAnnouncement(
      {
        title: title.trim(),
        content: content.trim(),
        priority: priority,
        targetAudience: 'all',
        publishedByName: `${currentUser.fullName} (${currentUser.designationTitle})`,
        isActive: true
      },
      currentUser
    );

    setAnnouncements(StorageEngine.getAnnouncements());
    setIsPublishModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Executive Communication
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">Official Doorbly Broadcasts</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            System Announcements & Operational Directives
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Statewide guidelines, target milestones, and procedural notices for remote employees across Odisha.
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Directive</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((anc) => (
          <div
            key={anc.id}
            className={`bg-white rounded-xl border p-5 shadow-xs space-y-2.5 transition ${
              anc.priority === 'urgent'
                ? 'border-red-300 bg-red-50/10'
                : anc.priority === 'important'
                ? 'border-amber-300'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    anc.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : anc.priority === 'important'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {anc.priority} Notice
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 font-medium">Broadcast Audience: {anc.targetAudience.toUpperCase()}</span>
              </div>
              <span className="text-[11px] text-gray-400">
                {new Date(anc.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}
              </span>
            </div>

            <h3 className="text-sm font-bold text-gray-900">{anc.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed">{anc.content}</p>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Published by: <strong className="text-gray-800">{anc.publishedByName}</strong></span>
              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified State Order</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Publish Statewide Announcement</h3>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Daily Target Push for Khordha Cluster"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none uppercase"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Directive Details & Copy *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="State the instructions, deadlines, or operational expectations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
