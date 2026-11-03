-- =========================================================================
-- DOORBLY REMOTE EMPLOYEE WORKSTATION & MANAGEMENT SYSTEM
-- Master PostgreSQL / Supabase SQL Migration
-- All 23 Tables, Constraints, Indexes, RLS Policies, and Initial Seeds
-- Target Platform: workstation.doorbly.com (30 Districts of Odisha, India)
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    head_staff_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOB DESIGNATIONS
CREATE TABLE IF NOT EXISTS job_designations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department_id TEXT REFERENCES departments(id) ON DELETE RESTRICT,
    system_role TEXT NOT NULL CHECK (system_role IN ('super_admin', 'central_dept_head', 'district_manager', 'district_coordinator', 'employee')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISTRICTS & 18. DAILY DISTRICT TARGETS
CREATE TABLE IF NOT EXISTS districts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    daily_target NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
    actual_completed_subtotal NUMERIC(10, 2) DEFAULT 0.00,
    completed_bookings_count INTEGER DEFAULT 0,
    active_staff_count INTEGER DEFAULT 0,
    manager_name TEXT,
    coordinator_name TEXT,
    tier INTEGER CHECK (tier IN (1, 2, 3)) DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STAFF PROFILES (Connected to Firebase UID / Supabase Auth)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE,
    employee_id TEXT NOT NULL UNIQUE, -- e.g. DBL-OD-001
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT NOT NULL,
    department_id TEXT REFERENCES departments(id) ON DELETE RESTRICT,
    designation_id TEXT REFERENCES job_designations(id) ON DELETE RESTRICT,
    system_role TEXT NOT NULL CHECK (system_role IN ('super_admin', 'central_dept_head', 'district_manager', 'district_coordinator', 'employee')),
    district_id TEXT REFERENCES districts(id) ON DELETE RESTRICT,
    reporting_manager_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'probation')),
    photo_url TEXT,
    permission_level TEXT NOT NULL DEFAULT 'staff' CHECK (permission_level IN ('admin', 'manager', 'coordinator', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISTRICT ASSIGNMENTS (Audit log of transfers)
CREATE TABLE IF NOT EXISTS district_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    previous_district_id TEXT REFERENCES districts(id),
    new_district_id TEXT NOT NULL REFERENCES districts(id),
    transferred_by UUID REFERENCES staff_profiles(id),
    transfer_reason TEXT NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TASK VALUE MASTER (Internal productivity credit rules)
CREATE TABLE IF NOT EXISTS task_value_master (
    id TEXT PRIMARY KEY,
    designation_id TEXT REFERENCES job_designations(id) ON DELETE CASCADE,
    designation_title TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    credit_value NUMERIC(8, 2) NOT NULL, -- e.g. 50.00
    default_daily_quota INTEGER NOT NULL DEFAULT 1,
    quota_unit TEXT DEFAULT 'day',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DAILY TASKS
CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id TEXT NOT NULL UNIQUE, -- e.g. TSK-202611-001
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES departments(id),
    designation_id TEXT REFERENCES job_designations(id),
    district_id TEXT REFERENCES districts(id),
    task_title TEXT NOT NULL,
    task_description TEXT,
    task_value_credit NUMERIC(8, 2) NOT NULL,
    target_quantity INTEGER NOT NULL DEFAULT 1,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'reassigned', 'cancelled')),
    required_evidence_type TEXT DEFAULT 'document',
    assigned_by UUID REFERENCES staff_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TASK SUBMISSIONS
CREATE TABLE IF NOT EXISTS task_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES daily_tasks(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    completed_quantity INTEGER NOT NULL DEFAULT 1,
    reference_id TEXT, -- lead code or booking code
    description TEXT NOT NULL,
    evidence_url TEXT,
    evidence_file_name TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by UUID REFERENCES staff_profiles(id),
    approved_at TIMESTAMPTZ,
    awarded_credits NUMERIC(8, 2) DEFAULT 0.00
);

-- 8. TASK APPROVALS (Audit history)
CREATE TABLE IF NOT EXISTS task_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES task_submissions(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES daily_tasks(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES staff_profiles(id),
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'correction_reversed')),
    rejection_reason TEXT,
    comments TEXT,
    credits_awarded NUMERIC(8, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EMPLOYEE WORK CREDITS (Itemized Productivity Ledger)
CREATE TABLE IF NOT EXISTS employee_work_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES task_submissions(id) ON DELETE SET NULL,
    credit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    task_code TEXT NOT NULL,
    task_description TEXT NOT NULL,
    approved_quantity INTEGER NOT NULL DEFAULT 1,
    per_task_value NUMERIC(8, 2) NOT NULL,
    total_credits NUMERIC(8, 2) NOT NULL,
    approver_id UUID NOT NULL REFERENCES staff_profiles(id),
    approver_name TEXT NOT NULL,
    approval_date TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EMPLOYEE ATTENDANCE (Asia/Kolkata timezone)
CREATE TABLE IF NOT EXISTS employee_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    login_time TIME,
    logout_time TIME,
    total_working_minutes INTEGER DEFAULT 0,
    break_minutes INTEGER DEFAULT 0,
    is_on_break BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'approved_leave', 'weekly_off')),
    location_verified BOOLEAN DEFAULT FALSE,
    location_note TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, work_date)
);

