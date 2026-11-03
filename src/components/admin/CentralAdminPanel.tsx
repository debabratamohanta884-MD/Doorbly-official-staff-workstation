/**
 * CENTRAL ADMIN PANEL - Section 17
 * Comprehensive 20-module administrator console for statewide governance,
 * employee lifecycle, department/designation management, Task Value Master editing,
 * revenue targets, audit logs, and Supabase SQL migration exporter.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Users,
  Building,
  Award,
  TrendingUp,
  MapPin,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  FileSpreadsheet,
  AlertTriangle,
  History
} from 'lucide-react';
import { StaffProfile, Department, JobDesignation, TaskValueItem, SystemAuditLog } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';
import { ODISHA_DISTRICTS_INITIAL } from '../../constants/districts';
import { COMPLETE_DOORBLY_SCHEMA_SQL } from '../../sql/schemaSql';

interface CentralAdminPanelProps {
  currentUser: StaffProfile;
}

type AdminSubTab =
  | 'overview'
  | 'employees'
  | 'task_values'
  | 'districts'
  | 'departments'
  | 'audit_logs'
  | 'sql_migrations';

export const CentralAdminPanel: React.FC<CentralAdminPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('overview');
  const [staffList, setStaffList] = useState<StaffProfile[]>(StorageEngine.getStaffProfiles());
  const [taskValues, setTaskValues] = useState<TaskValueItem[]>(StorageEngine.getTaskValueMaster());
  const [districts, setDistricts] = useState(StorageEngine.getDistricts());
  const [departments, setDepartments] = useState<Department[]>(StorageEngine.getDepartments());
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(StorageEngine.getAuditLogs());

  // Edit Task Value Modal
  const [editingTaskValue, setEditingTaskValue] = useState<TaskValueItem | null>(null);
  const [editCreditVal, setEditCreditVal] = useState<number>(0);
  const [editQuota, setEditQuota] = useState<number>(0);

  // New Employee Modal
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empMobile, setEmpMobile] = useState('');
  const [empDesignationId, setEmpDesignationId] = useState('tele_caller');
  const [empDistrictId, setEmpDistrictId] = useState('khordha');
  const [empRole, setEmpRole] = useState<'employee' | 'district_coordinator' | 'district_manager' | 'super_admin'>('employee');

  // District Transfer Modal
  const [transferStaff, setTransferStaff] = useState<StaffProfile | null>(null);
  const [transferTargetDistrict, setTransferTargetDistrict] = useState('cuttack');
  const [transferReason, setTransferReason] = useState('');

  // SQL Copy state
  const [copiedSql, setCopiedSql] = useState(false);

  const designations = StorageEngine.getDesignations();

  const handleToggleStaffStatus = (staff: StaffProfile) => {
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    StorageEngine.updateStaffProfile(staff.id, { status: newStatus }, currentUser);
    setStaffList(StorageEngine.getStaffProfiles());
  };

  const handleSaveTaskValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskValue) return;

    StorageEngine.updateTaskValueItem(
      editingTaskValue.id,
      { creditValue: editCreditVal, defaultDailyQuota: editQuota },
      currentUser
    );

    setTaskValues(StorageEngine.getTaskValueMaster());
    setEditingTaskValue(null);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empMobile.trim()) return;

    const count = staffList.length + 1;
    const desig = designations.find(d => d.id === empDesignationId);
    const dist = districts.find(d => d.id === empDistrictId);

    StorageEngine.createStaffProfile(
      {
        employeeId: `DBL-OD-${String(count).padStart(3, '0')}`,
        fullName: empName.trim(),
        email: empEmail.trim(),
        mobile: empMobile.trim(),
        departmentId: desig?.departmentId || 'dept_gen_ops',
        departmentName: desig?.title || 'General Operations',
        designationId: empDesignationId,
        designationTitle: desig?.title || 'Executive',
        systemRole: empRole,
        districtId: empDistrictId,
        districtName: dist?.name || 'Khordha',
        joiningDate: new Date().toISOString().slice(0, 10),
        status: 'active',
        permissionLevel: empRole === 'super_admin' ? 'admin' : empRole === 'district_manager' ? 'manager' : empRole === 'district_coordinator' ? 'coordinator' : 'staff'
      },
      currentUser
    );

    setStaffList(StorageEngine.getStaffProfiles());
    setIsAddEmployeeOpen(false);
    setEmpName('');
    setEmpEmail('');
    setEmpMobile('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferStaff || !transferReason.trim()) return;

    StorageEngine.transferEmployeeDistrict(
      transferStaff.id,
      transferTargetDistrict,
      transferReason.trim(),
      currentUser
    );

    setStaffList(StorageEngine.getStaffProfiles());
    setAuditLogs(StorageEngine.getAuditLogs());
    setTransferStaff(null);
    setTransferReason('');
  };

  const sqlCode = COMPLETE_DOORBLY_SCHEMA_SQL;

  return (
    <div className="space-y-6">
      {/* Admin Headline Banner */}
      <div className="bg-[#123C45] text-white rounded-xl p-5 border border-teal-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E] text-white">
              Statewide Administration
            </span>
            <span className="text-xs text-teal-300">Central Directorate</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Central Administrative Control Panel
          </h1>
          <p className="text-xs text-teal-100/80 mt-0.5">
            Full governance across 30 Odisha districts, employee lifecycle, credit rate revisions, targets, and database migrations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono bg-black/20 text-teal-200 px-3 py-1.5 rounded-lg border border-teal-700/50">
            Admin: {currentUser.fullName} ({currentUser.employeeId})
          </span>
        </div>
      </div>

      {/* Admin Subtabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-xs flex items-center space-x-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Executive Overview
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition ${
            activeTab === 'employees'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Employee Management ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab('task_values')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition ${
            activeTab === 'task_values'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Task Value Master (Section 10)
        </button>
        <button
          onClick={() => setActiveTab('districts')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition ${
            activeTab === 'districts'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          District Transfers & Roster
        </button>
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition ${
            activeTab === 'audit_logs'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          System Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('sql_migrations')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition ${
            activeTab === 'sql_migrations'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Supabase SQL Migrations (23 Tables)
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Total Remote Employees</span>
              <p className="text-2xl font-bold text-gray-900 mt-2">{staffList.length}</p>
              <p className="text-[11px] text-gray-400 mt-1">Across 12 core designations</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Active Districts</span>
              <p className="text-2xl font-bold text-[#0F766E] mt-2">30 / 30</p>
              <p className="text-[11px] text-gray-400 mt-1">100% Odisha coverage</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Statewide Target Subtotal</span>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹1,00,000</p>
              <p className="text-[11px] text-gray-400 mt-1">Per day service milestone</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Task Value Rates Active</span>
              <p className="text-2xl font-bold text-blue-600 mt-2">{taskValues.length} Rules</p>
              <p className="text-[11px] text-gray-400 mt-1">Standard productivity metrics</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Recent System Governance Actions</h3>
            <div className="divide-y divide-gray-100 text-xs">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-800">{log.action}:</span> {log.details}
                    <p className="text-[10px] text-gray-400">{log.actorName} ({log.actorRole}) • {log.module}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE MANAGEMENT */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Manage employee accounts, generate IDs, activate, or deactivate accounts.</p>
            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-md transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Employee</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Designation & Role</th>
                  <th className="px-4 py-3">Assigned District</th>
                  <th className="px-4 py-3">Mobile & Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">{staff.employeeId}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{staff.fullName}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <p className="font-medium">{staff.designationTitle}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{staff.systemRole}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{staff.districtName}</td>
                    <td className="px-4 py-3 text-gray-600 text-[11px]">
                      <p>{staff.mobile}</p>
                      <p className="text-gray-400">{staff.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        staff.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setTransferStaff(staff);
                          setTransferTargetDistrict(staff.districtId === 'khordha' ? 'cuttack' : 'khordha');
                        }}
                        className="px-2 py-1 text-[11px] text-[#0F766E] border border-[#0F766E] rounded hover:bg-teal-50 font-semibold"
                      >
                        Transfer
                      </button>
                      <button
                        onClick={() => handleToggleStaffStatus(staff)}
                        className={`px-2 py-1 text-[11px] rounded font-semibold border ${
                          staff.status === 'active'
                            ? 'text-red-600 border-red-300 hover:bg-red-50'
                            : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        {staff.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TASK VALUE MASTER (SECTION 10) */}
      {activeTab === 'task_values' && (
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
            <strong>Section 10 Standard Productivity Credits:</strong> These internal work measurement credits determine productivity credit ledger awards. Department heads cannot approve their own submissions. All credit rates and default daily quotas are directly editable by Admin.
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Activity Name</th>
                  <th className="px-4 py-3 text-right">Credit Value (INR)</th>
                  <th className="px-4 py-3 text-right">Default Quota</th>
                  <th className="px-4 py-3">Description & Measurement Scope</th>
                  <th className="px-4 py-3 text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taskValues.map((tv) => (
                  <tr key={tv.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                      {tv.designationTitle}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      {tv.activityName}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-[#0F766E] whitespace-nowrap">
                      ₹{tv.creditValue}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                      {tv.defaultDailyQuota} / {tv.quotaUnit}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-sm">
                      {tv.description}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setEditingTaskValue(tv);
                          setEditCreditVal(tv.creditValue);
                          setEditQuota(tv.defaultDailyQuota);
                        }}
                        className="p-1 text-gray-400 hover:text-[#0F766E] transition"
                        title="Edit credit rate"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DISTRICTS TRANSFERS & ROSTER */}
      {activeTab === 'districts' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Audit history of employee district reallocations and current leadership across all 30 districts of Odisha.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {districts.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{d.name}</span>
                  <span className="text-[10px] font-bold bg-teal-50 text-[#0F766E] px-1.5 py-0.2 rounded">
                    Tier {d.tier}
                  </span>
                </div>
                <p className="text-gray-500">Manager: <strong className="text-gray-700">{d.managerName || 'Pending'}</strong></p>
                <p className="text-gray-500">Coordinator: <strong className="text-gray-700">{d.coordinatorName || 'Pending'}</strong></p>
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-gray-600">
                  <span>Daily Target: <strong>₹{d.dailyTarget}</strong></span>
                  <span>Active Staff: <strong>{d.activeStaffCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Immutable chronological log of all approvals, district transfers, and financial actions.</p>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Timestamp (IST)</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      {log.actorName} ({log.actorRole})
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold bg-teal-50 text-[#0F766E] px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{log.module}</td>
                    <td className="px-4 py-3 text-gray-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SUPABASE SQL MIGRATIONS EXPORTER */}
      {activeTab === 'sql_migrations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">PostgreSQL / Supabase Migration Schema</h3>
              <p className="text-xs text-gray-500">All 23 tables, foreign keys, indexes, RLS policies, and Odisha 30 districts seeds.</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sqlCode);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-md transition flex items-center space-x-1.5 shadow-xs"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL to Clipboard'}</span>
            </button>
          </div>

          <div className="bg-gray-900 text-teal-300 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-96 border border-gray-800">
            <pre>{sqlCode}</pre>
          </div>
        </div>
      )}

      {/* Edit Task Value Modal */}
      {editingTaskValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Edit Task Credit Rule</h3>
              <button onClick={() => setEditingTaskValue(null)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTaskValue} className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-gray-500 font-medium">Activity:</span>
                <p className="font-bold text-gray-900 text-sm">{editingTaskValue.activityName}</p>
                <p className="text-[11px] text-[#0F766E]">{editingTaskValue.designationTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Credit Value (INR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editCreditVal}
                    onChange={(e) => setEditCreditVal(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Default Daily Quota</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editQuota}
                    onChange={(e) => setEditQuota(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTaskValue(null)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Save Credit Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Employee Modal */}
      {transferStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Transfer Employee District</h3>
              <button onClick={() => setTransferStaff(null)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-gray-500 font-medium">Employee:</span>
                <p className="font-bold text-gray-900 text-sm">{transferStaff.fullName} ({transferStaff.employeeId})</p>
                <p className="text-[11px] text-gray-500">Current District: {transferStaff.districtName}</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target District *</label>
                <select
                  value={transferTargetDistrict}
                  onChange={(e) => setTransferTargetDistrict(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Transfer Justification & Reason *</label>
                <textarea
                  required
                  rows={2}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. Assigned to scale HVAC booking confirmations in Cuttack cluster..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTransferStaff(null)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Execute District Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Register Remote Employee Profile</h3>
              <button onClick={() => setIsAddEmployeeOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Suman Behera"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="suman.behera@doorbly.com"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={empMobile}
                    onChange={(e) => setEmpMobile(e.target.value)}
                    placeholder="+91 9437..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned District</label>
                  <select
                    value={empDistrictId}
                    onChange={(e) => setEmpDistrictId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Designation</label>
                  <select
                    value={empDesignationId}
                    onChange={(e) => setEmpDesignationId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">System Role & Permissions</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  >
                    <option value="employee">Standard Remote Employee</option>
                    <option value="district_coordinator">District Coordinator</option>
                    <option value="district_manager">District Manager</option>
                    <option value="super_admin">Central Administrator</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Generate ID & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
