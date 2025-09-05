import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomepageService {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export const useHomepageServices = () => {
  const [services, setServices] = useState<HomepageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to use the public function
        let { data, error: funcError } = await supabase
          .rpc('get_homepage_services');

        if (funcError) {
          // If function doesn't exist, fall back to direct table query
          const { data: directData, error: directError } = await supabase
            .from('homepage_services')
            .select('id, icon, title, description, sort_order')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

          if (directError) {
            throw directError;
          }
          data = directData;
        }

        setServices(data || []);
      } catch (err) {
        console.error('Error fetching homepage services:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
        
        // Fallback to mock data if database is not available
        setServices([
          {
            id: '1',
            icon: 'Target',
            title: 'New Product Implementation Projects',
            description: 'Comprehensive project management support for NPI initiatives, ensuring seamless integration of new products into existing production environments from concept to full-scale production launch.',
            sort_order: 1
          },
          {
            id: '2',
            icon: 'Award',
            title: 'APQP Project Support',
            description: 'Expert guidance throughout the Advanced Product Quality Planning process to ensure product and process development meet stringent automotive OEM and Tier 1 supplier expectations.',
            sort_order: 2
          },
          {
            id: '3',
            icon: 'Users',
            title: 'Production Relocation and Restructuring',
            description: 'End-to-end management of production relocation and restructuring projects to optimize manufacturing footprint, reduce costs, and improve operational flexibility with minimal disruption.',
            sort_order: 3
          },
          {
            id: '4',
            icon: 'Briefcase',
            title: 'Greenfield Plant Construction Projects',
            description: 'Complete project management services for Greenfield plant construction from concept and design through execution and commissioning, ensuring compliance with budget, timeline, and quality expectations.',
            sort_order: 4
          },
          {
            id: '5',
            icon: 'Globe',
            title: 'Customer Escalation Project Management',
            description: 'Specialized management of customer escalation projects triggered by quality, delivery, or performance issues, focusing on root cause analysis and sustainable corrective measures.',
            sort_order: 5
          },
          {
            id: '6',
            icon: 'Lightbulb',
            title: 'Supplier Development',
            description: 'Tailored supplier development programs aimed at improving supplier performance in quality, delivery, and cost competitiveness through capability assessments and improvement action plans.',
            sort_order: 6
          },
          {
            id: '7',
            icon: 'TrendingUp',
            title: 'Operational Excellence',
            description: 'Consulting services focused on achieving Operational Excellence through Lean, Six Sigma, and proven methodologies targeting process optimization, waste elimination, and productivity improvement.',
            sort_order: 7
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};
