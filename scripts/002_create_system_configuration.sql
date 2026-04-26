-- Create system_configuration table for storing system-wide settings
CREATE TABLE IF NOT EXISTS public.system_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name VARCHAR(255) NOT NULL DEFAULT 'State University',
  system_email VARCHAR(255) NOT NULL DEFAULT 'fees@university.edu',
  late_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
  session_timeout INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT only_one_config CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid OR id IS NOT NULL)
);

-- Insert default configuration
INSERT INTO public.system_configuration (id, university_name, system_email, late_fee_percentage, session_timeout)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'State University',
  'fees@university.edu',
  5.00,
  30
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE public.system_configuration ENABLE ROW LEVEL SECURITY;

-- Create policy allowing all authenticated users to view configuration
CREATE POLICY "Allow authenticated users to view system configuration" ON public.system_configuration
  FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- Create policy allowing only admins to update configuration
CREATE POLICY "Allow admins to update system configuration" ON public.system_configuration
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE staff_profiles.id = auth.uid()
      AND staff_profiles.role = 'Admin'
    )
  );
