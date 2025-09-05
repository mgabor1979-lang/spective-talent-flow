-- Fix security issue by adding search_path to the function
CREATE OR REPLACE FUNCTION public.get_professionals_for_public()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  masked_full_name text,
  first_name text,
  birth_date date,
  work_experience text,
  skills text[],
  languages text[],
  technologies text[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
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
    pp.work_experience,
    pp.skills,
    pp.languages,
    pp.technologies
  FROM public.professional_profiles pp
  JOIN public.profiles p ON pp.user_id = p.user_id
  WHERE pp.profile_status = 'approved' 
    AND pp.is_searchable = true;
$$;