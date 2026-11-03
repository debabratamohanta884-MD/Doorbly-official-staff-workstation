/**
 * 30 DISTRICTS REVENUE TARGET MANAGEMENT - Section 8 & Section 18
 * Combined Statewide Target: ₹1,00,000 across all 30 districts of Odisha.
 * Displays Target, Completed Subtotal, Pending Gap, Achievement %, Bookings, Avg Ticket, and Ranking.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Trophy,
  Edit2,
  Check,
  X,
  Search,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { DistrictMaster, StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { TOTAL_DAILY_STATEWIDE_TARGET } from '../../constants/districts';

interface DistrictRevenueViewProps {
  currentUser: StaffProfile;
}

export const DistrictRevenueView: React.FC<DistrictRevenueViewProps> = ({ currentUser }) => {
  const [districts, setDistricts] = useState<DistrictMaster[]>(StorageEngine.getDistricts());
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | '1' | '2' | '3'>('all');

  const isAdmin = currentUser.systemRole === 'super_admin' || currentUser.permissionLevel === 'admin';

  // Overall totals
  const totalStatewideTarget = districts.reduce((sum, d) => sum + d.dailyTarget, 0);
  const totalStatewideActual = districts.reduce((sum, d) => sum + d.actualCompletedSubtotal, 0);
  const totalStatewidePending = Math.max(0, totalStatewideTarget - totalStatewideActual);
  const statewideAchievementPct = totalStatewideTarget > 0
    ? Math.min(100, Math.round((totalStatewideActual / totalStatewideTarget) * 100))
    : 0;
  const totalBookings = districts.reduce((sum, d) => sum + d.completedBookingsCount, 0);

  // Sort districts by actual completed subtotal to compute live rankings
  const rankedDistricts = [...districts].sort((a, b) => b.actualCompletedSubtotal - a.actualCompletedSubtotal);

  const filteredDistricts = rankedDistricts.filter((d) => {
    if (selectedTier !== 'all' && d.tier !== parseInt(selectedTier)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return d.name.toLowerCase().includes(q) || (d.managerName && d.managerName.toLowerCase().includes(q));
    }
    return true;
  });

  const handleStartEdit = (d: DistrictMaster) => {
    setEditingDistrictId(d.id);
    setEditTargetValue(d.dailyTarget);
  };

  const handleSaveTarget = (districtId: string) => {
    StorageEngine.updateDistrictTarget(districtId, editTargetValue, currentUser);
    setDistricts(StorageEngine.getDistricts());
    setEditingDistrictId(null);
  };

  return (
    <div className="space-y-6">
      {/* Statewide Target Headline Banner */}
      <div className="bg-[#123C45] text-white rounded-xl p-5 border border-teal-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E] text-white">
              Statewide Revenue Milestone
            </span>
            <span className="text-xs text-teal-300">All 30 Odisha Districts</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Daily Statewide Target: ₹{totalStatewideTarget.toLocaleString('en-IN')}
          </h1>
          <p className="text-xs text-teal-100/80 mt-0.5">
            Completed service value before applicable taxes. 20% Doorbly markup model tracked across district clusters.
          </p>
        </div>

        <div className="bg-black/20 border border-teal-700/50 rounded-xl p-3 px-5 text-right">
          <span className="text-xs font-semibold text-teal-200">Statewide Realization</span>
          <div className="flex items-baseline space-x-2 mt-0.5 justify-end">
            <span className="text-2xl font-black text-white">{statewideAchievementPct}%</span>
            <span className="text-xs text-emerald-400 font-bold">
              ₹{totalStatewideActual.toLocaleString('en-IN')} Actual
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Statewide Target</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalStatewideTarget.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">Sum of 30 district allocations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Actual Completed Subtotal</span>
          <p className="text-2xl font-bold text-[#16865D] mt-2">₹{totalStatewideActual.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">{totalBookings} verified completed orders</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Pending Statewide Gap</span>
          <p className={`text-2xl font-bold mt-2 ${totalStatewidePending === 0 ? 'text-[#16865D]' : 'text-amber-600'}`}>
            ₹{totalStatewidePending.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Remaining for 100% daily realization</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Average Order Value (AOV)</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{totalBookings > 0 ? Math.round(totalStatewideActual / totalBookings) : 0}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Statewide per-service ticket</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district name or manager..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-medium">District Tier:</span>
          <div className="flex items-center space-x-1">
            {(['all', '1', '2', '3'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  selectedTier === tier
                    ? 'bg-[#0F766E] text-white'
                    : 'bg-[#F7F9FA] text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tier === 'all' ? 'All (30)' : `Tier ${tier}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 30 Districts Leaderboard Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto horizontal-scroll-container max-h-[580px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-4 py-3 text-center w-12">Rank</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">District Leadership</th>
                <th className="px-4 py-3 text-right">Daily Target</th>
                <th className="px-4 py-3 text-right">Actual Completed</th>
                <th className="px-4 py-3 text-right">Gap</th>
                <th className="px-4 py-3 text-center">Achievement %</th>
                <th className="px-4 py-3 text-right">Bookings</th>
                <th className="px-4 py-3 text-right">Avg Value</th>
                {isAdmin && <th className="px-4 py-3 text-center">Admin Edit</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDistricts.map((d, index) => {
                const isUserDistrict = d.id === currentUser.districtId;
                const gap = Math.max(0, d.dailyTarget - d.actualCompletedSubtotal);
                const pct = d.dailyTarget > 0 ? Math.round((d.actualCompletedSubtotal / d.dailyTarget) * 100) : 0;
                const avgValue = d.completedBookingsCount > 0
                  ? Math.round(d.actualCompletedSubtotal / d.completedBookingsCount)
                  : 0;

                const isEditing = editingDistrictId === d.id;

                return (
                  <tr
                    key={d.id}
                    className={`transition ${
                      isUserDistrict
                        ? 'bg-teal-50/50 font-medium'
                        : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800'
                          : index === 1
                          ? 'bg-gray-200 text-gray-800'
                          : index === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span>{d.name}</span>
                        {isUserDistrict && (
                          <span className="text-[9px] bg-[#0F766E] text-white px-1.5 py-0.2 rounded font-semibold">
                            My District
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-normal">Tier {d.tier}</span>
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <p className="font-semibold text-gray-800">{d.managerName || 'Unassigned DM'}</p>
                      <p className="text-[10px] text-gray-400">DC: {d.coordinatorName || 'Vacant'}</p>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-1">
                          <input
                            type="number"
                            min="500"
                            step="100"
                            value={editTargetValue}
                            onChange={(e) => setEditTargetValue(parseInt(e.target.value) || 0)}
                            className="w-20 px-1.5 py-1 border border-[#0F766E] rounded text-right text-xs focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveTarget(d.id)}
                            className="p-1 bg-[#0F766E] text-white rounded hover:bg-[#123C45]"
                            title="Save target"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingDistrictId(null)}
                            className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-900">₹{d.dailyTarget.toLocaleString('en-IN')}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-[#16865D] whitespace-nowrap">
                      ₹{d.actualCompletedSubtotal.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">
                      ₹{gap.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          pct >= 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : pct >= 80
                            ? 'bg-teal-100 text-teal-800'
                            : pct >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pct}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right text-gray-700 font-medium">
                      {d.completedBookingsCount}
                    </td>

                    <td className="px-4 py-3 text-right text-gray-600 font-mono">
                      ₹{avgValue}
                    </td>

                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleStartEdit(d)}
                          className="p-1 text-gray-400 hover:text-[#0F766E] transition"
                          title="Edit target allocation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
