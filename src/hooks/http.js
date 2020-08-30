import { useReducer, useCallback } from 'react'

const initialState = {
    loading: false, 
    error: null,
    data: null,
    extra: null,
    identifier: null
}

const httpReducer = (currentHttpState, action) => {
    switch(action.type) {
      case 'SEND':
        return {loading: true, error: null, data: null, extra: null, identifier: action.identifier }
      case 'RESPONSE':
        return {...currentHttpState, loading: false, data: action.responseData, extra: action.extra}
      case 'ERROR':
        return {loading: false, error: action.errorMessage}
      case 'CLEAR_ERROR':
        return initialState
      default:
        throw new Error('Should not get here!')
    }
  }


const useHttp = () => {
    const [httpState, dispacthHttp] = useReducer(httpReducer, initialState)

    const clear = useCallback(() => dispacthHttp({type: 'CLEAR'}), [])


    const sendRequest = useCallback((url, method, body, requestExtra, requestIndentifier) => {
        dispacthHttp({type: 'SEND', indentifier: requestIndentifier})
        fetch(url, {method: method, body: body, headers: {'Content-Type': 'application/json'}})
            .then(response => {
                return response.json()
            })
            .then(responseData => {
                dispacthHttp({
                    type: 'RESPONSE', 
                    responseData: responseData, 
                    extra: requestExtra
                })
            })
            .catch(error => {
              dispacthHttp({type: 'ERROR', errorMessage: error})
            })
    }, [])

    return {
        isLoading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        requestExtra: httpState.extra,
        requestIndentifier: httpState.requestIndentifier,
        clear: clear
    }
}

export default useHttp