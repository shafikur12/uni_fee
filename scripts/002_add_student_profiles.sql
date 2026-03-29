-- Add student_profiles table for student metadata
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  batch_id UUID REFERENCES public.batches(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_profiles
CREATE POLICY "Students view own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students update own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff view all profiles" ON public.student_profiles FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.staff_profiles)
);
CREATE POLICY "System insert profiles on signup" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_student_profiles_batch_id ON public.student_profiles(batch_id);
CREATE INDEX idx_student_profiles_student_id ON public.student_profiles(student_id);
