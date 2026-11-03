/**
 * BOOKING PIPELINE & REVENUE RECONCILIATION - Section 18
 * Tracks service subtotal, 18% GST, customer payable, 20% Doorbly markup model,
 * partner payout, and payment reconciliation.
 */

import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { BookingRecord, BookingStatus, PaymentStatus, StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface BookingPipelineViewProps {
  currentUser: StaffProfile;
}

export const BookingPipelineView: React.FC<BookingPipelineViewProps> = ({ currentUser }) => {
  const [bookings, setBookings] = useState<BookingRecord[]>(StorageEngine.getBookings());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Booking State
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [districtId, setDistrictId] = useState(currentUser.districtId || 'khordha');
  const [serviceTitle, setServiceTitle] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [partnerName, setPartnerName] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 16));

  const districts = StorageEngine.getDistricts();

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.serviceTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Financial aggregates
  const totalSubtotal = bookings
    .filter(b => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.serviceSubtotal, 0);

  const totalDoorblyCommission = bookings
    .filter(b => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.doorblyCommission, 0);

  const totalPartnerPayouts = bookings
    .filter(b => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.partnerPayout, 0);

  const totalTaxes = bookings
    .filter(b => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + b.applicableTax, 0);

  const handleStatusUpdate = (id: string, bStatus: BookingStatus, pStatus: PaymentStatus) => {
    StorageEngine.updateBookingStatus(id, bStatus, pStatus, currentUser);
    setBookings(StorageEngine.getBookings());
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim()) return;

    StorageEngine.createBooking(
      {
        customerName: custName.trim(),
        customerMobile: custMobile.trim(),
        districtId: districtId,
        serviceTitle: serviceTitle.trim(),
        serviceSubtotal: subtotal,
        scheduledDate: scheduledDate,
        assignedPartnerName: partnerName.trim() || undefined
      },
      currentUser
    );

    setBookings(StorageEngine.getBookings());
    setIsAddModalOpen(false);
    setCustName('');
    setCustMobile('');
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Financial Operations
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">20% Doorbly Markup Pricing Model</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Customer Bookings & Revenue Reconciliation
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Transparent split between service subtotal, 18% GST, 20% Doorbly platform commission, and partner payout.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Booking</span>
        </button>
      </div>

      {/* Financial Split KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Completed Service Subtotal</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalSubtotal.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">Base value before applicable taxes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Doorbly 20% Commission</span>
          <p className="text-2xl font-bold text-[#0F766E] mt-2">₹{totalDoorblyCommission.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">Actual company net margin</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Partner Payout (80%)</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">₹{totalPartnerPayouts.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">Technician earnings payable</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">GST Collected (18%)</span>
          <p className="text-2xl font-bold text-gray-700 mt-2">₹{totalTaxes.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-gray-400 mt-1">Statutory government tax liability</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking code, customer, or service..."
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
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed & Verified</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto horizontal-scroll-container max-h-[550px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-4 py-3">Booking Code</th>
                <th className="px-4 py-3">Customer & Contact</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Service Deliverable</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Customer Total (incl. GST)</th>
                <th className="px-4 py-3 text-right">Doorbly 20%</th>
                <th className="px-4 py-3 text-right">Partner 80%</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3 font-mono font-bold text-gray-800 whitespace-nowrap">
                    {b.bookingCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{b.customerName}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{b.customerMobile}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                    {b.districtName}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium max-w-xs truncate">
                    {b.serviceTitle}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                    ₹{b.serviceSubtotal}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                    ₹{b.customerPayable}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#0F766E] whitespace-nowrap">
                    ₹{b.doorblyCommission}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700 font-medium whitespace-nowrap">
                    ₹{b.partnerPayout}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      b.bookingStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.bookingStatus === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : b.bookingStatus === 'cancelled'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {b.bookingStatus !== 'completed' && (
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'completed', 'paid')}
                        className="px-2.5 py-1 bg-[#16865D] hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                      >
                        Mark Completed & Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Record New Customer Booking</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Priyabrata Jena"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile *</label>
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
                  <label className="block font-semibold text-gray-700 mb-1">Service Subtotal (INR)</label>
                  <input
                    type="number"
                    min="300"
                    step="100"
                    value={subtotal}
                    onChange={(e) => setSubtotal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="e.g. Master Bathroom Water Leakage Fix & Tile Sealing"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Partner / Tech</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Santosh Swain (Technician)"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              {/* Realtime breakdown preview */}
              <div className="p-3 bg-[#F7F9FA] rounded-lg border border-gray-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Total (incl. 18% GST):</span>
                  <span className="font-bold text-gray-900">₹{subtotal + Math.round(subtotal * 0.18)}</span>
                </div>
                <div className="flex justify-between text-teal-700">
                  <span>Doorbly 20% Markup Commission:</span>
                  <span className="font-bold">₹{Math.round(subtotal * 0.20)}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>Partner Payout (80%):</span>
                  <span className="font-bold">₹{subtotal - Math.round(subtotal * 0.20)}</span>
                </div>
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
