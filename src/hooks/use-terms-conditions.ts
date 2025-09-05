import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTermsConditions = () => {
  const [termsUrl, setTermsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTermsUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching terms URL from site_settings...');
        const { data, error: fetchError } = await supabase
          .from('site_settings')
          .select('terms_conditions_url')
          .maybeSingle();

        console.log('Terms fetch result:', { data, fetchError });

        if (fetchError) {
          throw fetchError;
        }

        const url = (data as any)?.terms_conditions_url || null;
        console.log('Extracted terms URL:', url);
        setTermsUrl(url);
      } catch (err) {
        console.error('Error fetching terms URL:', err);
        setError('Failed to load privacy policy');
        setTermsUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsUrl();
  }, []);

  return { termsUrl, loading, error };
};
