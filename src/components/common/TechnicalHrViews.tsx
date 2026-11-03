/**
 * DEDICATED HR & TECHNICAL MANAGEMENT WORKSPACES - Section 12
 * HR: Recruitment pipeline, candidate screening, interviews, remote onboarding audits.
 * Technical: Workstation health, booking API verification, database monitoring, bug tracking.
 */

import React, { useState } from 'react';
import {
  Users,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Server,
  Terminal,
  FileCheck,
  Plus
} from 'lucide-react';
import { StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface HrManagementViewProps {
  currentUser: StaffProfile;
}

export const HrManagementView: React.FC<HrManagementViewProps> = ({ currentUser }) => {
  const staffList = StorageEngine.getStaffProfiles();
  const attendance = StorageEngine.getAttendance();

  const candidates = [
    { name: 'Debashis Panda', role: 'General Operations Tele Caller', district: 'Khordha', status: 'Interview Scheduled', score: 88 },
    { name: 'Archana Mohapatra', role: 'Customer Support Executive', district: 'Cuttack', status: 'Document Verification', score: 92 },
    { name: 'Santosh Kumar Sahu', role: 'District Coordinator', district: 'Puri', status: 'Screened & Qualified', score: 85 },
    { name: 'Rashmi Rekha Jena', role: 'HR Executive', district: 'Khordha', status: 'Onboarding Approved', score: 95 }
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              HR & Talent Division
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">Odisha Remote Staff</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Human Resources Management & Recruitment Pipeline
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Sourcing, pre-screening, interview scorecards, document verification, and remote attendance audits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Active Employee Roster</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{staffList.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Remote executives in Odisha</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Candidates in Pipeline</span>
          <p className="text-2xl font-bold text-[#0F766E] mt-2">{candidates.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Screening & interviews</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Attendance Audit Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">98.4%</p>
          <p className="text-[11px] text-gray-400 mt-1">Non-invasive punch integrity</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Approved Onboardings</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">12 This Month</p>
          <p className="text-[11px] text-gray-400 mt-1">Target 15 remote hires</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Active Recruitment Pipeline</h3>
          <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
            Section 10 HR Value Master
          </span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Applied Designation</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Recruitment Stage</th>
              <th className="px-4 py-3 text-center">Screening Score</th>
              <th className="px-4 py-3 text-right">HR Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {candidates.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50/60 transition">
                <td className="px-4 py-3 font-bold text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-700">{c.role}</td>
                <td className="px-4 py-3 text-gray-600">{c.district}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-bold text-[#16865D]">{c.score}%</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-[#0F766E] font-semibold hover:underline">
                    Conduct Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TechnicalManagementViewProps {
  currentUser: StaffProfile;
}

export const TechnicalManagementView: React.FC<TechnicalManagementViewProps> = ({ currentUser }) => {
  const healthChecks = [
    { service: 'Workstation React App (Vite)', status: 'Operational', latency: '24ms', uptime: '99.98%' },
    { service: 'Supabase PostgreSQL Database', status: 'Active (23 Tables)', latency: '38ms', uptime: '100%' },
    { service: 'Firebase Authentication Auth SDK', status: 'Operational', latency: '45ms', uptime: '99.95%' },
    { service: 'Doorbly Booking Realtime Dispatch API', status: 'Operational', latency: '52ms', uptime: '99.91%' },
    { service: 'Work Credits Ledger Integrity Auditor', status: 'Operational', latency: '12ms', uptime: '100%' }
  ];

  const devTasks = [
    { code: 'TECH-401', title: 'Supabase Realtime WebSocket Listener for Submissions', type: 'Database / API', credits: 150, status: 'Testing' },
    { code: 'TECH-402', title: 'Zero-Pill Typography & Contrast Hardening for Windows Clients', type: 'UI / UX', credits: 100, status: 'In Review' },
    { code: 'TECH-403', title: 'PostgreSQL Foreign Key Cascade Safety on Reversals', type: 'Database Migration', credits: 150, status: 'Approved' }
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Technology & Platform
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">workstation.doorbly.com</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Technical Systems & Engineering Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Platform health monitoring, booking flow verification, Supabase migrations, and web development tasks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide pb-2 border-b border-gray-100 flex items-center justify-between">
            <span>System Health Checks</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">All Systems Normal</span>
          </h3>
          <div className="divide-y divide-gray-100 text-xs">
            {healthChecks.map((h, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{h.service}</p>
                  <p className="text-[10px] text-gray-400">Latency: {h.latency} • Uptime: {h.uptime}</p>
                </div>
                <span className="text-[10px] font-bold text-[#16865D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Development Sprints */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide pb-2 border-b border-gray-100 flex items-center justify-between">
            <span>Engineering Sprints</span>
            <span className="text-[10px] text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded font-bold">Sprint 26.4</span>
          </h3>
          <div className="divide-y divide-gray-100 text-xs">
            {devTasks.map((t) => (
              <div key={t.code} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold bg-gray-100 px-1.5 py-0.2 rounded text-gray-700">
                      {t.code}
                    </span>
                    <span className="font-semibold text-gray-900 text-xs">{t.title}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{t.type} • Value: ₹{t.credits} Credits</p>
                </div>
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
