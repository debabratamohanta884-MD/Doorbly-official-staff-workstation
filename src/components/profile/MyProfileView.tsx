/**
 * EMPLOYEE PROFILE VIEW - Section 5
 * Complete employee profile details, reporting hierarchy, and permissions.
 */

import React from 'react';
import { User, Mail, Phone, MapPin, Building, Shield, Calendar, Award } from 'lucide-react';
import { StaffProfile } from '../../types/doorbly';

interface MyProfileViewProps {
  currentUser: StaffProfile;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
        <div className="w-20 h-20 rounded-full bg-[#123C45] text-white flex items-center justify-center font-black text-3xl uppercase shrink-0 border-4 border-teal-100">
          {currentUser.fullName.charAt(0)}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{currentUser.fullName}</h1>
            <span className="font-mono text-xs font-bold bg-[#0F766E]/10 text-[#0F766E] px-2 py-0.5 rounded">
              {currentUser.employeeId}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
              currentUser.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700'
            }`}>
              {currentUser.status}
            </span>
          </div>

          <p className="text-xs font-semibold text-gray-700">{currentUser.designationTitle}</p>
          <p className="text-xs text-gray-500">{currentUser.departmentName}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Assigned District: <strong className="text-gray-800">{currentUser.districtName}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Joining Date: <strong className="text-gray-800">{currentUser.joiningDate}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Contact & Reporting */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 uppercase tracking-wide pb-2 border-b border-gray-100">
            Contact & Reporting Structure
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>Official Email:</span>
              </span>
              <span className="font-mono font-medium text-gray-900">{currentUser.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>Mobile Number:</span>
              </span>
              <span className="font-mono font-medium text-gray-900">{currentUser.mobile}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-gray-400" />
                <span>Reporting Manager:</span>
              </span>
              <span className="font-semibold text-gray-900">
                {currentUser.reportingManagerName || 'State Director / Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Level */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 uppercase tracking-wide pb-2 border-b border-gray-100">
            System Privileges & Governance
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Permission Tier:</span>
              </span>
              <span className="font-bold uppercase text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded">
                {currentUser.permissionLevel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">System Role:</span>
              <span className="font-mono text-gray-700 font-medium">{currentUser.systemRole}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Workspace Isolation:</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Secured District Scope
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
