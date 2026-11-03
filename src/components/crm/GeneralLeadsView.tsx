/**
 * GENERAL OPERATIONS CRM & CALLING RECORDS - Section 12
 * Customer enquiries, lead status, follow-up scheduling, booking conversion.
 */

import React, { useState } from 'react';
import {
  PhoneCall,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  MapPin
} from 'lucide-react';
import { CustomerLead, StaffProfile, LeadStatus } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface GeneralLeadsViewProps {
  currentUser: StaffProfile;
}

export const GeneralLeadsView: React.FC<GeneralLeadsViewProps> = ({ currentUser }) => {
  const [leads, setLeads] = useState<CustomerLead[]>(StorageEngine.getLeads());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Lead Form State
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [districtId, setDistrictId] = useState(currentUser.districtId || 'khordha');
  const [locality, setLocality] = useState('');
  const [serviceCategory, setServiceCategory] = useState('HVAC / AC Deep Cleaning');
  const [estimatedValue, setEstimatedValue] = useState(1500);
  const [notes, setNotes] = useState('');

  const districts = StorageEngine.getDistricts();

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.customerName.toLowerCase().includes(q) ||
        l.customerMobile.includes(q) ||
        l.leadCode.toLowerCase().includes(q) ||
        l.serviceCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    StorageEngine.updateLeadStatus(leadId, newStatus, currentUser);
    setLeads(StorageEngine.getLeads());
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim()) return;

    const dist = districts.find(d => d.id === districtId);
    StorageEngine.createLead(
      {
        customerName: custName.trim(),
        customerMobile: custMobile.trim(),
        customerEmail: custEmail.trim() || undefined,
        districtId: districtId,
        districtName: dist?.name || 'Khordha',
        locality: locality.trim() || undefined,
        serviceCategory: serviceCategory,
        status: 'new',
        estimatedValue: estimatedValue,
        assignedStaffId: currentUser.id,
        assignedStaffName: currentUser.fullName,
        notes: notes.trim()
      },
      currentUser
    );

    setLeads(StorageEngine.getLeads());
    setIsAddModalOpen(false);
    setCustName('');
    setCustMobile('');
    setCustEmail('');
    setNotes('');
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Operations CRM
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{filteredLeads.length} Customer Inquiries</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            General Customer Leads & Call Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Log outbound customer conversations, qualify service requirements, and advance leads to confirmed bookings.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, or service..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
          >
            <option value="all">All Leads</option>
            <option value="new">New Enquiry</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="booking_ready">Booking Ready</option>
            <option value="booking_confirmed">Booking Confirmed</option>
            <option value="follow_up">Follow Up</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Lead Code</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">District / Locality</th>
                <th className="px-4 py-3">Service Category</th>
                <th className="px-4 py-3 text-right">Est. Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Caller</th>
                <th className="px-4 py-3 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3 font-mono font-bold text-gray-700 whitespace-nowrap">
                    {l.leadCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{l.customerName}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{l.customerMobile}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    <p className="font-medium">{l.districtName}</p>
                    <p className="text-[10px] text-gray-400">{l.locality || 'City Sadar'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {l.serviceCategory}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                    ₹{l.estimatedValue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      l.status === 'booking_confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : l.status === 'booking_ready'
                        ? 'bg-teal-50 text-[#0F766E] border border-teal-200'
                        : l.status === 'qualified'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {l.assignedStaffName}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <select
                      value={l.status}
                      onChange={(e) => handleStatusChange(l.id, e.target.value as LeadStatus)}
                      className="px-2 py-1 text-[11px] border border-gray-300 rounded font-medium focus:border-[#0F766E] focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="booking_ready">Booking Ready</option>
                      <option value="booking_confirmed">Booking Confirmed</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Add Customer Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Ramesh Sahu"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value)}
                    placeholder="+91 9437..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">District</label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Saheed Nagar"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Service Category</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="HVAC / AC Deep Cleaning">HVAC / AC Deep Cleaning</option>
                  <option value="Plumbing & Water Purifier">Plumbing & Water Purifier</option>
                  <option value="Electrical & Power Backup">Electrical & Power Backup</option>
                  <option value="Home Deep Cleaning">Home Deep Cleaning</option>
                  <option value="Appliance Repair">Appliance Repair (Washing Machine / Refrigerator)</option>
                  <option value="Pest Control">Pest Control</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estimated Value (INR)</label>
                <input
                  type="number"
                  min="300"
                  step="50"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Enquiry Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify customer preferred time slot or appliance brand..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
