import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface FavoriteProduct {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
    old_price: number | null;
    unit: string;
    category: string;
  } | null;
}

interface FavoriteRecipe {
  id: string;
  recipe_id: string;
  recipe: {
    id: string;
    name: string;
    image: string | null;
    time_minutes: number;
    calories: number | null;
    rating: number | null;
    review_count: number | null;
  } | null;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteProducts([]);
      setFavoriteRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch favorite products
      const { data: productFavorites, error: productError } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          products:product_id (
            id,
            name,
            image,
            price,
            old_price,
            unit,
            category
          )
        `)
        .eq('user_id', user.id)
        .not('product_id', 'is', null);

      if (productError) {
        console.error('Error fetching product favorites:', productError);
      }

      // Fetch favorite recipes
      const { data: recipeFavorites, error: recipeError } = await supabase
        .from('favorites')
        .select(`
          id,
          recipe_id,
          recipes:recipe_id (
            id,
            name,
            image,
            time_minutes,
            calories,
            rating,
            review_count
          )
        `)
        .eq('user_id', user.id)
        .not('recipe_id', 'is', null);

      if (recipeError) {
        console.error('Error fetching recipe favorites:', recipeError);
      }

      setFavoriteProducts(
        (productFavorites || []).map(f => ({
          id: f.id,
          product_id: f.product_id!,
          product: f.products as FavoriteProduct['product']
        }))
      );

      setFavoriteRecipes(
        (recipeFavorites || []).map(f => ({
          id: f.id,
          recipe_id: f.recipe_id!,
          recipe: f.recipes as FavoriteRecipe['recipe']
        }))
      );
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFavorites();
  }, [user?.id]);

  const addProductToFavorites = async (productId: string) => {
    if (!user) {
      toast({ title: 'Войдите в аккаунт', description: 'Для добавления в избранное необходима авторизация' });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;
      await fetchFavorites();
      toast({ title: 'Добавлено в избранное' });
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({ title: 'Ошибка', description: 'Не удалось добавить в избранное', variant: 'destructive' });
      return false;
    }
  };

  const removeProductFromFavorites = async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchFavorites();
      toast({ title: 'Удалено из избранного' });
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const addRecipeToFavorites = async (recipeId: string) => {
    if (!user) {
      toast({ title: 'Войдите в аккаунт', description: 'Для добавления в избранное необходима авторизация' });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, recipe_id: recipeId });

      if (error) throw error;
      await fetchFavorites();
      toast({ title: 'Рецепт добавлен в избранное' });
      return true;
    } catch (error) {
      console.error('Error adding recipe to favorites:', error);
      toast({ title: 'Ошибка', description: 'Не удалось добавить рецепт в избранное', variant: 'destructive' });
      return false;
    }
  };

  const removeRecipeFromFavorites = async (recipeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) throw error;
      await fetchFavorites();
      toast({ title: 'Рецепт удалён из избранного' });
      return true;
    } catch (error) {
      console.error('Error removing recipe from favorites:', error);
      return false;
    }
  };

  const isProductFavorite = (productId: string) => {
    return favoriteProducts.some(f => f.product_id === productId);
  };

  const isRecipeFavorite = (recipeId: string) => {
    return favoriteRecipes.some(f => f.recipe_id === recipeId);
  };

  return {
    favoriteProducts,
    favoriteRecipes,
    loading,
    addProductToFavorites,
    removeProductFromFavorites,
    addRecipeToFavorites,
    removeRecipeFromFavorites,
    isProductFavorite,
    isRecipeFavorite,
    refetch: fetchFavorites,
  };
}
