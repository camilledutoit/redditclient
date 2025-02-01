import { useState,useEffect } from "react"
import { useSearchQuery } from "./apisSearchSlice"
import { useNavigate } from "react-router-dom"
import { setSearchTerm } from './searchTermSlice';
import { useDispatch } from 'react-redux';
import styles from './Search.module.css'
import searchIcon from '../../assets/Images/search_icon.svg'
import redditLogo from '../../assets/Images/reddit_logo.svg'

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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img
                    src={redditLogo}
                    alt="Reddit Logo"
                    className={styles.logo}
                />
                <p className={styles.title}>What's on your mind?</p>
                <p className={styles.titleMobile}>What's up?</p>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        id="searchBar"
                        name="searchBar"
                        value={localSearchTerm}
                        onChange={handleChange}
                        placeholder="Type here..."
                        className={styles.input}
                        disabled={isLoading || isFetching}
                    />
                    <img
                        src={searchIcon}
                        alt="Search Icon"
                        onClick={handleSubmit}
                        className={styles.searchIcon}
                    />
                </div>
            </form>
            <div className={styles.messages}>
                {(isLoading || isFetching) && (
                    <div className={styles.loadingMessage}>
                        <p>Loading...</p>
                        <img
                            src={searchIcon}
                            alt="Loading Icon"
                            className={styles.loadingIcon}
                        />
                    </div>
                )}
                {isError && (
                    <p className={styles.errorMessage}>
                        {error?.message || 'Failed to fetch results'}
                    </p>
                )}
                {errorMessage && (
                    <p className={styles.errorMessage}>{errorMessage}</p>
                )}
                {!isLoading && !isError && data?.length === 0 && (
                    <p className={styles.errorMessage}>
                        No results found for "{submitTerm}"
                    </p>
                )}
            </div>
        </div>
    )
}

export default Search