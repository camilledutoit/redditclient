import { useState,useEffect } from "react"
import { useSearchQuery } from "./apisSearchSlice"
import { useNavigate } from "react-router-dom"
import { setSearchTerm } from './searchTermSlice';
import { useDispatch } from 'react-redux';

function Search () {
    const [localSearchTerm,setLocalSearchTerm] = useState('')
    const [submitTerm, setSubmitTerm] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const {
        data,
        error,
        isError,
        isLoading,
        isFetching
    } = useSearchQuery(submitTerm, {
            skip: !submitTerm,
            retryOn: [503, 502, 500],
            maxRetries: 3
    })

    function handleChange (event) {
        setLocalSearchTerm(event.target.value)
        setErrorMessage('')
    }

    useEffect(() => {
        if (data?.length > 0 && !isError && !isLoading && !isFetching) {
            navigate('/results');
        }
    }, [data])

    function handleSubmit (event) {
        event.preventDefault()
        if (localSearchTerm.trim() === '') {
            setErrorMessage('Please enter a search term')
            return
        }
        setSubmitTerm(localSearchTerm.trim())
        dispatch(setSearchTerm(localSearchTerm.trim())) 
        setLocalSearchTerm('')
    }

    return(
        <div>
            <div>
                <img src="../public/Images/reddit_logo.svg" alt="Reddit Logo" />
                <p>What topics interest you?</p>
            </div>
            <form onSubmit={handleSubmit}>
                <input  type="text"
                        id="searchBar"
                        name="searchBar"
                        value={localSearchTerm}
                        onChange={handleChange}
                        placeholder="type here"
                        disabled={isLoading || isFetching}
                />
                <img    src="../public/Images/search_icon.svg"
                        alt="Search Icon"
                        onClick={handleSubmit}
                />
            </form>
            {(isLoading || isFetching) && <div> <p>Loading...</p> <img src="../public/Images/loading_icon.svg" alt="Loading Icon"/> </div>}
            {isError && (<p>{error?.message || 'Failed to fetch results'}</p>)}
            {errorMessage && (<p>{errorMessage}</p>)}
            {!isLoading && !isError && data?.length === 0 && (<p>No results found for "{submitTerm}"</p>)}
        </div>
    )
}

export default Search