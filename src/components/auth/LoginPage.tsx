/**
 * DOORBLY REMOTE WORKSTATION LOGIN PAGE
 * Professional login interface for remote employees across Odisha.
 * Supports Employee ID + Password, remember login, inactive status rejection, and 1-click test accounts.
 */

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, MapPin, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface LoginPageProps {
  onLoginSuccess: (profile: StaffProfile) => void;
  onOpenBackendModal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onOpenBackendModal }) => {
  const [employeeId, setEmployeeId] = useState('DBL-OD-001');
  const [password, setPassword] = useState('doorbly@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const allStaff = StorageEngine.getStaffProfiles();
  const supabaseOnline = isSupabaseConfigured();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = StorageEngine.loginByEmployeeId(employeeId);
      setIsLoading(false);
      if (res.success && res.profile) {
        onLoginSuccess(res.profile);
      } else {
        setErrorMessage(res.error || 'Invalid credentials or inactive account.');
      }
    }, 350);
  };

  const handleQuickSelect = (staff: StaffProfile) => {
    setEmployeeId(staff.employeeId);
    setPassword('doorbly@2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-black text-lg">
            D
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-[#123C45] text-lg tracking-tight">DOORBLY</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0F766E]/10 text-[#0F766E] px-1.5 py-0.5 rounded">
                Remote Workstation
              </span>
            </div>
            <p className="text-[11px] text-gray-500">workstation.doorbly.com • Odisha Remote Operations</p>
          </div>
        </div>

        <button
          onClick={onOpenBackendModal}
          className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 transition"
        >
          <span className={`w-2 h-2 rounded-full ${supabaseOnline ? 'bg-green-500' : 'bg-amber-400'}`} />
          <span className="hidden sm:inline">Backend Setup</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          
          {/* Left Brand Panel */}
          <div className="md:col-span-5 bg-[#123C45] text-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#0F766E]/40 border border-teal-500/30 text-teal-200 text-xs font-semibold mb-6">
                <MapPin className="w-3.5 h-3.5" />
                <span>30 Districts of Odisha</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-tight">
                Remote Employee Workstation & Management System
              </h2>
              <p className="text-xs text-teal-100/80 leading-relaxed mb-6">
                Secure enterprise portal for daily task allocation, remote attendance, customer bookings, lead conversion, and verified productivity credit tracking across Odisha.
              </p>

              <div className="space-y-3 text-xs border-t border-teal-800/60 pt-4">
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span className="text-teal-100/90">Multi-District Role-Based Access Control</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span className="text-teal-100/90">Daily Target Allocation: ₹1,00,000 Statewide</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span className="text-teal-100/90">Strict Evidence Verification & Credit Ledger</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-[11px] text-teal-300/70">
              Authorized personnel only. Public registration disabled.
            </div>
          </div>

          {/* Right Login Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Workstation Login</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter your official Doorbly Employee ID and password to access your workspace.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Employee ID / Official Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. DBL-OD-001"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Workstation Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Please contact Central HR (Smita Mohanty / DBL-OD-004) to initiate a secured password reset request.')}
                      className="text-[11px] text-[#0F766E] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E]"
                    />
                    <span>Remember login on this computer</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Enter Doorbly Workstation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Authorized Staff Profiles */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Authorized Staff Directory
                </span>
                <span className="text-[10px] text-gray-400">Click to fill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#F7F9FA] rounded border border-gray-200">
                {allStaff.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleQuickSelect(staff)}
                    className={`text-left p-2 rounded text-[11px] border transition truncate ${
                      employeeId === staff.employeeId
                        ? 'bg-teal-50 border-teal-400 text-[#0F766E] font-semibold'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="truncate font-semibold text-gray-900">{staff.fullName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{staff.designationTitle}</p>
                    <p className="text-[9px] font-mono text-[#0F766E] mt-0.5">{staff.employeeId} • {staff.districtName}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Doorbly Technologies Private Limited. All Rights Reserved. Remote Workstation Portal • Asia/Kolkata IST
      </footer>
    </div>
  );
};
