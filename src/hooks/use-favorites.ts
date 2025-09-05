import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useFavorites = (currentUserId?: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites when component mounts or user changes
  useEffect(() => {
    if (currentUserId) {
      loadFavorites();
    }
  }, [currentUserId]);

  const loadFavorites = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      // Use type assertion since the table exists but TypeScript types haven't been regenerated
      const { data, error } = await (supabase as any)
        .from('professional_favorites')
        .select('professional_user_id')
        .eq('company_user_id', currentUserId);

      if (error) throw error;

      const favoriteIds = data?.map((fav: any) => fav.professional_user_id) || [];
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (professionalUserId: string) => {
    if (!currentUserId) return;

    try {
      // Use type assertion since the table exists but TypeScript types haven't been regenerated
      const { error } = await (supabase as any)
        .from('professional_favorites')
        .insert({
          company_user_id: currentUserId,
          professional_user_id: professionalUserId
        });

      if (error) throw error;

      setFavorites(prev => [...prev, professionalUserId]);
      toast({
        title: "Added to favorites",
        description: "Professional added to your favorites list",
      });
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (professionalUserId: string) => {
    if (!currentUserId) return;

    try {
      // Use type assertion since the table exists but TypeScript types haven't been regenerated
      const { error } = await (supabase as any)
        .from('professional_favorites')
        .delete()
        .eq('company_user_id', currentUserId)
        .eq('professional_user_id', professionalUserId);

      if (error) throw error;

      setFavorites(prev => prev.filter(id => id !== professionalUserId));
      toast({
        title: "Removed from favorites",
        description: "Professional removed from your favorites list",
      });
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (professionalUserId: string) => {
    if (isFavorite(professionalUserId)) {
      await removeFromFavorites(professionalUserId);
    } else {
      await addToFavorites(professionalUserId);
    }
  };

  const isFavorite = (professionalUserId: string) => {
    return favorites.includes(professionalUserId);
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadFavorites
  };
};
