-- Update get_professionals_for_public to include profile image
DROP FUNCTION IF EXISTS public.get_professionals_for_public();

CREATE OR REPLACE FUNCTION public.get_professionals_for_public()
 RETURNS TABLE(
   id uuid, 
   user_id uuid, 
   masked_full_name text, 
   first_name text, 
   birth_date date, 
   age integer, 
   work_experience text, 
   skills text[], 
   languages text[], 
   technologies text[],
   education text,
   city text,
   range integer,
   available boolean,
   availablefrom timestamp with time zone,
   profile_image_src text
 )
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    pp.id,
    pp.user_id,
    CASE 
        WHEN auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN 
            -- Non-admin: masked name (first initial + last name)
            LEFT(SPLIT_PART(p.full_name, ' ', 1), 1) || '. ' || SPLIT_PART(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1))
        ELSE
            -- Admin: full name
            p.full_name
    END AS masked_full_name,
    -- Always return first name for internal use
    SPLIT_PART(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1)) as first_name,
    CASE 
      WHEN auth.uid() IS NULL THEN NULL  -- Hide birth date from guests
      ELSE
        CASE 
          WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
            p.birth_date
          ELSE
          NULL
        END
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
    pp.technologies,
    pp.education,
    pp.city,
    pp.range,
    pp.available,
    pp."availablefrom",
    -- Include profile image (public for everyone)
    pi.src as profile_image_src
  FROM public.professional_profiles pp
  JOIN public.profiles p ON pp.user_id = p.user_id
  LEFT JOIN public.profileimages pi ON pi.uid = pp.user_id
  WHERE pp.profile_status = 'approved' 
    AND pp.is_searchable = true;
$function$;
