import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  sort_order: number;
}

export const usePortfolioItems = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to query the portfolio_items table directly
        const { data, error } = await supabase
          .from('portfolio_items' as any)
          .select('id, title, description, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          throw error;
        }

        setItems((data as unknown as PortfolioItem[]) || []);
      } catch (err) {
        console.error('Error fetching portfolio items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio items');
        
        // Fallback to mock data if database is not available
        setItems([
          {
            id: '1',
            title: 'New Product Implementation (NPI) projects for multiple Tier 1 automotive suppliers',
            description: 'Comprehensive NPI project management and execution for leading automotive suppliers',
            sort_order: 1
          },
          {
            id: '2',
            title: 'Comprehensive APQP project support across various production and development phases',
            description: 'Advanced Product Quality Planning support throughout all project phases',
            sort_order: 2
          },
          {
            id: '3',
            title: 'Successful management of customer and supplier escalation projects, ensuring rapid resolution and sustainable corrective actions',
            description: 'Expert escalation management with focus on rapid resolution and long-term sustainability',
            sort_order: 3
          },
          {
            id: '4',
            title: 'Development and implementation of IATF 16949-compliant quality management systems',
            description: 'Full development and implementation of automotive quality management systems',
            sort_order: 4
          },
          {
            id: '5',
            title: 'Complete production relocation projects, including the transfer of manufacturing operations from Germany to Hungary',
            description: 'End-to-end production relocation project management and execution',
            sort_order: 5
          },
          {
            id: '6',
            title: 'Full-scope greenfield plant construction projects, covering design partner selection, design approval, permitting, and execution management',
            description: 'Complete greenfield plant construction project management from concept to completion',
            sort_order: 6
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, loading, error };
};
