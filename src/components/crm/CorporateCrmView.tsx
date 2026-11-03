/**
 * CORPORATE SERVICES CRM (B2B ACQUISITION PIPELINE) - Section 12
 * 9-Stage Pipeline:
 * New Prospect → Contacted → Interested → Qualified → Meeting Scheduled → Site Inspection → Quotation → Negotiation → Contract Won / Lost
 */

import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  ChevronRight,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CorporateProspect, CorporatePipelineStage, StaffProfile } from '../../types/doorbly';
import { StorageEngine } from '../../services/storageEngine';

const PIPELINE_STAGES: { id: CorporatePipelineStage; label: string }[] = [
  { id: 'new_prospect', label: '1. New Prospect' },
  { id: 'contacted', label: '2. Contacted' },
  { id: 'interested', label: '3. Interested' },
  { id: 'qualified', label: '4. Qualified' },
  { id: 'meeting_scheduled', label: '5. Meeting Scheduled' },
  { id: 'site_inspection', label: '6. Site Inspection' },
  { id: 'quotation', label: '7. Quotation' },
  { id: 'negotiation', label: '8. Negotiation' },
  { id: 'contract_won', label: '9. Contract Won' }
];

interface CorporateCrmViewProps {
  currentUser: StaffProfile;
}

export const CorporateCrmView: React.FC<CorporateCrmViewProps> = ({ currentUser }) => {
  const [prospects, setProspects] = useState<CorporateProspect[]>(StorageEngine.getCorporateProspects());
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Deal State
  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState('IT / Commercial Software Park');
  const [contactPerson, setContactPerson] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [districtId, setDistrictId] = useState(currentUser.districtId || 'khordha');
  const [requirements, setRequirements] = useState('');
  const [annualValue, setAnnualValue] = useState(300000);
  const [nextFollowUp, setNextFollowUp] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const districts = StorageEngine.getDistricts();

  const filteredProspects = prospects.filter((p) => {
    if (selectedStage !== 'all' && p.pipelineStage !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.organizationName.toLowerCase().includes(q) ||
        p.contactPerson.toLowerCase().includes(q) ||
        p.prospectCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPipelineValue = prospects
    .filter(p => p.pipelineStage !== 'contract_lost')
    .reduce((sum, p) => sum + p.estimatedAnnualValue, 0);

  const handleStageAdvance = (id: string, stage: CorporatePipelineStage) => {
    StorageEngine.updateCorporateStage(id, stage, currentUser);
    setProspects(StorageEngine.getCorporateProspects());
  };

  const handleCreateProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !contactPerson.trim() || !mobile.trim()) return;

    const dist = districts.find(d => d.id === districtId);
    StorageEngine.createCorporateProspect(
      {
        organizationName: orgName.trim(),
        businessCategory: category,
        contactPerson: contactPerson.trim(),
        contactDesignation: contactDesignation.trim() || 'Facility Lead',
        mobile: mobile.trim(),
        email: email.trim(),
        districtId: districtId,
        districtName: dist?.name || 'Khordha',
        serviceRequirements: requirements.trim(),
        estimatedAnnualValue: annualValue,
        pipelineStage: 'new_prospect',
        nextFollowUpDate: nextFollowUp,
        assignedStaffId: currentUser.id,
        assignedStaffName: currentUser.fullName,
        notes: notes.trim()
      },
      currentUser
    );

    setProspects(StorageEngine.getCorporateProspects());
    setIsAddModalOpen(false);
    setOrgName('');
    setContactPerson('');
    setMobile('');
    setEmail('');
    setRequirements('');
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
              B2B Services Pipeline
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">9-Stage Acquisition Model</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Corporate Client Pipeline & High-Value Contracts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Commercial facility maintenance, hospital sanitization, and enterprise AMC contracts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#F7F9FA] border border-gray-200 rounded-xl p-2.5 px-4 text-right">
            <span className="text-[10px] font-semibold text-gray-500">Active Pipeline Value</span>
            <p className="text-lg font-black text-[#0F766E]">₹{totalPipelineValue.toLocaleString('en-IN')}</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add B2B Prospect</span>
          </button>
        </div>
      </div>

      {/* 9-Stage Pipeline Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex items-center space-x-1.5 overflow-x-auto horizontal-scroll-container text-xs pb-2">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition shrink-0 cursor-pointer ${
            selectedStage === 'all'
              ? 'bg-[#0F766E] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Deals ({prospects.length})
        </button>
        {PIPELINE_STAGES.map((s) => {
          const count = prospects.filter(p => p.pipelineStage === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStage(s.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition shrink-0 cursor-pointer ${
                selectedStage === s.id
                  ? 'bg-[#0F766E] text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Prospect Deal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[720px] overflow-y-auto custom-scrollbar pr-1">
        {filteredProspects.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] font-bold bg-[#F7F9FA] text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  {deal.prospectCode}
                </span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {deal.districtName}
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mt-2">{deal.organizationName}</h3>
              <p className="text-[11px] text-gray-500 font-medium">{deal.businessCategory}</p>

              <div className="bg-[#F7F9FA] rounded-lg p-2.5 border border-gray-100 text-xs mt-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium">{deal.contactPerson} ({deal.contactDesignation})</span>
                </div>
                <div className="flex items-center space-x-1.5 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono text-[11px]">{deal.mobile}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                {deal.serviceRequirements}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">Est. Annual Value:</span>
                <span className="font-bold text-gray-900">₹{deal.estimatedAnnualValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-gray-400">Pipeline Stage:</span>
                <select
                  value={deal.pipelineStage}
                  onChange={(e) => handleStageAdvance(deal.id, e.target.value as CorporatePipelineStage)}
                  className="text-xs px-2 py-1 font-semibold border border-gray-300 rounded focus:border-[#0F766E] focus:outline-none bg-white"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                  <option value="contract_lost">Contract Lost</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F9FA]">
              <h3 className="text-sm font-bold text-gray-900">Add B2B Corporate Prospect</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProspect} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. AIIMS Hospital Bhubaneswar or Nalco Corporate Office"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  >
                    <option value="IT / Commercial Software Park">IT / Commercial Software Park</option>
                    <option value="Healthcare & Hospital">Healthcare & Hospital</option>
                    <option value="Hospitality & Luxury Resort">Hospitality & Luxury Resort</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                    <option value="Educational University">Educational University</option>
                    <option value="Government & PSU">Government & PSU</option>
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Alok Das"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Mobile *</label>
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

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Service Requirements *</label>
                <textarea
                  rows={2}
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. 100-ton central chiller HVAC maintenance and bi-weekly deep sanitization..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estimated Annual Value (INR)</label>
                  <input
                    type="number"
                    min="50000"
                    step="10000"
                    value={annualValue}
                    onChange={(e) => setAnnualValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Next Follow-Up</label>
                  <input
                    type="date"
                    value={nextFollowUp}
                    onChange={(e) => setNextFollowUp(e.target.value)}
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
                  Register Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
