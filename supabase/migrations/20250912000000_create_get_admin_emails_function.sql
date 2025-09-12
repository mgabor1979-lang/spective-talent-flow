-- Create function to get admin emails (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS TABLE(email TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT p.email
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.user_id = ur.user_id
  WHERE ur.role = 'admin'::app_role;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_emails() TO authenticated;