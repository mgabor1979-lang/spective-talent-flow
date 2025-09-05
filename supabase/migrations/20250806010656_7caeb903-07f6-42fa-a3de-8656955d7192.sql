-- Update get_professionals_for_public to return calculated age
CREATE OR REPLACE FUNCTION public.get_professionals_for_public()
 RETURNS TABLE(id uuid, user_id uuid, masked_full_name text, first_name text, birth_date date, age integer, work_experience text, skills text[], languages text[], technologies text[])
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    pp.id,
    pp.user_id,
    CASE 
      WHEN auth.uid() IS NULL THEN 
        -- For guests: return only last part of name (keresztnév)
        SPLIT_PART(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1))
      ELSE 
        -- For authenticated users: return full name
        p.full_name
    END as masked_full_name,
    -- Always return first name for internal use
    SPLIT_PART(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1)) as first_name,
    CASE 
      WHEN auth.uid() IS NULL THEN NULL  -- Hide birth date from guests
      ELSE p.birth_date
    END as birth_date,
    -- Calculate age for everyone (guests and authenticated users)
    CASE 
      WHEN p.birth_date IS NOT NULL THEN 
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::integer
      ELSE NULL
    END as age,
    pp.work_experience,
    pp.skills,
    pp.languages,
    pp.technologies
  FROM public.professional_profiles pp
  JOIN public.profiles p ON pp.user_id = p.user_id
  WHERE pp.profile_status = 'approved' 
    AND pp.is_searchable = true;
$function$;

-- Update get_profile_for_public to return calculated age
CREATE OR REPLACE FUNCTION public.get_profile_for_public(_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, masked_full_name text, first_name text, surname text, masked_email text, masked_phone text, birth_date date, age integer, role text, work_experience text, skills text[], languages text[], technologies text[], masked_daily_wage text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    p.id,
    p.user_id,
    CASE 
      WHEN auth.uid() IS NULL THEN 
        -- For guests: return only last part of name (keresztnév)
        SPLIT_PART(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1))
      ELSE 
        -- For authenticated users: return full name
        p.full_name
    END as masked_full_name,
    -- First name (keresztnév) - last part
    SPLIT_PART(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1)) as first_name,
    -- Surname (vezetéknév) - first part  
    SPLIT_PART(p.full_name, ' ', 1) as surname,
    CASE 
      WHEN auth.uid() IS NULL THEN '*****' 
      WHEN auth.uid() = p.user_id THEN p.email
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN p.email
      ELSE 
        SUBSTRING(p.email FROM 1 FOR 2) || '***@' || 
        SUBSTRING(SPLIT_PART(p.email, '@', 2) FROM 1 FOR 2) || 
        '***.' || 
        SPLIT_PART(SPLIT_PART(p.email, '@', 2), '.', -1)
    END as masked_email,
    CASE 
      WHEN auth.uid() IS NULL THEN '******'
      WHEN auth.uid() = p.user_id THEN p.phone
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN p.phone
      ELSE SUBSTRING(COALESCE(p.phone, '') FROM 1 FOR 3) || REPEAT('*', GREATEST(0, LENGTH(COALESCE(p.phone, '')) - 3))
    END as masked_phone,
    CASE 
      WHEN auth.uid() IS NULL THEN NULL
      ELSE p.birth_date
    END as birth_date,
    -- Calculate age for everyone (guests and authenticated users)
    CASE 
      WHEN p.birth_date IS NOT NULL THEN 
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::integer
      ELSE NULL
    END as age,
    p.role,
    pp.work_experience,
    pp.skills,
    pp.languages,
    pp.technologies,
    CASE 
      WHEN auth.uid() IS NULL THEN '****'
      WHEN auth.uid() = p.user_id THEN '€' || COALESCE(pp.daily_wage_net::text, '0') || '/day'
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN '€' || COALESCE(pp.daily_wage_net::text, '0') || '/day'
      ELSE '****'
    END as masked_daily_wage
  FROM public.profiles p
  LEFT JOIN public.professional_profiles pp ON p.user_id = pp.user_id
  WHERE p.user_id = _user_id;
$function$;