-- 12. EMPLOYEE LEAVE
CREATE TABLE IF NOT EXISTS employee_leave (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES staff_profiles(id),
    approval_notes TEXT
);

-- 13. LEADS (General & Residential CRM)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_code TEXT NOT NULL UNIQUE, -- e.g. LD-1049
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_email TEXT,
    district_id TEXT REFERENCES districts(id),
    locality TEXT,
    service_category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'booking_ready', 'booking_confirmed', 'follow_up', 'lost')),
    estimated_value NUMERIC(10, 2) DEFAULT 0.00,
    assigned_staff_id UUID REFERENCES staff_profiles(id),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. LEAD ACTIVITIES
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff_profiles(id),
    activity_type TEXT NOT NULL,
    notes TEXT,
    activity_time TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CORPORATE PROSPECTS (B2B CRM Pipeline)
CREATE TABLE IF NOT EXISTS corporate_prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_code TEXT NOT NULL UNIQUE,
    organization_name TEXT NOT NULL,
    business_category TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_designation TEXT,
    mobile TEXT NOT NULL,
    email TEXT,
    district_id TEXT REFERENCES districts(id),
    service_requirements TEXT NOT NULL,
    estimated_annual_value NUMERIC(12, 2) DEFAULT 0.00,
    pipeline_stage TEXT NOT NULL DEFAULT 'new_prospect' CHECK (pipeline_stage IN ('new_prospect', 'contacted', 'interested', 'qualified', 'meeting_scheduled', 'site_inspection', 'quotation', 'negotiation', 'contract_won', 'contract_lost')),
    next_follow_up_date DATE,
    assigned_staff_id UUID REFERENCES staff_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PARTNER APPLICATIONS (Service Provider Onboarding)
CREATE TABLE IF NOT EXISTS partner_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_code TEXT NOT NULL UNIQUE,
    partner_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    district_id TEXT REFERENCES districts(id),
    locality TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    service_categories TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 1,
    document_verified BOOLEAN DEFAULT FALSE,
    application_status TEXT NOT NULL DEFAULT 'applied' CHECK (application_status IN ('applied', 'document_collected', 'verified', 'approved', 'activated', 'rejected')),
    assigned_caller_id UUID REFERENCES staff_profiles(id),
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. BOOKING PIPELINE (Existing Doorbly booking references)
CREATE TABLE IF NOT EXISTS booking_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT NOT NULL UNIQUE, -- e.g. DBL-BK-8891
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    district_id TEXT REFERENCES districts(id),
    service_title TEXT NOT NULL,
    service_subtotal NUMERIC(10, 2) NOT NULL, -- Completed service value before taxes
    applicable_tax NUMERIC(10, 2) NOT NULL,   -- 18% GST
    customer_payable NUMERIC(10, 2) NOT NULL, -- Total customer billing
    doorbly_commission_rate NUMERIC(5, 2) DEFAULT 20.00, -- 20% markup
    doorbly_commission NUMERIC(10, 2) NOT NULL,
    partner_payout NUMERIC(10, 2) NOT NULL,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    assigned_partner_name TEXT,
    participating_staff_id UUID REFERENCES staff_profiles(id),
    reconciliation_status TEXT DEFAULT 'pending' CHECK (reconciliation_status IN ('reconciled', 'pending', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. DEPARTMENT DAILY REPORTS
CREATE TABLE IF NOT EXISTS department_daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    department_id TEXT REFERENCES departments(id),
    district_id TEXT REFERENCES districts(id),
    staff_id UUID REFERENCES staff_profiles(id),
    assigned_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    pending_tasks INTEGER DEFAULT 0,
    approved_tasks INTEGER DEFAULT 0,
    rejected_tasks INTEGER DEFAULT 0,
    productivity_credits NUMERIC(8, 2) DEFAULT 0.00,
    leads_generated INTEGER DEFAULT 0,
    bookings_generated INTEGER DEFAULT 0,
    revenue_attributed NUMERIC(10, 2) DEFAULT 0.00,
    problems_encountered TEXT,
    next_day_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_date, department_id, staff_id)
);

