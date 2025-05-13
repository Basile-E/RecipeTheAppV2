import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe, Ingredient } from '../types';
import RecipeForm from '../components/RecipeForm';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
  }, []);

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients:recipe_ingredients(
          *,
          ingredient:ingredients(*)
        ),
        steps:recipe_steps(*)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching recipes:', error);
    else setRecipes(data || []);
  }

  async function fetchIngredients() {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name');

    if (error) console.error('Error fetching ingredients:', error);
    else setIngredients(data || []);
  }

  async function handleSubmit(data: any) {
    const recipe = {
      name: data.name,
      servings: parseInt(data.servings),
    };

    let recipeId;
    if (selectedRecipe) {
      const { data: updatedRecipe, error } = await supabase
        .from('recipes')
        .update(recipe)
        .eq('id', selectedRecipe.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating recipe:', error);
        return;
      }
      recipeId = selectedRecipe.id;

      // Delete existing ingredients and steps
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
      await supabase.from('recipe_steps').delete().eq('recipe_id', recipeId);
    } else {
      const { data: newRecipe, error } = await supabase
        .from('recipes')
        .insert(recipe)
        .select()
        .single();

      if (error) {
        console.error('Error creating recipe:', error);
        return;
      }
      recipeId = newRecipe.id;
    }

    // Add ingredients
    const ingredients = data.ingredients
      .filter((i: any) => i && i.ingredient_id && i.quantity)
      .map((i: any) => ({
        recipe_id: recipeId,
        ingredient_id: i.ingredient_id,
        quantity: parseFloat(i.quantity),
      }));

    if (ingredients.length > 0) {
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients);

      if (ingredientsError) console.error('Error adding ingredients:', ingredientsError);
    }

    // Add steps
    const steps = data.steps
      .filter((s: any) => s && s.description)
      .map((s: any) => ({
        recipe_id: recipeId,
        step_number: parseInt(s.step_number),
        description: s.description,
      }));

    if (steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(steps);

      if (stepsError) console.error('Error adding steps:', stepsError);
    }

    setIsFormOpen(false);
    setSelectedRecipe(null);
    fetchRecipes();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <button
          onClick={() => {
            setSelectedRecipe(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Recipe
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {selectedRecipe ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <RecipeForm
            recipe={selectedRecipe || undefined}
            ingredients={ingredients}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-semibold mb-4">{recipe.name}</h3>
            <p className="text-gray-600 mb-4">Servings: {recipe.servings}</p>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Ingredients:</h4>
              <ul className="list-disc list-inside space-y-1">
                {recipe.ingredients?.map((ri) => (
                  <li key={ri.id}>
                    {ri.quantity} {ri.ingredient?.unit?.name} {ri.ingredient?.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Steps:</h4>
              <ol className="list-decimal list-inside space-y-2">
                {recipe.steps?.sort((a, b) => a.step_number - b.step_number)
                  .map((step) => (
                    <li key={step.id}>{step.description}</li>
                  ))}
              </ol>
            </div>

            <button
              onClick={() => {
                setSelectedRecipe(recipe);
                setIsFormOpen(true);
              }}
              className="mt-6 text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}