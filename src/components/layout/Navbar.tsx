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
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { DoorblyLogo } from '../common/DoorblyLogo';

interface NavbarProps {
  currentUser: StaffProfile;
  onLogout: () => void;
  onOpenBackendModal: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
  adminIdleSecondsLeft?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenBackendModal,
  isMobileSidebarOpen = false,
  onToggleMobileSidebar,
  adminIdleSecondsLeft
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [istDate, setIstDate] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const announcements = StorageEngine.getAnnouncements();
  const isAdmin =
    (currentUser.systemRole === 'super_admin' || currentUser.permissionLevel === 'admin') &&
    StorageEngine.isAdminSessionVerified();
  const supabaseOnline = isAdmin ? isSupabaseConfigured() : false;

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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

  return (
    <header className="sticky top-0 z-40 bg-[#0B3B32] border-b border-teal-950/80 px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between shadow-md text-white">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-md text-teal-100 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0 border border-white/20"
          aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
          title="Toggle Navigation Menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>

        <div className="min-w-0">
          <DoorblyLogo
            size="md"
            showText={true}
            textVariant="light"
            badgeText="Workstation"
            animateFlip={true}
            showOrbitLight={true}
          />
        </div>

        {/* Assigned District Badge */}
        <div className="hidden md:flex items-center space-x-1.5 bg-black/30 border border-white/15 text-teal-100 px-2.5 py-1 rounded-md text-xs font-medium shrink-0">
          <MapPin className="w-3.5 h-3.5 text-yellow-400" />
          <span>{currentUser.districtName}</span>
        </div>
      </div>

      {/* Center: Live IST Clock */}
      <div className="hidden lg:flex items-center space-x-2 bg-black/30 border border-white/15 px-3 py-1 rounded-md text-xs shrink-0 text-teal-100">
        <Clock className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-teal-200/80 font-normal">{istDate}</span>
        <span className="text-white/20">|</span>
        <span className="font-semibold text-white tabular-nums">{istTime}</span>
        <span className="text-[10px] font-bold text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 rounded">IST</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Admin Auto-Logout Timer Badge (Admin Only) */}
        {isAdmin && typeof adminIdleSecondsLeft === 'number' && (
          <div
            title="Admin session auto-logs out when idle or on browser close"
            className="hidden md:flex items-center space-x-1 text-[11px] px-2 py-1 rounded-md border border-amber-400/35 bg-amber-500/15 text-amber-200 font-mono"
          >
            <Shield className="w-3 h-3 text-amber-300" />
            <span>Auto-lock {formatCountdown(adminIdleSecondsLeft)}</span>
          </div>
        )}

        {/* Backend Connectivity Status Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={onOpenBackendModal}
            title="Supabase & Database Connectivity"
            className="flex items-center space-x-1 text-xs px-2 sm:px-2.5 py-1 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <Database className={`w-3.5 h-3.5 ${supabaseOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline font-medium text-white">
              {supabaseOnline ? 'Supabase Live' : 'Offline / Local'}
            </span>
            <span className={`w-2 h-2 rounded-full ${supabaseOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          </button>
        )}

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
                  className="p-1.5 rounded-md text-teal-100 hover:text-white hover:bg-white/10 transition relative cursor-pointer"
                  title="System Announcements & Wallet Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {hasActivity && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-1.5rem))] bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 text-xs">
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

        {/* Quick Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1.5 sm:space-x-2 text-left p-1 rounded-md hover:bg-white/10 border border-transparent hover:border-white/15 transition cursor-pointer text-white"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 text-yellow-300 border border-white/25 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-xs text-white leading-none">
                  {currentUser.fullName}
                </span>
                <ChevronDown className="w-3 h-3 text-teal-200" />
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-[10px] text-yellow-300 font-medium leading-none">
                  {currentUser.employeeId}
                </span>
                <span className="text-[9px] text-white/40">•</span>
                <span className="text-[10px] text-teal-200/90 leading-none truncate max-w-[90px] sm:max-w-[110px]">
                  {currentUser.designationTitle}
                </span>
              </div>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-[min(19rem,calc(100vw-1.5rem))] bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 text-gray-900">
              <div className="pb-2.5 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Signed in as
                </p>
                <p className="font-bold text-sm text-gray-900 mt-0.5">{currentUser.fullName}</p>
                <p className="text-xs text-[#0F766E] font-medium">{currentUser.designationTitle}</p>
                <p className="text-[11px] text-gray-500">{currentUser.departmentName}</p>
                <p className="text-[10px] font-mono text-gray-400 mt-1">
                  ID: {currentUser.employeeId} • {currentUser.districtName}
                </p>
              </div>

              {isAdmin && typeof adminIdleSecondsLeft === 'number' && (
                <div className="mt-2.5 p-2 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Admin Auto-Logout</span>
                  </span>
                  <span className="font-mono font-bold">{formatCountdown(adminIdleSecondsLeft)}</span>
                </div>
              )}

              <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1.5">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  To switch accounts, log out and sign in with another Employee ID and password.
                </p>
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAdmin ? 'Lock & Log Out Admin' : 'Log Out / Switch Account'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
