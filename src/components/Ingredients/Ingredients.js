import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal'
import Search from './Search';
import useHttp from '../../hooks/http'


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



const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])
  const {
    isLoading, 
    error, 
    data, 
    sendRequest, 
    requestExtra, 
    requestIndentifier, 
    clear 
  } = useHttp()


  useEffect(() => {
    if (!isLoading && requestIndentifier === 'REMOVE_INGREDIENT') {
      dispatch({type:'DELETE', id: requestExtra})
    } else if (!isLoading && !error && requestIndentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: 'ADD',
        ingredient: {id: data.name, ...requestExtra}
      })
    }
  },[data, requestExtra, requestIndentifier, isLoading, error])


  const filteredIngredientsHander = useCallback((filteredIngredients) => {
    dispatch({type: 'SET', ingredients: filteredIngredients})
  }, [])

  const addIngredientHandler = useCallback((ingredient) => {
    sendRequest('https://react-hooks-backend-871f2.firebaseio.com/ingredients.json',
      'POST',
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT'
    )
  }, [sendRequest])

  const removeIngredientHandler = useCallback((ingredientId) => {
    sendRequest(
      `https://react-hooks-backend-871f2.firebaseio.com/ingredients/${ingredientId}.json`, 
      'DELETE',
      null,
      ingredientId,
      'REMOVE_INGREDIENT'
    )
  }, [sendRequest])

  const ingredientList = useMemo(() => {
    return <IngredientList 
      ingredients={userIngredients}  
      onRemoveItem={removeIngredientHandler} 
    />
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHander} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
