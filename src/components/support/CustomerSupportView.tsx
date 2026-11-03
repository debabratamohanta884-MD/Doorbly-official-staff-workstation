/**
 * CUSTOMER SUPPORT & QUALITY ASSURANCE - Section 12
 * Handles customer tickets, complaint categories, resolution notes,
 * customer confirmation, and district escalation.
 */

import React, { useState } from 'react';
import {
  Headphones,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldAlert,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import { ComplaintTicket, StaffProfile, TicketPriority, TicketStatus } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface CustomerSupportViewProps {
  currentUser: StaffProfile;
}

export const CustomerSupportView: React.FC<CustomerSupportViewProps> = ({ currentUser }) => {
  const [tickets, setTickets] = useState<ComplaintTicket[]>(StorageEngine.getTickets());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Form state
  const [custId, setCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [districtId, setDistrictId] = useState(currentUser.districtId || 'khordha');
  const [category, setCategory] = useState('Service Quality');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [description, setDescription] = useState('');

  const districts = StorageEngine.getDistricts();

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.ticketCode.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.complaintCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId) return;

    StorageEngine.updateTicketStatus(
      resolvingTicketId,
      'resolved',
      resolutionNotes.trim() || 'Verified resolution with customer phone call.',
      currentUser
    );

    setTickets(StorageEngine.getTickets());
    setResolvingTicketId(null);
    setResolutionNotes('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !description.trim()) return;

    const dist = districts.find(d => d.id === districtId);
    StorageEngine.createTicket(
      {
        customerId: custId.trim() || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: custName.trim(),
        districtId: districtId,
        districtName: dist?.name || 'Khordha',
        complaintCategory: category,
        description: description.trim(),
        priority: priority,
        status: 'open',
        assignedStaffId: currentUser.id,
        assignedStaffName: currentUser.fullName,
        escalatedToManager: priority === 'critical'
      },
      currentUser
    );

    setTickets(StorageEngine.getTickets());
    setIsNewTicketOpen(false);
    setCustName('');
    setCustId('');
    setDescription('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Support & Grievance
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{filteredTickets.length} Active Tickets</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Customer Support & Grievance Redressal
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Resolve service quality queries, technician punctuality disputes, and record customer satisfaction.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Support Ticket</span>
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
            placeholder="Search ticket code, customer, or category..."
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
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated to DM</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((t) => {
          const isResolved = t.status === 'resolved';

          return (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-gray-300 transition flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold bg-[#F7F9FA] border border-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    {t.ticketCode}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    t.priority === 'critical'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : t.priority === 'high'
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {t.priority}
                  </span>
                  <span className="font-semibold text-gray-700">{t.complaintCategory}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 font-medium">{t.districtName}</span>
                </div>

                <h3 className="text-xs font-bold text-gray-900">
                  Customer: {t.customerName} ({t.customerId})
                </h3>
                <p className="text-gray-700 leading-relaxed bg-[#F7F9FA] p-2.5 rounded-lg border border-gray-100">
                  "{t.description}"
                </p>

                {t.resolutionNotes && (
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-[11px]">
                    <strong>Resolution Logged:</strong> {t.resolutionNotes}
                  </div>
                )}

                <div className="flex items-center space-x-3 text-[11px] text-gray-400 pt-1">
                  <span>Assigned: {t.assignedStaffName}</span>
                  <span>•</span>
                  <span>Registered: {new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                  {t.escalatedToManager && (
                    <span className="text-red-600 font-semibold bg-red-50 px-1.5 rounded">
                      Escalated to District Manager
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Actions */}
              <div className="shrink-0 flex items-center space-x-2 md:self-center">
                {isResolved ? (
                  <span className="text-xs font-bold text-[#16865D] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-[#16865D]" />
                    <span>Resolved & Confirmed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setResolvingTicketId(t.id)}
                    className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-md transition shadow-xs"
                  >
                    Resolve Ticket
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Ticket Modal */}
      {resolvingTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Resolve Complaint Ticket</h3>
              <button onClick={() => setResolvingTicketId(null)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleResolve} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Resolution Summary & Customer Confirmation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail action taken (e.g. Technician revisited and completed repair under warranty, customer confirmed satisfactory cooling)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicketId(null)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#16865D] hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Raise Customer Grievance Ticket</h3>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Minati Das"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer / Booking ID</label>
                  <input
                    type="text"
                    value={custId}
                    onChange={(e) => setCustId(e.target.value)}
                    placeholder="e.g. DBL-BK-8891"
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
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none uppercase"
                  >
                    <option value="critical">Critical (Immediate Escalation)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Complaint Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Service Quality">Service Quality Discrepancy</option>
                  <option value="Technician Punctuality">Technician Delay / Punctuality</option>
                  <option value="Pricing / Billing">Pricing / Billing Dispute</option>
                  <option value="Partner Conduct">Partner Conduct & Behavior</option>
                  <option value="Warranty Claim">Post-Service Warranty Claim</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Issue Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Record customer remarks, appliance symptoms, and technician dispatched..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
                >
                  Log Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
