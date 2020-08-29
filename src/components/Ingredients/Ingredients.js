import React, { useReducer, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal'
import Search from './Search';


const ingredientReducer = (currentIngredients, action) => {
  switch(action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient]
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id)
    default:
      throw new Error('Should not get here!')
  }
}

const httpReducer = (currentHttpState, action) => {
  switch(action.type) {
    case 'SEND':
      return {loading: true, error: null}
    case 'RESPONSE':
      return {...currentHttpState, loading: false}
    case 'ERROR':
      return {loading: false, error: action.errorMessage}
    case 'CLEAR_ERROR':
      return {...currentHttpState, error: null}
    default:
      throw new Error('Should not get here!')
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])
  const [httpState, dispacthHttp] = useReducer(httpReducer, {loading: false, error: null})

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients)
  },[userIngredients])


  const filteredIngredientsHander = useCallback((filteredIngredients) => {
    dispatch({type: 'SET', ingredients: filteredIngredients})
  }, [])

  const addIngredientHandler = (ingredient) => {
    dispacthHttp({type: 'SEND'})
    fetch('https://react-hooks-backend-871f2.firebaseio.com/ingredients.json', {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json' },
      body: JSON.stringify(ingredient)
    })
      .then(response => {
        dispacthHttp({type: 'RESPONSE'})
        return response.json()})
      .then(responseData => {
        dispatch({type: 'ADD', ingredient: {id:responseData.name, ...ingredient}})
      })
  }

  const removeIngredientHandler = (ingredientId) => {
    dispacthHttp({type: 'SEND'})
    fetch(`https://react-hooks-backend-871f2.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE'
    })
      .then(response => {
        dispacthHttp({type: 'RESPONSE'})
        dispatch({type: 'DELETE', id: ingredientId})
      })
      .catch(error => {
        dispacthHttp({type: 'ERROR', errorMessage: error})
      })
  }

  const clearError = () => {
    dispacthHttp({type: 'CLEAR_ERROR'})
  }

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHander} />
          <IngredientList ingredients={userIngredients}  onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
