-- Create portfolio_items table for managing homepage portfolio section
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_items
CREATE POLICY "Allow public read for active portfolio items"
ON public.portfolio_items
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Allow admins full access to portfolio items"
ON public.portfolio_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create function to get active portfolio items
CREATE OR REPLACE FUNCTION public.get_portfolio_items()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  sort_order INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.title,
    pi.description,
    pi.sort_order
  FROM public.portfolio_items pi
  WHERE pi.is_active = true
  ORDER BY pi.sort_order ASC;
END;
$$;

-- Insert default portfolio items
INSERT INTO public.portfolio_items (title, description, sort_order, is_active) VALUES
('New Product Implementation (NPI) projects for multiple Tier 1 automotive suppliers', 'Comprehensive NPI project management and execution for leading automotive suppliers', 1, true),
('Comprehensive APQP project support across various production and development phases', 'Advanced Product Quality Planning support throughout all project phases', 2, true),
('Successful management of customer and supplier escalation projects, ensuring rapid resolution and sustainable corrective actions', 'Expert escalation management with focus on rapid resolution and long-term sustainability', 3, true),
('Development and implementation of IATF 16949-compliant quality management systems', 'Full development and implementation of automotive quality management systems', 4, true),
('Complete production relocation projects, including the transfer of manufacturing operations from Germany to Hungary', 'End-to-end production relocation project management and execution', 5, true),
('Full-scope greenfield plant construction projects, covering design partner selection, design approval, permitting, and execution management', 'Complete greenfield plant construction project management from concept to completion', 6, true);
