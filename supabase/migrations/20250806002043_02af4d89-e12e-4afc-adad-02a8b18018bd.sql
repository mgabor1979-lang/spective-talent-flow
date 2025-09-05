-- Create contact_requests table
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  professional_id UUID,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT DEFAULT '',
  company_address TEXT DEFAULT '',
  company_email TEXT DEFAULT '',
  company_phone TEXT DEFAULT '',
  smtp_host TEXT DEFAULT '',
  smtp_port TEXT DEFAULT '587',
  smtp_username TEXT DEFAULT '',
  smtp_password TEXT DEFAULT '',
  email_from_address TEXT DEFAULT '',
  email_success_register TEXT DEFAULT 'Welcome! Your registration was successful.',
  email_awaiting_approval TEXT DEFAULT 'Thank you for registering. Your application is under review.',
  email_denied_register TEXT DEFAULT 'We regret to inform you that your registration was not approved.',
  email_profile_approved TEXT DEFAULT 'Congratulations! Your professional profile has been approved.',
  email_profile_banned TEXT DEFAULT 'Your profile has been suspended. Please contact support.',
  email_user_deletion TEXT DEFAULT 'Your account has been deleted as requested.',
  homepage_hero_title TEXT DEFAULT 'Professional Services Platform',
  homepage_hero_subtitle TEXT DEFAULT 'Connect with skilled professionals for your next project',
  homepage_services TEXT DEFAULT '',
  homepage_about TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_requests
CREATE POLICY "Anyone can insert contact requests"
ON public.contact_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for site_settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for contact_requests updated_at
CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for site_settings updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings DEFAULT VALUES;