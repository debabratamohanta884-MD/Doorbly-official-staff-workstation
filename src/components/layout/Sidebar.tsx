/**
 * DOORBLY RAPIDO-STYLE FUNCTIONAL SIDEBAR
 * Role-based navigation filtering according to employee designation and permissions.
 */

import React from 'react';
import {
  LayoutDashboard,
  User,
  Clock,
  CheckSquare,
  Send,
  CheckCircle2,
  PhoneCall,
  Building,
  UserPlus,
  CalendarCheck,
  Headphones,
  Users,
  Code2,
  TrendingUp,
  Award,
  BarChart3,
  FileText,
  CalendarX,
  Megaphone,
  Sliders,
  LogOut
} from 'lucide-react';
import { StaffProfile, SystemRole, DesignationId } from '../../types/doorbly';

export type ActiveTab =
  | 'dashboard'
  | 'profile'
  | 'attendance'
  | 'tasks'
  | 'submissions'
  | 'approvals'
  | 'leads'
  | 'corporate_crm'
  | 'partners'
  | 'bookings'
  | 'support'
  | 'hr_mgmt'
  | 'tech_mgmt'
  | 'performance'
  | 'work_credits'
  | 'district_revenue'
  | 'reports'
  | 'leave'
  | 'announcements'
  | 'admin_panel';

interface SidebarProps {
  currentUser: StaffProfile;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
  pendingApprovalsCount?: number;
  assignedTasksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  pendingApprovalsCount = 0,
  assignedTasksCount = 0
}) => {
  const role: SystemRole = currentUser.systemRole;
  const desig: DesignationId | string = currentUser.designationId;
  const isAdmin = role === 'super_admin' || currentUser.permissionLevel === 'admin';
  const isManager = role === 'district_manager' || currentUser.permissionLevel === 'manager';
  const isCoordinator = role === 'district_coordinator' || currentUser.permissionLevel === 'coordinator';

  // Navigation Items with Permission Flags
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: true
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'My Daily Tasks',
      icon: CheckSquare,
      visible: true,
      badge: assignedTasksCount > 0 ? assignedTasksCount : undefined
    },
    {
      id: 'submissions' as ActiveTab,
      label: 'Work Submission',
      icon: Send,
      visible: !isAdmin // Pure admins don't need task submission form
    },
    {
      id: 'approvals' as ActiveTab,
      label: 'Work Approvals',
      icon: CheckCircle2,
      visible: isAdmin || isManager || isCoordinator || desig === 'dm' || desig === 'dc',
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'attendance' as ActiveTab,
      label: 'My Attendance',
      icon: Clock,
      visible: true
    },
    {
      id: 'leads' as ActiveTab,
      label: 'My Leads (CRM)',
      icon: PhoneCall,
      visible: isAdmin || isManager || isCoordinator || desig === 'tele_caller' || desig === 'lead_gen_gen' || desig === 'lead_gen_res'
    },
    {
      id: 'corporate_crm' as ActiveTab,
      label: 'Corporate CRM (B2B)',
      icon: Building,
      visible: isAdmin || isManager || desig === 'corp_caller' || desig === 'lead_gen_corp'
    },
    {
      id: 'partners' as ActiveTab,
      label: 'Partner Onboarding',
      icon: UserPlus,
      visible: isAdmin || isManager || isCoordinator || desig === 'partner_caller'
    },
    {
      id: 'bookings' as ActiveTab,
      label: 'Booking Monitoring',
      icon: CalendarCheck,
      visible: isAdmin || isManager || isCoordinator || desig === 'tele_caller' || desig === 'cust_support'
    },
    {
      id: 'support' as ActiveTab,
      label: 'Customer Support',
      icon: Headphones,
      visible: isAdmin || isManager || isCoordinator || desig === 'cust_support'
    },
    {
      id: 'hr_mgmt' as ActiveTab,
      label: 'HR Management',
      icon: Users,
      visible: isAdmin || desig === 'hr_exec'
    },
    {
      id: 'tech_mgmt' as ActiveTab,
      label: 'Technical Management',
      icon: Code2,
      visible: isAdmin || desig === 'tech_exec' || desig === 'software_dev'
    },
    {
      id: 'district_revenue' as ActiveTab,
      label: 'Revenue & 30 Districts',
      icon: BarChart3,
      visible: true // All remote employees can view district target achievements
    },
    {
      id: 'performance' as ActiveTab,
      label: 'My Performance',
      icon: TrendingUp,
      visible: true
    },
    {
      id: 'work_credits' as ActiveTab,
      label: 'Work Credits Ledger',
      icon: Award,
      visible: true
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Daily Reports',
      icon: FileText,
      visible: true
    },
    {
      id: 'leave' as ActiveTab,
      label: 'Leave Application',
      icon: CalendarX,
      visible: true
    },
    {
      id: 'announcements' as ActiveTab,
      label: 'Announcements',
      icon: Megaphone,
      visible: true
    },
    {
      id: 'profile' as ActiveTab,
      label: 'My Profile',
      icon: User,
      visible: true
    },
    {
      id: 'admin_panel' as ActiveTab,
      label: 'Central Admin Panel',
      icon: Sliders,
      visible: isAdmin,
      highlight: true
    }
  ];

  return (
    <aside className="w-64 bg-[#123C45] text-white flex flex-col shrink-0 min-h-[calc(100vh-57px)] select-none">
      {/* Employee Quick Identity Header */}
      <div className="p-3.5 border-b border-teal-800/40 bg-black/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {currentUser.fullName}
            </p>
            <p className="text-[10px] text-teal-300 truncate font-mono mt-0.5">
              {currentUser.employeeId} • {currentUser.districtName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 text-xs">
        {navItems
          .filter(item => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition text-left font-medium ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : item.highlight
                    ? 'text-teal-200 hover:bg-teal-900/50 hover:text-white border border-teal-700/50 my-1'
                    : 'text-gray-300 hover:bg-teal-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-teal-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold text-white shrink-0 ${
                      item.badgeColor || 'bg-[#0F766E]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Sidebar Footer with Logout */}
      <div className="p-3 border-t border-teal-800/40 bg-black/15">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-red-300 hover:bg-red-950/30 rounded-md transition"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Exit Workstation</span>
        </button>
        <div className="mt-2 text-center text-[10px] text-teal-400/60">
          workstation.doorbly.com • v2.6
        </div>
      </div>
    </aside>
  );
};