-- 20. COMPLAINT TICKETS (Customer Support)
CREATE TABLE IF NOT EXISTS complaint_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    booking_id UUID REFERENCES booking_pipeline(id),
    district_id TEXT REFERENCES districts(id),
    complaint_category TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated', 'closed')),
    assigned_staff_id UUID REFERENCES staff_profiles(id),
    resolution_notes TEXT,
    is_customer_confirmed BOOLEAN DEFAULT FALSE,
    escalated_to_manager BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. STAFF NOTIFICATIONS
CREATE TABLE IF NOT EXISTS staff_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    link_target TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. SYSTEM ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'district', 'department')),
    target_district_id TEXT REFERENCES districts(id),
    target_department_id TEXT REFERENCES departments(id),
    published_by UUID REFERENCES staff_profiles(id),
    published_by_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED ACROSS ALL 30 DISTRICTS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_staff_district ON staff_profiles(district_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff_profiles(system_role);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_staff ON daily_tasks(staff_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_deadline ON daily_tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON task_submissions(task_id, status);
CREATE INDEX IF NOT EXISTS idx_credits_staff ON employee_work_credits(staff_id, credit_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON employee_attendance(work_date, staff_id);
CREATE INDEX IF NOT EXISTS idx_leads_district ON leads(district_id, status);
CREATE INDEX IF NOT EXISTS idx_corp_prospects ON corporate_prospects(district_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_bookings_district ON booking_pipeline(district_id, booking_status);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_work_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_view_policy ON staff_profiles
    FOR SELECT USING (
        auth.uid() = firebase_uid OR 
        EXISTS (SELECT 1 FROM staff_profiles s WHERE s.firebase_uid = auth.uid() AND s.permission_level IN ('admin', 'manager', 'coordinator'))
    );

CREATE POLICY tasks_access_policy ON daily_tasks
    FOR ALL USING (
        staff_id IN (SELECT id FROM staff_profiles WHERE firebase_uid = auth.uid()) OR
        EXISTS (SELECT 1 FROM staff_profiles s WHERE s.firebase_uid = auth.uid() AND s.permission_level IN ('admin', 'manager', 'coordinator'))
    );

CREATE POLICY submission_approval_policy ON task_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff_profiles s 
            WHERE s.firebase_uid = auth.uid() 
            AND s.permission_level IN ('admin', 'manager', 'coordinator') 
            AND s.id != task_submissions.staff_id
        )
    );

-- =========================================================================
-- INITIAL SEED: ALL 30 DISTRICTS OF ODISHA (TOTAL TARGET: ₹1,00,000)
-- =========================================================================
INSERT INTO districts (id, name, daily_target, actual_completed_subtotal, completed_bookings_count, active_staff_count, manager_name, coordinator_name, tier) VALUES
('khordha', 'Khordha', 7000.00, 7350.00, 12, 8, 'Amit Pattanaik', 'Priya Das', 1),
('cuttack', 'Cuttack', 6500.00, 6200.00, 11, 7, 'Subhashree Nayak', 'Rakesh Sahoo', 1),
('ganjam', 'Ganjam', 5500.00, 5100.00, 9, 6, 'Bikash Mohapatra', 'Kunal Panda', 1),
('puri', 'Puri', 5000.00, 5250.00, 8, 5, 'Sasmita Rout', 'Anil Mishra', 1),
('sundargarh', 'Sundargarh', 5000.00, 4800.00, 7, 5, 'Rajesh Kujur', 'Manoj Ekka', 1),
('balasore', 'Balasore', 4000.00, 4100.00, 6, 4, 'Debabrata Barik', 'Suman Behera', 2),
('sambalpur', 'Sambalpur', 4000.00, 3950.00, 6, 4, 'Swagatika Pradhan', 'Ashok Bag', 2),
('mayurbhanj', 'Mayurbhanj', 4000.00, 3800.00, 5, 4, 'Jitendra Marandi', 'Deepak Tudu', 2),
('jajpur', 'Jajpur', 4000.00, 4050.00, 6, 4, 'Manas Parida', 'Alok Jena', 2),
('bhadrak', 'Bhadrak', 3500.00, 3400.00, 5, 3, 'Ranjit Biswal', 'Gourav Kar', 2),
('kendrapara', 'Kendrapara', 3500.00, 3600.00, 5, 3, 'Santosh Swain', 'Bibhu Dhal', 2),
('jagatsinghpur', 'Jagatsinghpur', 3000.00, 2900.00, 4, 3, 'Lopamudra Das', 'Soumya Ray', 2),
('angul', 'Angul', 3500.00, 3300.00, 5, 3, 'Prabhat Dehury', 'Tapas Sahu', 2),
('dhenkanal', 'Dhenkanal', 3000.00, 2800.00, 4, 3, 'Niranjan Rout', 'Bikram Bhanja', 2),
('keonjhar', 'Keonjhar', 3000.00, 3100.00, 4, 3, 'Chitta Mahanta', 'Sanjay Giri', 2),
('bargarh', 'Bargarh', 3000.00, 2950.00, 4, 3, 'Hemant Meher', 'Prakash Sahu', 2),
('balangir', 'Balangir', 3000.00, 2700.00, 4, 3, 'Biswajit Nag', 'Dillip Joshi', 2),
('kalahandi', 'Kalahandi', 3000.00, 2850.00, 4, 3, 'Sudhanshu Majhi', 'Ramesh Naik', 2),
('koraput', 'Koraput', 3000.00, 3050.00, 4, 3, 'Tarun Khosla', 'Hari Gouda', 2),
('rayagada', 'Rayagada', 3000.00, 2750.00, 3, 3, 'Srinivas Rao', 'Murali Pidika', 2),
('nayagarh', 'Nayagarh', 2500.00, 2400.00, 3, 2, 'Pradeep Tripathy', 'Satya Sundar', 3),
('gajapati', 'Gajapati', 2000.00, 1950.00, 3, 2, 'Kishore Gamang', 'Surya Gamango', 3),
('kandhamal', 'Kandhamal', 2000.00, 1800.00, 2, 2, 'Sunil Mallick', 'Judhistir Pradhan', 3),
('nuapada', 'Nuapada', 2000.00, 1900.00, 2, 2, 'Dharmendra Dandsena', 'Bhagaban Sahu', 3),
('subarnapur', 'Subarnapur', 2000.00, 1850.00, 2, 2, 'Binod Purohit', 'Girish Barik', 3),
('boudh', 'Boudh', 2000.00, 2050.00, 3, 2, 'Dipti Ranjan Kanhar', 'Abhimanyu Bag', 3),
('deogarh', 'Deogarh', 2000.00, 1750.00, 2, 2, 'Saroj Pradhan', 'Umesh Debata', 3),
('malkangiri', 'Malkangiri', 2000.00, 1700.00, 2, 2, 'Naveen Madhi', 'Kishore Khemundu', 3),
('nabarangpur', 'Nabarangpur', 2000.00, 1950.00, 2, 2, 'Trilochan Bhatra', 'Govind Santa', 3),
('jharsuguda', 'Jharsuguda', 2000.00, 2200.00, 3, 3, 'Gopal Agrawal', 'Vinod Sharma', 3)
ON CONFLICT (id) DO UPDATE SET
    daily_target = EXCLUDED.daily_target,
    actual_completed_subtotal = EXCLUDED.actual_completed_subtotal;

-- =========================================================================
-- INITIAL SEED: DEPARTMENTS
-- =========================================================================
INSERT INTO departments (id, name, code, description, is_active) VALUES
('dept_district_mgmt', 'District Operations & Management', 'DOM', 'Overall district revenue, coordinators, and field operations', true),
('dept_gen_ops', 'General Operations & Tele-calling', 'GOT', 'Customer calls, general inquiries, and booking confirmations', true),
('dept_corp_sales', 'Corporate Services & B2B Contracts', 'CSB', 'Corporate sales, facility management, and institutional contracts', true),
('dept_partner_onboard', 'Service Provider Onboarding & Network', 'SPN', 'Technician, mechanic, and contractor recruitment and vetting', true),
('dept_cust_support', 'Customer Support & Quality Assurance', 'CSQ', 'Issue ticketing, grievance resolution, and feedback', true),
('dept_lead_gen', 'Lead Generation & Field Outreach', 'LGF', 'Residential and corporate outbound lead acquisition', true),
('dept_hr_admin', 'Human Resources & Talent Management', 'HRT', 'Staff recruitment, onboarding, attendance, and remote audit', true),
('dept_tech_it', 'Technology & Web Development', 'TWD', 'Workstation software, booking APIs, database, and infrastructure', true),
('dept_central_exec', 'Central Executive Administration', 'CEA', 'Statewide governance, financial oversight, and directorate', true)
ON CONFLICT (id) DO NOTHING;
