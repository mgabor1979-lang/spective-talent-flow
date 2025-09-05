-- Add missing fields to contact_requests table
ALTER TABLE public.contact_requests 
ADD COLUMN subject text,
ADD COLUMN duration text,
ADD COLUMN location text;