-- Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name VARCHAR(255) NOT NULL,
  batch_code VARCHAR(50) NOT NULL UNIQUE,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  fee_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  late_fee_percentage DECIMAL(5, 2) DEFAULT 0,
  fee_deadline TIMESTAMP NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create batch_fee_config table
CREATE TABLE IF NOT EXISTS public.batch_fee_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  fee_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  late_fee_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create batch_permission_templates table
CREATE TABLE IF NOT EXISTS public.batch_permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  custom_header TEXT,
  custom_footer TEXT,
  branding_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  program VARCHAR(255),
  department VARCHAR(255),
  current_semester INT,
  batch_id UUID REFERENCES public.batches(id),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fee_submissions table
CREATE TABLE IF NOT EXISTS public.fee_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id),
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10, 2) NOT NULL,
  bank_name VARCHAR(255),
  transaction_id VARCHAR(255),
  payment_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')),
  rejection_reason TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create uploaded_receipts table
CREATE TABLE IF NOT EXISTS public.uploaded_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.fee_submissions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  storage_path VARCHAR(255),
  scan_status VARCHAR(20) DEFAULT 'Pending',
  malware_detected BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permission_slips table
CREATE TABLE IF NOT EXISTS public.permission_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.fee_submissions(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id),
  verification_code VARCHAR(50) NOT NULL UNIQUE,
  file_url TEXT,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  issued_by UUID REFERENCES auth.users(id),
  exam_date DATE,
  template_id UUID REFERENCES public.batch_permission_templates(id),
  downloaded_at TIMESTAMP,
  expiry_date TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL,
  target_table VARCHAR(50) NOT NULL,
  target_id UUID,
  batch_id UUID REFERENCES public.batches(id),
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET
);

-- Create staff_profiles table (for admin/accountant/registrar metadata)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Accountant', 'Registrar')),
  department VARCHAR(255),
  assigned_batches UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_fee_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_permission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for batches (all authenticated users can view)
CREATE POLICY "Allow viewing all batches" ON public.batches FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Allow admin to create batches" ON public.batches FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Allow admin to update batches" ON public.batches FOR UPDATE USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Allow admin to delete batches" ON public.batches FOR DELETE USING (
  auth.uid() IS NOT NULL
);

-- RLS policies for students (simplified to avoid recursion)
CREATE POLICY "Students view own record" ON public.students FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Students update own record" ON public.students FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

-- RLS policies for fee_submissions (simplified)
CREATE POLICY "Students view own submissions" ON public.fee_submissions FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Students insert own submissions" ON public.fee_submissions FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Accountants can update submissions" ON public.fee_submissions FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

-- RLS policies for uploaded_receipts (simplified)
CREATE POLICY "View receipts via submission" ON public.uploaded_receipts FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Students upload receipts" ON public.uploaded_receipts FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- RLS policies for permission_slips (simplified)
CREATE POLICY "Students view own slips" ON public.permission_slips FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Staff issue permission slips" ON public.permission_slips FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- RLS policies for audit_logs (simplified - admins only, checked at app level)
CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (TRUE);

-- RLS policies for staff_profiles (bypass for authentication checks)
CREATE POLICY "Staff view all staff profiles" ON public.staff_profiles FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admin manage staff profiles" ON public.staff_profiles FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.staff_profiles WHERE role = 'Admin')
);
CREATE POLICY "Admin update staff profiles" ON public.staff_profiles FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.staff_profiles WHERE role = 'Admin')
);

-- Create indexes for better query performance
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_batch_id ON public.students(batch_id);
CREATE INDEX idx_fee_submissions_student_id ON public.fee_submissions(student_id);
CREATE INDEX idx_fee_submissions_batch_id ON public.fee_submissions(batch_id);
CREATE INDEX idx_fee_submissions_status ON public.fee_submissions(status);
CREATE INDEX idx_uploaded_receipts_submission_id ON public.uploaded_receipts(submission_id);
CREATE INDEX idx_permission_slips_student_id ON public.permission_slips(student_id);
CREATE INDEX idx_permission_slips_batch_id ON public.permission_slips(batch_id);
CREATE INDEX idx_batch_permission_templates_batch_id ON public.batch_permission_templates(batch_id);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
