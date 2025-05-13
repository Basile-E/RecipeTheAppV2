import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Recipe, Ingredient } from '../types';
import { supabase } from '../lib/supabase';

interface RecipeFormProps {
  recipe?: Recipe;
  ingredients: Ingredient[];
  onSubmit: (data: any) => void;
}

export default function RecipeForm({ recipe, ingredients, onSubmit }: RecipeFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: recipe || { servings: 1, ingredients: [], steps: [] }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(recipe?.ingredients?.map(ri => ri.ingredient!) || []);

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients([...selectedIngredients, ingredient]);
    setSearchTerm('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Recipe Name</label>
        <input
          type="text"
          {...register('name', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && <span className="text-red-500">This field is required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Servings</label>
        <input
          type="number"
          min="1"
          {...register('servings', { required: true, min: 1 })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Add Ingredients</label>
        <div className="mt-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search ingredients..."
          />
          {searchTerm && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredIngredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                  onClick={() => addIngredient(ingredient)}
                >
                  {ingredient.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Selected Ingredients</h3>
        <div className="mt-2 space-y-4">
          {selectedIngredients.map((ingredient, index) => (
            <div key={ingredient.id} className="flex items-center gap-4">
              <span>{ingredient.name}</span>
              <input
                type="number"
                step="0.01"
                {...register(`ingredients.${index}.quantity`, { required: true, min: 0 })}
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Quantity"
              />
              <input
                type="hidden"
                {...register(`ingredients.${index}.ingredient_id`)}
                value={ingredient.id}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Steps</h3>
        <div className="mt-2 space-y-4">
          {[...Array(10)].map((_, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700">Step {index + 1}</label>
              <textarea
                {...register(`steps.${index}.description`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={2}
              />
              <input
                type="hidden"
                {...register(`steps.${index}.step_number`)}
                value={index + 1}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Save Recipe
      </button>
    </form>
  );
}