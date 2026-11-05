/**
 * DOORBLY REMOTE EMPLOYEE WORKSTATION & MANAGEMENT SYSTEM
 * Main Application Orchestrator
 * Target: workstation.doorbly.com (30 Districts of Odisha, India)
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CheckCircle2,
  Wallet,
  Clock,
  Menu
} from 'lucide-react';
import { StaffProfile } from './types/doorbly';
import { StorageEngine } from './services/storageEngine';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { DistrictManagerDashboard } from './components/dashboard/DistrictManagerDashboard';
import { DistrictCoordinatorDashboard } from './components/dashboard/DistrictCoordinatorDashboard';
import { MyTasksView } from './components/tasks/MyTasksView';
import { WorkApprovalQueue } from './components/approvals/WorkApprovalQueue';
import { AttendanceView } from './components/attendance/AttendanceView';
import { GeneralLeadsView } from './components/crm/GeneralLeadsView';
import { CorporateCrmView } from './components/crm/CorporateCrmView';
import { PartnerOnboardingView } from './components/partners/PartnerOnboardingView';
import { BookingPipelineView } from './components/bookings/BookingPipelineView';
import { CustomerSupportView } from './components/support/CustomerSupportView';
import { MyPerformanceView } from './components/performance/MyPerformanceView';
import { WorkCreditsLedger } from './components/performance/WorkCreditsLedger';
import { DistrictRevenueView } from './components/districts/DistrictRevenueView';
import { DailyReportsView } from './components/reports/DailyReportsView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { MyProfileView } from './components/profile/MyProfileView';
import { CentralAdminPanel } from './components/admin/CentralAdminPanel';
import { StaffWalletView } from './components/wallet/StaffWalletView';
import { HrManagementView, TechnicalManagementView } from './components/common/TechnicalHrViews';
import { BackendStatusModal } from './components/common/BackendStatusModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<StaffProfile | null>(() => {
    return StorageEngine.getCurrentUser();
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto-route role defaults if user changes
  const handleUserChange = (newUser: StaffProfile) => {
    setCurrentUser(newUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    StorageEngine.logout();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (profile: StaffProfile) => {
    setCurrentUser(profile);
    setActiveTab('dashboard');
  };

  // If user is logged out, render the Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onOpenBackendModal={() => setIsBackendModalOpen(true)}
        />
        <BackendStatusModal
          isOpen={isBackendModalOpen}
          onClose={() => setIsBackendModalOpen(false)}
        />
      </>
    );
  }

  // Count pending approvals and assigned tasks
  const pendingApprovalsCount = StorageEngine.getSubmissions().filter(
    (s) => s.status === 'under_review' || s.status === 'submitted'
  ).length;

  const assignedTasksCount = StorageEngine.getDailyTasks({ staffId: currentUser.id }).filter(
    (t) => t.status === 'assigned' || t.status === 'in_progress'
  ).length;

  // Decide what to render in Dashboard based on role
  const renderDashboard = () => {
    if (currentUser.systemRole === 'district_manager' || currentUser.designationId === 'dm') {
      return (
        <DistrictManagerDashboard
          currentUser={currentUser}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (currentUser.systemRole === 'district_coordinator' || currentUser.designationId === 'dc') {
      return (
        <DistrictCoordinatorDashboard
          currentUser={currentUser}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      );
    }
    return (
      <EmployeeDashboard
        currentUser={currentUser}
        onNavigate={(tab) => setActiveTab(tab)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#263238] flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onLogout={handleLogout}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Rapido-Style Sidebar (Mobile Drawer & Desktop Static) */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          onLogout={handleLogout}
          pendingApprovalsCount={pendingApprovalsCount}
          assignedTasksCount={assignedTasksCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Workspace Container - pb-20 on mobile ensures bottom navigation never covers content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'tasks' && <MyTasksView currentUser={currentUser} />}
          {activeTab === 'submissions' && <MyTasksView currentUser={currentUser} />}
          {activeTab === 'approvals' && <WorkApprovalQueue currentUser={currentUser} />}
          {activeTab === 'attendance' && <AttendanceView currentUser={currentUser} />}
          {activeTab === 'leave' && <AttendanceView currentUser={currentUser} />}
          {activeTab === 'leads' && <GeneralLeadsView currentUser={currentUser} />}
          {activeTab === 'corporate_crm' && <CorporateCrmView currentUser={currentUser} />}
          {activeTab === 'partners' && <PartnerOnboardingView currentUser={currentUser} />}
          {activeTab === 'bookings' && <BookingPipelineView currentUser={currentUser} />}
          {activeTab === 'support' && <CustomerSupportView currentUser={currentUser} />}
          {activeTab === 'hr_mgmt' && <HrManagementView currentUser={currentUser} />}
          {activeTab === 'tech_mgmt' && <TechnicalManagementView currentUser={currentUser} />}
          {activeTab === 'district_revenue' && <DistrictRevenueView currentUser={currentUser} />}
          {activeTab === 'performance' && <MyPerformanceView currentUser={currentUser} />}
          {activeTab === 'work_credits' && <WorkCreditsLedger currentUser={currentUser} />}
          {activeTab === 'reports' && <DailyReportsView currentUser={currentUser} />}
          {activeTab === 'announcements' && <AnnouncementsView currentUser={currentUser} />}
          {activeTab === 'profile' && <MyProfileView currentUser={currentUser} />}
          {activeTab === 'wallet' && <StaffWalletView currentUser={currentUser} />}
          {activeTab === 'admin_panel' && <CentralAdminPanel currentUser={currentUser} />}
        </main>
      </div>

      {/* Sticky Mobile Quick Navigation Bar (Screen width < 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-1.5 py-1.5 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-[#0F766E] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer relative ${
            activeTab === 'tasks' ? 'text-[#0F766E] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          <span>Tasks</span>
          {assignedTasksCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-[#0F766E] text-white text-[9px] flex items-center justify-center font-bold">
              {assignedTasksCount}
            </span>
          )}
        </button>

        {(currentUser.systemRole === 'super_admin' || currentUser.systemRole === 'district_manager' || currentUser.systemRole === 'district_coordinator' || currentUser.permissionLevel === 'admin' || currentUser.permissionLevel === 'manager') ? (
          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer relative ${
              activeTab === 'approvals' ? 'text-[#0F766E] font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mb-0.5" />
            <span>Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              activeTab === 'attendance' ? 'text-[#0F766E] font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span>Attendance</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'wallet' ? 'text-[#0F766E] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wallet className="w-4 h-4 mb-0.5" />
          <span>Wallet</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-gray-500 hover:text-gray-900 transition cursor-pointer"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Backend & Database Connectivity Modal */}
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
}
