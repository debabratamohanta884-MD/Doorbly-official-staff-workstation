/**
 * DOORBLY TOP NAVIGATION
 * Displays Doorbly branding, employee badge, assigned district, live IST clock,
 * notifications menu, quick role switcher, and database status.
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  MapPin,
  Shield,
  UserCheck,
  LogOut,
  ChevronDown,
  Database,
  Building2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface NavbarProps {
  currentUser: StaffProfile;
  onUserChange: (newUser: StaffProfile) => void;
  onLogout: () => void;
  onOpenBackendModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  onLogout,
  onOpenBackendModal
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [istDate, setIstDate] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [allStaff, setAllStaff] = useState<StaffProfile[]>([]);
  const announcements = StorageEngine.getAnnouncements();
  const supabaseOnline = isSupabaseConfigured();

  // Live IST Clock (Asia/Kolkata)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setIstTime(timeFormatter.format(now));
      setIstDate(dateFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAllStaff(StorageEngine.getStaffProfiles());
  }, []);

  const handleRoleSelect = (staff: StaffProfile) => {
    StorageEngine.setCurrentUserId(staff.id);
    onUserChange(staff);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-gray-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-xs">
      {/* Brand & District Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-black text-xl tracking-tight">
            D
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[#123C45] text-lg tracking-tight">DOORBLY</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#0F766E]/10 text-[#0F766E] px-1.5 py-0.5 rounded">
                Workstation
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Odisha Remote Employee Network
            </p>
          </div>
        </div>

        {/* Assigned District Badge */}
        <div className="hidden md:flex items-center space-x-1.5 bg-[#F7F9FA] border border-gray-200 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>{currentUser.districtName}</span>
        </div>
      </div>

      {/* Center: Live IST Clock */}
      <div className="hidden lg:flex items-center space-x-2 bg-[#F7F9FA] border border-gray-200 px-3 py-1 rounded-md text-xs">
        <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
        <span className="text-gray-500 font-normal">{istDate}</span>
        <span className="text-gray-300">|</span>
        <span className="font-semibold text-gray-800 tabular-nums">{istTime}</span>
        <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-1 rounded">IST</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Backend Connectivity Status Button */}
        <button
          onClick={onOpenBackendModal}
          title="Supabase & Database Connectivity"
          className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
        >
          <Database className={`w-3.5 h-3.5 ${supabaseOnline ? 'text-green-600' : 'text-amber-500'}`} />
          <span className="hidden sm:inline font-medium">
            {supabaseOnline ? 'Supabase Live' : 'Offline / Local Sync'}
          </span>
          <span className={`w-2 h-2 rounded-full ${supabaseOnline ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          {(() => {
            const staffNotifs = StorageEngine.getStaffNotifications(currentUser.id);
            const unreadCount = staffNotifs.filter(n => !n.isRead).length;
            const hasActivity = unreadCount > 0 || announcements.length > 0;

            return (
              <>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition relative cursor-pointer"
                  title="System Announcements & Wallet Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {hasActivity && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-84 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-bold text-gray-900">Notifications & Alerts</span>
                      {staffNotifs.length > 0 && (
                        <button
                          onClick={() => {
                            StorageEngine.markAllNotificationsRead(currentUser.id);
                            setShowNotifMenu(false);
                          }}
                          className="text-[10px] text-teal-700 hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto mt-2 space-y-2 custom-scrollbar">
                      {/* Personal Staff Notifications */}
                      {staffNotifs.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => StorageEngine.markNotificationRead(n.id)}
                          className={`p-2 rounded border cursor-pointer transition ${
                            n.isRead
                              ? 'bg-gray-50/70 border-gray-100 text-gray-600'
                              : 'bg-teal-50/70 border-teal-200 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-[11px] text-gray-900">{n.title}</p>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                            )}
                          </div>
                          <p className="text-gray-600 mt-0.5 leading-relaxed text-[10px]">{n.message}</p>
                          <div className="mt-1 text-[9px] text-gray-400 font-mono">
                            {n.createdAt.slice(0, 16).replace('T', ' ')}
                          </div>
                        </div>
                      ))}

                      {/* State Announcements */}
                      {announcements.map((anc) => (
                        <div key={anc.id} className="p-2 rounded bg-gray-50 border border-gray-100">
                          <span className="text-[9px] uppercase font-bold text-teal-700 bg-teal-50 px-1 rounded">
                            Announcement
                          </span>
                          <p className="font-semibold text-gray-900 text-[11px] mt-0.5">{anc.title}</p>
                          <p className="text-gray-600 mt-0.5 leading-relaxed text-[10px]">{anc.content}</p>
                        </div>
                      ))}

                      {staffNotifs.length === 0 && announcements.length === 0 && (
                        <p className="text-center text-gray-400 py-4 text-[11px]">No active notifications.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Quick Role Switcher (Crucial for testing all 12 designations + DM + DC + Admin) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 text-left p-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#123C45] text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-xs text-gray-900 leading-none">
                  {currentUser.fullName}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-[10px] text-[#0F766E] font-medium leading-none">
                  {currentUser.employeeId}
                </span>
                <span className="text-[9px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-500 leading-none truncate max-w-[110px]">
                  {currentUser.designationTitle}
                </span>
              </div>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50">
              <div className="pb-2 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Signed in as
                </p>
                <p className="font-bold text-sm text-gray-900">{currentUser.fullName}</p>
                <p className="text-xs text-[#0F766E] font-medium">{currentUser.designationTitle}</p>
                <p className="text-[11px] text-gray-500">{currentUser.departmentName}</p>
              </div>

              <div className="mt-2.5">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[11px] font-semibold text-gray-600">
                    Staff Account Switcher
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">Active Profiles</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {allStaff.map((staff) => {
                    const isSelected = staff.id === currentUser.id;
                    return (
                      <button
                        key={staff.id}
                        onClick={() => handleRoleSelect(staff)}
                        className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition text-xs ${
                          isSelected
                            ? 'bg-teal-50 text-[#0F766E] font-semibold border border-teal-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate text-xs">{staff.fullName}</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {staff.designationTitle} ({staff.districtName})
                          </p>
                        </div>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#0F766E] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Workstation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
