import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Ingredient, Unit, Store } from '../types';
import IngredientForm from '../components/IngredientForm';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchIngredients();
    fetchUnits();
    fetchStores();
  }, []);

  async function fetchIngredients() {
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        *,
        unit:units(*),
        prices:ingredient_prices(*)
      `);
    if (error) console.error('Error fetching ingredients:', error);
    else setIngredients(data || []);
  }

  async function fetchUnits() {
    const { data, error } = await supabase.from('units').select('*');
    if (error) console.error('Error fetching units:', error);
    else setUnits(data || []);
  }

  async function fetchStores() {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) console.error('Error fetching stores:', error);
    else setStores(data || []);
  }

  async function handleSubmit(data: any) {
    const ingredient = {
      name: data.name,
      image_url: data.image_url,
      unit_id: data.unit_id,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
    };

    let ingredientId;
    if (selectedIngredient) {
      const { data: updatedIngredient, error } = await supabase
        .from('ingredients')
        .update(ingredient)
        .eq('id', selectedIngredient.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ingredient:', error);
        return;
      }
      ingredientId = selectedIngredient.id;
    } else {
      const { data: newIngredient, error } = await supabase
        .from('ingredients')
        .insert(ingredient)
        .select()
        .single();

      if (error) {
        console.error('Error creating ingredient:', error);
        return;
      }
      ingredientId = newIngredient.id;
    }

    // Handle store prices
    for (const store of stores) {
      const price = data.prices[store.id];
      if (price) {
        const priceData = {
          ingredient_id: ingredientId,
          store_id: store.id,
          price: parseFloat(price),
        };

        const { error } = await supabase
          .from('ingredient_prices')
          .upsert(priceData, {
            onConflict: 'ingredient_id,store_id',
          });

        if (error) console.error('Error updating price:', error);
      }
    }

    setIsFormOpen(false);
    setSelectedIngredient(null);
    fetchIngredients();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ingredients</h1>
        <button
          onClick={() => {
            setSelectedIngredient(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Ingredient
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {selectedIngredient ? 'Edit Ingredient' : 'New Ingredient'}
          </h2>
          <IngredientForm
            ingredient={selectedIngredient || undefined}
            units={units}
            stores={stores}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            {ingredient.image_url && (
              <img
                src={ingredient.image_url}
                alt={ingredient.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-lg font-semibold mb-2">{ingredient.name}</h3>
            <p className="text-gray-600 mb-2">
              Unit: {ingredient.unit?.name || 'Not specified'}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <p>Calories: {ingredient.calories || '-'}</p>
              <p>Protein: {ingredient.protein || '-'}g</p>
              <p>Carbs: {ingredient.carbs || '-'}g</p>
              <p>Fat: {ingredient.fat || '-'}g</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Prices:</h4>
              {ingredient.prices?.map((price) => (
                <p key={price.id}>
                  {stores.find(s => s.id === price.store_id)?.name}: €{price.price}
                </p>
              ))}
            </div>
            <button
              onClick={() => {
                setSelectedIngredient(ingredient);
                setIsFormOpen(true);
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}