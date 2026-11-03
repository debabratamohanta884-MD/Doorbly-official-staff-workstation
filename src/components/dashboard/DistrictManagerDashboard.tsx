/**
 * DISTRICT MANAGER (DM) DASHBOARD - Section 15
 * Displays district target, actual service subtotal, revenue gap, team attendance,
 * lead pipeline, corporate B2B contracts, partner availability, and payment reconciliation.
 */

import React from 'react';
import {
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  Briefcase,
  DollarSign,
  CalendarCheck,
  Building,
  UserCheck,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { StaffProfile, DistrictMaster } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { ActiveTab } from '../layout/Sidebar';

interface DistrictManagerDashboardProps {
  currentUser: StaffProfile;
  onNavigate: (tab: ActiveTab) => void;
}

export const DistrictManagerDashboard: React.FC<DistrictManagerDashboardProps> = ({
  currentUser,
  onNavigate
}) => {
  const districts = StorageEngine.getDistricts();
  // Find current district or fallback to first
  const currentDistrict = districts.find(d => d.id === currentUser.districtId) || districts[0];
  
  const allStaffInDistrict = StorageEngine.getStaffProfiles().filter(s => s.districtId === currentDistrict.id);
  const districtBookings = StorageEngine.getBookings().filter(b => b.districtId === currentDistrict.id);
  const districtLeads = StorageEngine.getLeads().filter(l => l.districtId === currentDistrict.id);
  const corpProspects = StorageEngine.getCorporateProspects().filter(c => c.districtId === currentDistrict.id);
  const districtPartners = StorageEngine.getPartners().filter(p => p.districtId === currentDistrict.id);
  const attendanceRecords = StorageEngine.getAttendance();

  // Calculations
  const target = currentDistrict.dailyTarget;
  const actualSubtotal = districtBookings
    .filter(b => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.serviceSubtotal, 0);
  const pendingGap = Math.max(0, target - actualSubtotal);
  const achievementPct = Math.min(100, Math.round((actualSubtotal / target) * 100));

  // Attendance
  const todayStr = new Date().toISOString().slice(0, 10);
  const presentCount = allStaffInDistrict.filter(s => {
    const att = attendanceRecords.find(a => (a.staffId === s.id || a.employeeId === s.employeeId) && a.date === todayStr);
    return att && att.status === 'present';
  }).length;

  return (
    <div className="space-y-6">
      {/* District Header */}
      <div className="bg-[#123C45] text-white rounded-xl p-5 border border-teal-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E] text-white">
              District Manager Console
            </span>
            <span className="text-xs text-teal-300">Odisha Division</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            {currentDistrict.name} District Operations
          </h1>
          <p className="text-xs text-teal-100/80 mt-0.5">
            District Manager: <span className="font-semibold text-white">{currentUser.fullName}</span> | Target Allocation: ₹{target.toLocaleString('en-IN')} / Day
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('district_revenue')}
            className="px-3.5 py-2 bg-[#0F766E] hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Statewide 30 Districts Leaderboard</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 border border-white/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>District Daily Report</span>
          </button>
        </div>
      </div>

      {/* Target & Revenue Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Daily District Target</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{target.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">Completed service subtotal goal</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Actual Completed Subtotal</span>
          <p className="text-2xl font-bold text-[#16865D] mt-2">₹{actualSubtotal.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">{achievementPct}% of daily allocation achieved</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Pending Target Gap</span>
          <p className={`text-2xl font-bold mt-2 ${pendingGap === 0 ? 'text-[#16865D]' : 'text-amber-600'}`}>
            ₹{pendingGap.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Required to meet ₹1L statewide target</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">District Team Attendance</span>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-2xl font-bold text-gray-900">{presentCount}</span>
            <span className="text-sm font-semibold text-gray-400">/ {allStaffInDistrict.length}</span>
            <span className="text-xs font-semibold text-[#16865D] ml-2">Present</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Verified remote login</p>
        </div>
      </div>

      {/* 2-Column: Pipeline Overview & Booking Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: District Pipeline Status */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                District Pipeline Funnel
              </h3>
              <span className="text-xs text-[#0F766E] font-semibold">{currentDistrict.name}</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FA] border border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Active Customer Leads</p>
                    <p className="text-[10px] text-gray-500">Residential inquiries in progress</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{districtLeads.length} Leads</span>
                  <button onClick={() => onNavigate('leads')} className="block text-[10px] text-[#0F766E] hover:underline font-semibold">
                    Inspect
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FA] border border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <Building className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Corporate B2B Contracts</p>
                    <p className="text-[10px] text-gray-500">Institutions, IT parks & hospitals</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{corpProspects.length} Deals</span>
                  <button onClick={() => onNavigate('corporate_crm')} className="block text-[10px] text-[#0F766E] hover:underline font-semibold">
                    Inspect
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FA] border border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Partner Capacity</p>
                    <p className="text-[10px] text-gray-500">Verified technicians & contractors</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{districtPartners.length} Partners</span>
                  <button onClick={() => onNavigate('partners')} className="block text-[10px] text-[#0F766E] hover:underline font-semibold">
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Monitoring & Reconciliation */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                Booking Status & Commission Reconciliation
              </h3>
              <button
                onClick={() => onNavigate('bookings')}
                className="text-xs text-[#0F766E] font-semibold hover:underline"
              >
                All Bookings
              </button>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {districtBookings.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No bookings registered for {currentDistrict.name} today.</p>
              ) : (
                districtBookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          {b.bookingCode}
                        </span>
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                          b.bookingStatus === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 text-xs mt-1">{b.serviceTitle}</p>
                      <p className="text-[10px] text-gray-500">
                        Customer: {b.customerName} • Partner: {b.assignedPartnerName || 'Unassigned'}
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold text-gray-900 text-xs">₹{b.serviceSubtotal}</p>
                      <p className="text-[10px] text-teal-700 font-medium">Doorbly: ₹{b.doorblyCommission} (20%)</p>
                      <p className="text-[10px] text-gray-400">Payout: ₹{b.partnerPayout}</p>
                    </div>
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
