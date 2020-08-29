import React, { useState, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal'
import Search from './Search';

const Ingredients = () => {
  const [ userIngredients, setUserIngredients ] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients)
  },[userIngredients])


  const filteredIngredientsHander = useCallback((filteredIngredients) => {
    setUserIngredients(filteredIngredients)
  }, [])

  const addIngredientHandler = (ingredient) => {
    setIsLoading(true)
    fetch('https://react-hooks-backend-871f2.firebaseio.com/ingredients.json', {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json' },
      body: JSON.stringify(ingredient)
    })
      .then(response => {
        setIsLoading(false)
        return response.json()})
      .then(responseData => {
        setUserIngredients(prevIngredients =>  [
          ...prevIngredients, 
          {id: responseData.name, ...ingredient}
        ])
      })
  }

  const removeIngredientHandler = (ingredientId) => {
    setIsLoading(true)
    fetch(`https://react-hooks-backend-871f2.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE'
    })
      .then(response => {
        setIsLoading(false)
        setUserIngredients(
          prevIngredients => prevIngredients.filter(element => element.id !== ingredientId)
        )
      })
      .catch(error => {
        setError('Something went wrong')
        setIsLoading(false)
      })
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHander} />
          <IngredientList ingredients={userIngredients}  onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
