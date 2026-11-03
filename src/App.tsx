/**
 * DOORBLY REMOTE EMPLOYEE WORKSTATION & MANAGEMENT SYSTEM
 * Main Application Orchestrator
 * Target: workstation.doorbly.com (30 Districts of Odisha, India)
 */

import React, { useState, useEffect } from 'react';
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
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Rapido-Style Sidebar */}
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
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
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

      {/* Backend & Database Connectivity Modal */}
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
}
