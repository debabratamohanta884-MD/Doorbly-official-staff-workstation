/**
 * Master Departments and Designations for Doorbly Workstation
 */

import { Department, JobDesignation } from '../types/doorbly';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept_district_mgmt', name: 'District Operations & Management', code: 'DOM', description: 'Overall district revenue, coordinators, and field operations', isActive: true },
  { id: 'dept_gen_ops', name: 'General Operations & Tele-calling', code: 'GOT', description: 'Customer calls, general inquiries, and booking confirmations', isActive: true },
  { id: 'dept_corp_sales', name: 'Corporate Services & B2B Contracts', code: 'CSB', description: 'Corporate sales, facility management, and institutional contracts', isActive: true },
  { id: 'dept_partner_onboard', name: 'Service Provider Onboarding & Network', code: 'SPN', description: 'Technician, mechanic, and contractor recruitment and vetting', isActive: true },
  { id: 'dept_cust_support', name: 'Customer Support & Quality Assurance', code: 'CSQ', description: 'Issue ticketing, grievance resolution, and feedback', isActive: true },
  { id: 'dept_lead_gen', name: 'Lead Generation & Field Outreach', code: 'LGF', description: 'Residential and corporate outbound lead acquisition', isActive: true },
  { id: 'dept_hr_admin', name: 'Human Resources & Talent Management', code: 'HRT', description: 'Staff recruitment, onboarding, attendance, and remote audit', isActive: true },
  { id: 'dept_tech_it', name: 'Technology & Web Development', code: 'TWD', description: 'Workstation software, booking APIs, database, and infrastructure', isActive: true },
  { id: 'dept_central_exec', name: 'Central Executive Administration', code: 'CEA', description: 'Statewide governance, financial oversight, and directorate', isActive: true }
];

export const INITIAL_DESIGNATIONS: JobDesignation[] = [
  {
    id: 'dm',
    title: 'District Manager (DM)',
    departmentId: 'dept_district_mgmt',
    systemRole: 'district_manager',
    description: 'Responsible for district target realization (₹1 Lakh statewide), partner network, and team supervision',
    isActive: true
  },
  {
    id: 'dc',
    title: 'District Coordinator (DC)',
    departmentId: 'dept_district_mgmt',
    systemRole: 'district_coordinator',
    description: 'Manages field dispatch, employee daily attendance, booking status verification, and work allocation',
    isActive: true
  },
  {
    id: 'hr_exec',
    title: 'HR Executive',
    departmentId: 'dept_hr_admin',
    systemRole: 'employee',
    description: 'Candidate sourcing, screening, interview scheduling, remote onboarding, and attendance audits',
    isActive: true
  },
  {
    id: 'tele_caller',
    title: 'Tele Caller – General Operations',
    departmentId: 'dept_gen_ops',
    systemRole: 'employee',
    description: 'Outbound customer outreach, customer queries, booking confirmations, and pending booking recovery',
    isActive: true
  },
  {
    id: 'corp_caller',
    title: 'Corporate Caller – Corporate Services',
    departmentId: 'dept_corp_sales',
    systemRole: 'employee',
    description: 'B2B institutional client calls, decision-maker verification, site visit scheduling, and quotations',
    isActive: true
  },
  {
    id: 'partner_caller',
    title: 'Partner Caller – Service Provider Onboarding',
    departmentId: 'dept_partner_onboard',
    systemRole: 'employee',
    description: 'Service provider prospect calls, skill verification, document collection, and partner activation',
    isActive: true
  },
  {
    id: 'cust_support',
    title: 'Customer Support Executive',
    departmentId: 'dept_cust_support',
    systemRole: 'employee',
    description: 'Ticket handling, complaint resolution, completion verification, and customer feedback',
    isActive: true
  },
  {
    id: 'lead_gen_gen',
    title: 'Lead Generation Executive – General',
    departmentId: 'dept_lead_gen',
    systemRole: 'employee',
    description: 'Outbound prospect qualification, service interest mapping, and booking-ready leads generation',
    isActive: true
  },
  {
    id: 'lead_gen_res',
    title: 'Residential Lead Generation Executive',
    departmentId: 'dept_lead_gen',
    systemRole: 'employee',
    description: 'Household residential outreach, maintenance requirement gathering, and confirmed residential bookings',
    isActive: true
  },
  {
    id: 'lead_gen_corp',
    title: 'Corporate Lead Generation Executive',
    departmentId: 'dept_lead_gen',
    systemRole: 'employee',
    description: 'Commercial prospect research, enterprise outreach, corporate quotations, and corporate contract pipelines',
    isActive: true
  },
  {
    id: 'tech_exec',
    title: 'Technical Executive / IT Support Engineer',
    departmentId: 'dept_tech_it',
    systemRole: 'employee',
    description: 'Platform health monitoring, booking flow verification, notification tests, database and security checks',
    isActive: true
  },
  {
    id: 'software_dev',
    title: 'Software Developer / Web Developer',
    departmentId: 'dept_tech_it',
    systemRole: 'employee',
    description: 'Workstation web application features, bug fixes, UI/UX polish, Supabase migrations, and deployment testing',
    isActive: true
  }
];
