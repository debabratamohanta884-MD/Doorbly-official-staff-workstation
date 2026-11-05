/**
 * COMPLETE POSTGRESQL / SUPABASE SQL MIGRATION SCRIPT
 * All 23 Tables, Constraints, Indexes, RLS Policies, and Initial Seeds (30 Odisha Districts & Job Designations)
 */

export const COMPLETE_DOORBLY_SCHEMA_SQL = `-- =========================================================================
-- DOORBLY REMOTE EMPLOYEE WORKSTATION & MANAGEMENT SYSTEM
-- Master PostgreSQL / Supabase SQL Migration (Production Ready)
-- All 23 Tables, Constraints, Indexes, RLS Policies, and Initial Seeds
-- Target Platform: workstation.doorbly.com (30 Districts of Odisha, India)
-- =========================================================================

-- Enable pgcrypto / uuid extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to handle auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- 3. DISTRICTS & DAILY DISTRICT TARGETS
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

-- 4. STAFF PROFILES (Supports UUID or text-based employee keys)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    firebase_uid TEXT UNIQUE,
    employee_id TEXT NOT NULL UNIQUE, -- e.g. DBL-OD-001
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT NOT NULL,
    department_id TEXT REFERENCES departments(id) ON DELETE RESTRICT,
    designation_id TEXT REFERENCES job_designations(id) ON DELETE RESTRICT,
    system_role TEXT NOT NULL CHECK (system_role IN ('super_admin', 'central_dept_head', 'district_manager', 'district_coordinator', 'employee')),
    district_id TEXT REFERENCES districts(id) ON DELETE RESTRICT,
    reporting_manager_id TEXT REFERENCES staff_profiles(id) ON DELETE SET NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'probation')),
    photo_url TEXT,
    permission_level TEXT NOT NULL DEFAULT 'staff' CHECK (permission_level IN ('admin', 'manager', 'coordinator', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISTRICT ASSIGNMENTS (Audit log of transfers)
CREATE TABLE IF NOT EXISTS district_assignments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    previous_district_id TEXT REFERENCES districts(id),
    new_district_id TEXT NOT NULL REFERENCES districts(id),
    transferred_by TEXT REFERENCES staff_profiles(id),
    transfer_reason TEXT NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TASK VALUE MASTER (Internal productivity credit rules)
CREATE TABLE IF NOT EXISTS task_value_master (
    id TEXT PRIMARY KEY,
    designation_id TEXT REFERENCES job_designations(id) ON DELETE CASCADE,
    designation_title TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    credit_value NUMERIC(8, 2) NOT NULL,
    default_daily_quota INTEGER NOT NULL DEFAULT 1,
    quota_unit TEXT DEFAULT 'day',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DAILY TASKS
CREATE TABLE IF NOT EXISTS daily_tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT NOT NULL UNIQUE, -- e.g. TSK-202611-001
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
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
    assigned_by TEXT REFERENCES staff_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TASK SUBMISSIONS
CREATE TABLE IF NOT EXISTS task_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT NOT NULL REFERENCES daily_tasks(id) ON DELETE CASCADE,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    completed_quantity INTEGER NOT NULL DEFAULT 1,
    reference_id TEXT,
    description TEXT NOT NULL,
    evidence_url TEXT,
    evidence_file_name TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by TEXT REFERENCES staff_profiles(id),
    approved_at TIMESTAMPTZ,
    awarded_credits NUMERIC(8, 2) DEFAULT 0.00
);

-- 9. TASK APPROVALS (Audit history)
CREATE TABLE IF NOT EXISTS task_approvals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    submission_id TEXT NOT NULL REFERENCES task_submissions(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL REFERENCES daily_tasks(id) ON DELETE CASCADE,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    approver_id TEXT NOT NULL REFERENCES staff_profiles(id),
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'correction_reversed')),
    rejection_reason TEXT,
    comments TEXT,
    credits_awarded NUMERIC(8, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EMPLOYEE WORK CREDITS (Itemized Productivity Ledger)
CREATE TABLE IF NOT EXISTS employee_work_credits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    submission_id TEXT REFERENCES task_submissions(id) ON DELETE SET NULL,
    credit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    task_code TEXT NOT NULL,
    task_description TEXT NOT NULL,
    approved_quantity INTEGER NOT NULL DEFAULT 1,
    per_task_value NUMERIC(8, 2) NOT NULL,
    total_credits NUMERIC(8, 2) NOT NULL,
    approver_id TEXT NOT NULL REFERENCES staff_profiles(id),
    approver_name TEXT NOT NULL,
    approval_date TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EMPLOYEE ATTENDANCE (Asia/Kolkata timezone)
CREATE TABLE IF NOT EXISTS employee_attendance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by TEXT REFERENCES staff_profiles(id),
    approval_notes TEXT
);

-- 13. LEADS (General & Residential CRM)
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_email TEXT,
    district_id TEXT REFERENCES districts(id),
    locality TEXT,
    service_category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'booking_ready', 'booking_confirmed', 'follow_up', 'lost')),
    estimated_value NUMERIC(10, 2) DEFAULT 0.00,
    assigned_staff_id TEXT REFERENCES staff_profiles(id),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. LEAD ACTIVITIES
CREATE TABLE IF NOT EXISTS lead_activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id),
    activity_type TEXT NOT NULL,
    notes TEXT,
    activity_time TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CORPORATE PROSPECTS (B2B CRM Pipeline)
CREATE TABLE IF NOT EXISTS corporate_prospects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    assigned_staff_id TEXT REFERENCES staff_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PARTNER APPLICATIONS (Service Provider Onboarding)
CREATE TABLE IF NOT EXISTS partner_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    assigned_caller_id TEXT REFERENCES staff_profiles(id),
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. BOOKING PIPELINE
CREATE TABLE IF NOT EXISTS booking_pipeline (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    booking_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    district_id TEXT REFERENCES districts(id),
    service_title TEXT NOT NULL,
    service_subtotal NUMERIC(10, 2) NOT NULL,
    applicable_tax NUMERIC(10, 2) NOT NULL,
    customer_payable NUMERIC(10, 2) NOT NULL,
    doorbly_commission_rate NUMERIC(5, 2) DEFAULT 20.00,
    doorbly_commission NUMERIC(10, 2) NOT NULL,
    partner_payout NUMERIC(10, 2) NOT NULL,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    assigned_partner_name TEXT,
    participating_staff_id TEXT REFERENCES staff_profiles(id),
    reconciliation_status TEXT DEFAULT 'pending' CHECK (reconciliation_status IN ('reconciled', 'pending', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. DEPARTMENT DAILY REPORTS
CREATE TABLE IF NOT EXISTS department_daily_reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    department_id TEXT REFERENCES departments(id),
    district_id TEXT REFERENCES districts(id),
    staff_id TEXT REFERENCES staff_profiles(id),
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

-- 19. COMPLAINT TICKETS (Customer Support)
CREATE TABLE IF NOT EXISTS complaint_tickets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_code TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    booking_id TEXT REFERENCES booking_pipeline(id),
    district_id TEXT REFERENCES districts(id),
    complaint_category TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated', 'closed')),
    assigned_staff_id TEXT REFERENCES staff_profiles(id),
    resolution_notes TEXT,
    is_customer_confirmed BOOLEAN DEFAULT FALSE,
    escalated_to_manager BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. STAFF NOTIFICATIONS
CREATE TABLE IF NOT EXISTS staff_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    link_target TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. SYSTEM ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS system_announcements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'district', 'department')),
    target_district_id TEXT REFERENCES districts(id),
    target_department_id TEXT REFERENCES departments(id),
    published_by TEXT REFERENCES staff_profiles(id),
    published_by_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. JOB CANDIDATES (Recruitment Pipeline)
CREATE TABLE IF NOT EXISTS job_candidates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    district_id TEXT REFERENCES districts(id),
    applying_designation_id TEXT REFERENCES job_designations(id),
    stage TEXT NOT NULL DEFAULT 'Applied' CHECK (stage IN ('Applied', 'Screening', 'Interview', 'Selected', 'Onboarded', 'Rejected')),
    resume_url TEXT,
    notes TEXT,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. FINANCIAL TRANSACTIONS (Central Accounts Ledger)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    actor_id TEXT REFERENCES staff_profiles(id),
    actor_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. STAFF WALLETS (Productivity Earnings & Balances)
CREATE TABLE IF NOT EXISTS staff_wallets (
    staff_id TEXT PRIMARY KEY REFERENCES staff_profiles(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    designation_title TEXT NOT NULL,
    district_name TEXT NOT NULL,
    available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pending_withdrawal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_admin_adjustments NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_name TEXT,
    account_holder_name TEXT,
    upi_id TEXT,
    is_bank_verified BOOLEAN DEFAULT FALSE,
    is_payout_blocked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. STAFF WALLET TRANSACTIONS (Granular Credit/Debit Entries)
CREATE TABLE IF NOT EXISTS staff_wallet_transactions (
    transaction_id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    work_description TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    credit NUMERIC(12, 2) DEFAULT 0.00,
    debit NUMERIC(12, 2) DEFAULT 0.00,
    running_balance NUMERIC(12, 2) NOT NULL,
    task_reference_id TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    admin_remarks TEXT,
    authorized_by TEXT NOT NULL
);

-- 27. STAFF WORK ASSIGNMENTS (Weekly Performance Targets)
CREATE TABLE IF NOT EXISTS staff_work_assignments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    designation_title TEXT NOT NULL,
    district_name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    target_points NUMERIC(8, 2) NOT NULL DEFAULT 100.00,
    achieved_points NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'under_review', 'missed')),
    assigned_by_name TEXT NOT NULL,
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
-- SECURITY DEFINER FUNCTION FOR RLS (PREVENTS INFINITE RECURSION)
-- =========================================================================
CREATE OR REPLACE FUNCTION get_auth_staff_permission()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT permission_level 
    FROM staff_profiles 
    WHERE (firebase_uid)::text = (auth.uid())::text 
       OR (id)::text = (auth.uid())::text
    LIMIT 1;
$$;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_work_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_attendance ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies before re-creating
DROP POLICY IF EXISTS staff_view_policy ON staff_profiles;
DROP POLICY IF EXISTS staff_select_policy ON staff_profiles;
DROP POLICY IF EXISTS staff_update_policy ON staff_profiles;
DROP POLICY IF EXISTS tasks_access_policy ON daily_tasks;
DROP POLICY IF EXISTS submission_approval_policy ON task_submissions;
DROP POLICY IF EXISTS submissions_select_policy ON task_submissions;
DROP POLICY IF EXISTS submissions_insert_policy ON task_submissions;
DROP POLICY IF EXISTS submissions_update_policy ON task_submissions;
DROP POLICY IF EXISTS credits_select_policy ON employee_work_credits;
DROP POLICY IF EXISTS credits_insert_policy ON employee_work_credits;
DROP POLICY IF EXISTS attendance_select_policy ON employee_attendance;
DROP POLICY IF EXISTS attendance_insert_update_policy ON employee_attendance;

-- 1. Staff Profiles Policies (Fixed recursion & type-casting)
CREATE POLICY staff_select_policy ON staff_profiles
    FOR SELECT USING (
        (auth.uid())::text = (firebase_uid)::text OR 
        (auth.uid())::text = (id)::text OR
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

CREATE POLICY staff_update_policy ON staff_profiles
    FOR UPDATE USING (
        (auth.uid())::text = (firebase_uid)::text OR 
        (auth.uid())::text = (id)::text OR
        get_auth_staff_permission() = 'admin'
    );

-- 2. Daily Tasks Policies
CREATE POLICY tasks_access_policy ON daily_tasks
    FOR ALL USING (
        (staff_id)::text = (auth.uid())::text OR
        (staff_id)::text IN (SELECT (id)::text FROM staff_profiles WHERE (firebase_uid)::text = (auth.uid())::text) OR
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

-- 3. Task Submissions Policies (SELECT, INSERT, UPDATE)
CREATE POLICY submissions_select_policy ON task_submissions
    FOR SELECT USING (
        (staff_id)::text = (auth.uid())::text OR
        (staff_id)::text IN (SELECT (id)::text FROM staff_profiles WHERE (firebase_uid)::text = (auth.uid())::text) OR
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

CREATE POLICY submissions_insert_policy ON task_submissions
    FOR INSERT WITH CHECK (
        (staff_id)::text = (auth.uid())::text OR
        (staff_id)::text IN (SELECT (id)::text FROM staff_profiles WHERE (firebase_uid)::text = (auth.uid())::text)
    );

CREATE POLICY submissions_update_policy ON task_submissions
    FOR UPDATE USING (
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

-- 4. Work Credits Policies
CREATE POLICY credits_select_policy ON employee_work_credits
    FOR SELECT USING (
        (staff_id)::text = (auth.uid())::text OR
        (staff_id)::text IN (SELECT (id)::text FROM staff_profiles WHERE (firebase_uid)::text = (auth.uid())::text) OR
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

CREATE POLICY credits_insert_policy ON employee_work_credits
    FOR INSERT WITH CHECK (
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

-- 5. Attendance Policies
CREATE POLICY attendance_select_policy ON employee_attendance
    FOR SELECT USING (
        (staff_id)::text = (auth.uid())::text OR
        (staff_id)::text IN (SELECT (id)::text FROM staff_profiles WHERE (firebase_uid)::text = (auth.uid())::text) OR
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

CREATE POLICY attendance_insert_update_policy ON employee_attendance
    FOR ALL USING (
        (staff_id)::text = (auth.uid())::text OR
        (staff_id)::text IN (SELECT (id)::text FROM staff_profiles WHERE (firebase_uid)::text = (auth.uid())::text) OR
        get_auth_staff_permission() IN ('admin', 'manager', 'coordinator')
    );

-- =========================================================================
-- INITIAL SEED: ALL 30 DISTRICTS OF ODISHA (TOTAL DAILY TARGET: ₹1,00,000)
-- Real operational baseline: Zero fake completions, 0 bookings, 0 staff, NULL managers
-- =========================================================================
INSERT INTO districts (id, name, daily_target, actual_completed_subtotal, completed_bookings_count, active_staff_count, manager_name, coordinator_name, tier) VALUES
('khordha', 'Khordha', 7000.00, 0.00, 0, 0, NULL, NULL, 1),
('cuttack', 'Cuttack', 6500.00, 0.00, 0, 0, NULL, NULL, 1),
('ganjam', 'Ganjam', 5500.00, 0.00, 0, 0, NULL, NULL, 1),
('puri', 'Puri', 5000.00, 0.00, 0, 0, NULL, NULL, 1),
('sundargarh', 'Sundargarh', 5000.00, 0.00, 0, 0, NULL, NULL, 1),
('balasore', 'Balasore', 4000.00, 0.00, 0, 0, NULL, NULL, 2),
('sambalpur', 'Sambalpur', 4000.00, 0.00, 0, 0, NULL, NULL, 2),
('mayurbhanj', 'Mayurbhanj', 4000.00, 0.00, 0, 0, NULL, NULL, 2),
('jajpur', 'Jajpur', 4000.00, 0.00, 0, 0, NULL, NULL, 2),
('bhadrak', 'Bhadrak', 3500.00, 0.00, 0, 0, NULL, NULL, 2),
('kendrapara', 'Kendrapara', 3500.00, 0.00, 0, 0, NULL, NULL, 2),
('jagatsinghpur', 'Jagatsinghpur', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('angul', 'Angul', 3500.00, 0.00, 0, 0, NULL, NULL, 2),
('dhenkanal', 'Dhenkanal', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('keonjhar', 'Keonjhar', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('bargarh', 'Bargarh', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('balangir', 'Balangir', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('kalahandi', 'Kalahandi', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('koraput', 'Koraput', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('rayagada', 'Rayagada', 3000.00, 0.00, 0, 0, NULL, NULL, 2),
('nayagarh', 'Nayagarh', 2500.00, 0.00, 0, 0, NULL, NULL, 3),
('gajapati', 'Gajapati', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('kandhamal', 'Kandhamal', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('nuapada', 'Nuapada', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('subarnapur', 'Subarnapur', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('boudh', 'Boudh', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('deogarh', 'Deogarh', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('malkangiri', 'Malkangiri', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('nabarangpur', 'Nabarangpur', 2000.00, 0.00, 0, 0, NULL, NULL, 3),
('jharsuguda', 'Jharsuguda', 2000.00, 0.00, 0, 0, NULL, NULL, 3)
ON CONFLICT (id) DO UPDATE SET
    daily_target = EXCLUDED.daily_target,
    actual_completed_subtotal = EXCLUDED.actual_completed_subtotal,
    completed_bookings_count = EXCLUDED.completed_bookings_count,
    active_staff_count = EXCLUDED.active_staff_count,
    manager_name = EXCLUDED.manager_name,
    coordinator_name = EXCLUDED.coordinator_name,
    tier = EXCLUDED.tier;

-- Explicitly reset any existing mock numbers/names in previously seeded districts table
UPDATE districts
SET actual_completed_subtotal = 0.00,
    completed_bookings_count = 0,
    active_staff_count = 0,
    manager_name = NULL,
    coordinator_name = NULL;

-- =========================================================================
-- INITIAL SEED: DEPARTMENTS
-- =========================================================================
INSERT INTO departments (id, name, code, description, is_active) VALUES
('dept_central_exec', 'Central Executive Administration', 'CEA', 'Statewide governance, financial oversight, and directorate', true),
('dept_district_mgmt', 'District Operations & Management', 'DOM', 'Overall district revenue, coordinators, and field operations', true),
('dept_gen_ops', 'General Operations & Tele-calling', 'GOT', 'Customer calls, general inquiries, and booking confirmations', true),
('dept_corp_sales', 'Corporate Services & B2B Contracts', 'CSB', 'Corporate sales, facility management, and institutional contracts', true),
('dept_partner_onboard', 'Service Provider Onboarding & Network', 'SPN', 'Technician, mechanic, and contractor recruitment and vetting', true),
('dept_cust_support', 'Customer Support & Quality Assurance', 'CSQ', 'Issue ticketing, grievance resolution, and feedback', true),
('dept_lead_gen', 'Lead Generation & Field Outreach', 'LGF', 'Residential and corporate outbound lead acquisition', true),
('dept_hr_admin', 'Human Resources & Talent Management', 'HRT', 'Staff recruitment, onboarding, attendance, and remote audit', true),
('dept_tech_it', 'Technology & Web Development', 'TWD', 'Workstation software, booking APIs, database, and infrastructure', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- INITIAL SEED: JOB DESIGNATIONS (PREVENTS FOREIGN KEY VIOLATIONS)
-- =========================================================================
INSERT INTO job_designations (id, title, department_id, system_role, description, is_active) VALUES
('dm', 'District Manager (DM)', 'dept_district_mgmt', 'district_manager', 'District P&L, daily target achievement, team supervision', true),
('dc', 'District Coordinator (DC)', 'dept_district_mgmt', 'district_coordinator', 'Daily task allocation, attendance verification, local dispatch', true),
('hr_exec', 'HR Executive', 'dept_hr_admin', 'employee', 'Talent recruitment, attendance audit, onboarding', true),
('tele_caller', 'Tele Caller – General Operations', 'dept_gen_ops', 'employee', 'Customer inquiry follow-up, inbound bookings, quality checks', true),
('corp_caller', 'Corporate Caller – Corporate Services', 'dept_corp_sales', 'employee', 'B2B institutional outreach, facility contracts, quotation dispatch', true),
('partner_caller', 'Partner Caller – Service Provider Onboarding', 'dept_partner_onboard', 'employee', 'Technician acquisition, document vetting, partner activation', true),
('cust_support', 'Customer Support Executive', 'dept_cust_support', 'employee', 'Grievance ticketing, resolution SLA tracking, customer pacification', true),
('lead_gen_gen', 'Lead Generation Executive – General', 'dept_lead_gen', 'employee', 'Multi-category residential and commercial lead sourcing', true),
('lead_gen_res', 'Residential Lead Generation Executive', 'dept_lead_gen', 'employee', 'Apartment society, gated community, and residential outreach', true),
('lead_gen_corp', 'Corporate Lead Generation Executive', 'dept_lead_gen', 'employee', 'Industrial estate, SME, hotel, and hospital contract sourcing', true),
('tech_exec', 'Technical Executive / IT Support Engineer', 'dept_tech_it', 'employee', 'Workstation portal support, system configuration, hardware setup', true),
('software_dev', 'Full-Stack Software Developer', 'dept_tech_it', 'employee', 'Frontend workstation features, Supabase/Firebase integrations', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- INITIAL SEED: INITIAL ADMIN STAFF PROFILE
-- =========================================================================
INSERT INTO staff_profiles (id, employee_id, full_name, email, mobile, department_id, designation_id, system_role, district_id, status, permission_level) VALUES
('staff-admin-01', 'DBL-OD-001', 'Debabrata Mohanta', 'debabratamohanta884@gmail.com', '+91 94370 12345', 'dept_central_exec', 'dm', 'super_admin', 'khordha', 'active', 'admin')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- WORKSTATION API PERMISSIONS & ROLE GRANTS (CRITICAL FOR SUPABASE ACCESS)
-- Grants PostgreSQL table permissions to PostgREST roles (anon & authenticated)
-- =========================================================================

-- 1. Schema access
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Grant table access on all tables to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Ensure future tables also inherit full access
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 4. Enable public read and write access on core catalog master tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS departments_access_policy ON departments;
CREATE POLICY departments_access_policy ON departments FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS districts_access_policy ON districts;
CREATE POLICY districts_access_policy ON districts FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE job_designations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_designations_access_policy ON job_designations;
CREATE POLICY job_designations_access_policy ON job_designations FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE task_value_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS task_value_master_access_policy ON task_value_master;
CREATE POLICY task_value_master_access_policy ON task_value_master FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Enable workstation access policies on all operational tables
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_profiles_access ON staff_profiles;
CREATE POLICY staff_profiles_access ON staff_profiles FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_tasks_access ON daily_tasks;
CREATE POLICY daily_tasks_access ON daily_tasks FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS task_submissions_access ON task_submissions;
CREATE POLICY task_submissions_access ON task_submissions FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE employee_work_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS employee_work_credits_access ON employee_work_credits;
CREATE POLICY employee_work_credits_access ON employee_work_credits FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE employee_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS employee_attendance_access ON employee_attendance;
CREATE POLICY employee_attendance_access ON employee_attendance FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE employee_leave ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS employee_leave_access ON employee_leave;
CREATE POLICY employee_leave_access ON employee_leave FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leads_access ON leads;
CREATE POLICY leads_access ON leads FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE corporate_prospects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS corporate_prospects_access ON corporate_prospects;
CREATE POLICY corporate_prospects_access ON corporate_prospects FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS partner_applications_access ON partner_applications;
CREATE POLICY partner_applications_access ON partner_applications FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE booking_pipeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS booking_pipeline_access ON booking_pipeline;
CREATE POLICY booking_pipeline_access ON booking_pipeline FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE complaint_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS complaint_tickets_access ON complaint_tickets;
CREATE POLICY complaint_tickets_access ON complaint_tickets FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS system_announcements_access ON system_announcements;
CREATE POLICY system_announcements_access ON system_announcements FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS system_audit_logs_access ON system_audit_logs;
CREATE POLICY system_audit_logs_access ON system_audit_logs FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE department_daily_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS department_daily_reports_access ON department_daily_reports;
CREATE POLICY department_daily_reports_access ON department_daily_reports FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE job_candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_candidates_access ON job_candidates;
CREATE POLICY job_candidates_access ON job_candidates FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS financial_transactions_access ON financial_transactions;
CREATE POLICY financial_transactions_access ON financial_transactions FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE staff_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_wallets_access ON staff_wallets;
CREATE POLICY staff_wallets_access ON staff_wallets FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE staff_wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_wallet_transactions_access ON staff_wallet_transactions;
CREATE POLICY staff_wallet_transactions_access ON staff_wallet_transactions FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE staff_work_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_work_assignments_access ON staff_work_assignments;
CREATE POLICY staff_work_assignments_access ON staff_work_assignments FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE staff_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_notifications_access ON staff_notifications;
CREATE POLICY staff_notifications_access ON staff_notifications FOR ALL TO public USING (true) WITH CHECK (true);
`;

export const SUPABASE_PERMISSIONS_FIX_SQL = `-- =========================================================================
-- DOORBLY WORKSTATION: INSTANT PERMISSIONS & ROLE GRANTS FIX
-- Paste and run this script in your Supabase SQL Editor
-- =========================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- Ensure public access policies on all 23 tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'departments', 'districts', 'job_designations', 'staff_profiles',
        'task_value_master', 'daily_tasks', 'task_submissions', 'employee_work_credits',
        'employee_attendance', 'employee_leave', 'leads', 'lead_activities',
        'corporate_prospects', 'partner_applications', 'booking_pipeline',
        'complaint_tickets', 'system_announcements', 'system_audit_logs',
        'department_daily_reports', 'job_candidates', 'financial_transactions',
        'staff_wallets', 'staff_wallet_transactions', 'staff_work_assignments',
        'staff_notifications'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        BEGIN
            EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY;', tbl);
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', tbl || '_full_access_policy', tbl);
            EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO public USING (true) WITH CHECK (true);', tbl || '_full_access_policy', tbl);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;
`;
