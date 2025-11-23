import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }

  return data || [];
}

export async function getRecipeById(id) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }

  return data;
}

export async function createRecipe(recipe) {
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select()
    .single();

  if (error) {
    console.error('Error creating recipe:', error);
    return null;
  }

  return data;
}

export async function updateRecipe(id, recipe) {
  const { data, error } = await supabase
    .from('recipes')
    .update({ ...recipe, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recipe:', error);
    return null;
  }

  return data;
}

export async function deleteRecipe(id) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting recipe:', error);
    return false;
  }

  return true;
}

export async function toggleFavorite(id, favorite) {
  const { data, error } = await supabase
    .from('recipes')
    .update({ favorite, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling favorite:', error);
    return null;
  }

  return data;
}

export async function getAllMealPlans() {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching meal plans:', error);
    return [];
  }

  return data || [];
}

export async function setMealPlan(day, meal, recipeId) {
  const { data: existing } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('day', day)
    .eq('meal', meal)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('meal_plans')
      .update({ recipe_id: recipeId })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal plan:', error);
      return null;
    }

    return data;
  } else {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([{ day, meal, recipe_id: recipeId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating meal plan:', error);
      return null;
    }

    return data;
  }
}

export async function removeMealPlan(day, meal) {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('day', day)
    .eq('meal', meal);

  if (error) {
    console.error('Error removing meal plan:', error);
    return false;
  }

  return true;
}

export async function clearAllMealPlans() {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error clearing meal plans:', error);
    return false;
  }

  return true;
}

export async function bulkSetMealPlans(plans) {
  await clearAllMealPlans();

  const { error } = await supabase
    .from('meal_plans')
    .insert(plans.map(p => ({ day: p.day, meal: p.meal, recipe_id: p.recipeId })));

  if (error) {
    console.error('Error bulk setting meal plans:', error);
    return false;
  }

  return true;
}
