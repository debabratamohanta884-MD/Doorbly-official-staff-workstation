/**
 * PARTNER ONBOARDING & NETWORK MANAGEMENT - Section 12
 * Service provider recruitment: Plumbers, Electricians, AC Mechanics, Deep Cleaners across Odisha.
 * Application stages: Applied → Document Collected → Verified → Approved → Activated
 */

import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Phone,
  MapPin,
  Plus,
  AlertCircle
} from 'lucide-react';
import { PartnerApplication, PartnerApplicationStatus, StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

interface PartnerOnboardingViewProps {
  currentUser: StaffProfile;
}

export const PartnerOnboardingView: React.FC<PartnerOnboardingViewProps> = ({ currentUser }) => {
  const [partners, setPartners] = useState<PartnerApplication[]>(StorageEngine.getPartners());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Partner Form
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [districtId, setDistrictId] = useState(currentUser.districtId || 'khordha');
  const [locality, setLocality] = useState('');
  const [experience, setExperience] = useState(1);
  const [skills, setSkills] = useState('');
  const [category, setCategory] = useState('HVAC / Appliance');

  const districts = StorageEngine.getDistricts();

  const filteredPartners = partners.filter((p) => {
    if (statusFilter !== 'all' && p.applicationStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.partnerName.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        p.partnerCode.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (id: string, newStatus: PartnerApplicationStatus) => {
    StorageEngine.updatePartnerStatus(id, newStatus, currentUser);
    setPartners(StorageEngine.getPartners());
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    const dist = districts.find(d => d.id === districtId);
    StorageEngine.createPartner(
      {
        partnerName: name.trim(),
        mobile: mobile.trim(),
        districtId: districtId,
        districtName: dist?.name || 'Khordha',
        locality: locality.trim() || 'Town Center',
        skills: skills.split(',').map(s => s.trim()),
        serviceCategories: [category],
        experienceYears: experience,
        documentVerified: false,
        applicationStatus: 'applied',
        assignedCallerId: currentUser.id,
        assignedCallerName: currentUser.fullName
      },
      currentUser
    );

    setPartners(StorageEngine.getPartners());
    setIsAddModalOpen(false);
    setName('');
    setMobile('');
    setLocality('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              Service Network
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{filteredPartners.length} Providers in Funnel</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Service Provider Recruitment & Onboarding
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Recruit, vet KYC documentation, approve, and activate verified technicians across Odisha.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Partner Application</span>
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
            placeholder="Search by technician name, mobile, or locality..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-medium">Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="document_collected">Document Collected</option>
            <option value="verified">KYC Verified</option>
            <option value="approved">Approved</option>
            <option value="activated">Activated for Jobs</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Partner Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto horizontal-scroll-container max-h-[580px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FA] text-gray-600 border-b border-gray-200 font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-4 py-3">Partner ID</th>
                <th className="px-4 py-3">Technician Name</th>
                <th className="px-4 py-3">District / Locality</th>
                <th className="px-4 py-3">Trade Skills</th>
                <th className="px-4 py-3 text-center">Experience</th>
                <th className="px-4 py-3 text-center">KYC Docs</th>
                <th className="px-4 py-3">Onboarding Stage</th>
                <th className="px-4 py-3 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPartners.map((ptr) => (
                <tr key={ptr.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3 font-mono font-bold text-gray-700 whitespace-nowrap">
                    {ptr.partnerCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{ptr.partnerName}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{ptr.mobile}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-gray-800">{ptr.districtName}</p>
                    <p className="text-[10px] text-gray-400">{ptr.locality}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {ptr.skills.map((s, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-700">
                    {ptr.experienceYears} Yrs
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {ptr.documentVerified ? (
                      <span className="text-[10px] font-bold text-[#16865D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pending KYC
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      ptr.applicationStatus === 'activated'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ptr.applicationStatus === 'approved'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {ptr.applicationStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <select
                      value={ptr.applicationStatus}
                      onChange={(e) => handleStatusChange(ptr.id, e.target.value as PartnerApplicationStatus)}
                      className="px-2 py-1 text-[11px] border border-gray-300 rounded font-medium focus:border-[#0F766E] focus:outline-none bg-white"
                    >
                      <option value="applied">Applied</option>
                      <option value="document_collected">Doc Collected</option>
                      <option value="verified">Verified</option>
                      <option value="approved">Approved</option>
                      <option value="activated">Activated</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Register Partner Application</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Provider Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Behera"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
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
                  <label className="block font-semibold text-gray-700 mb-1">Locality / Block</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Berhampur Town"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Primary Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="HVAC / Appliance">HVAC / Appliance Technician</option>
                  <option value="Electrical">Licensed Electrician</option>
                  <option value="Plumbing">Plumber & Sanitary Specialist</option>
                  <option value="Deep Cleaning">Deep Cleaning Contractor</option>
                  <option value="Carpentry">Carpenter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="1"
                    value={experience}
                    onChange={(e) => setExperience(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Trade Skills (comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Split AC, Gas Charging"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
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
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
