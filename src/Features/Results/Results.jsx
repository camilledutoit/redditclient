import { useSearchQuery } from "../Search/apisSearchSlice"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from 'react-redux'
import { useFetchSubredditQuery } from "./apiResultsSlice"

function Results () {
    const [filterTerm,setFilterTerm]=useState('')
    const [sortedItems, setSortedItems] = useState([])
    const [selectedResult, setSelectedResult] = useState(null)

    const searchTerm = useSelector(state => state.searchTerm)
    const { data } = useSearchQuery(searchTerm)
    const {} = useFetchSubredditQuery (selectedResult, {
        skip: !selectedResult,
        retryOn: [503, 502, 500],
        maxRetries: 3
    })

    function handleChange (event) {
        setFilterTerm(event.target.value)
    }

    function getFilteredData () {
        if (!data) return [];
        
        const trimmedFilterTerm = filterTerm.trim().toLowerCase();
        
        return data.filter(item => 
            (item.display_name?.toLowerCase().includes(trimmedFilterTerm) || false) ||
            (item.title?.toLowerCase().includes(trimmedFilterTerm) || false) ||
            (item.public_description?.toLowerCase().includes(trimmedFilterTerm) || false)
        );
    }

    const handleAscending = () => {
        const sorted = [...getFilteredData()].sort((a, b) => 
            a.display_name_prefixed.localeCompare(b.display_name_prefixed)
        )
        setSortedItems(sorted)
    }

    const handleDescending = () => {
        const sorted = [...getFilteredData()].sort((a, b) => 
            b.display_name_prefixed.localeCompare(a.display_name_prefixed)
        )
        setSortedItems(sorted)
    }

    const filteredItems = sortedItems.length > 0 ? sortedItems : getFilteredData()

    function handleSelection(item) {
        setSelectedResult(item.display_name)
    }

    return (
        <div data-testid="results-page">
            <div>
                <img src="../../public/Images/reddit_logo.svg" alt="Reddit Logo" />
                <h1>Search Results for "{searchTerm}":</h1>
            </div>
            <div>
                <div>
                    <label htmlFor="filterResults">Filter results</label>
                    <input  type="text"
                            id="filterResults"
                            name="filterResults"
                            value={filterTerm}
                            onChange={handleChange}
                            placeholder="type here"
                    />
                </div>
                <div>
                    <h2>Order by:</h2>
                    <div>
                        <p>ASC</p>
                        <img    src="../../public/Images/ascending_icon.svg"
                                alt="Ascending Icon"
                                onClick={handleAscending}
                        />
                    </div>
                    <div>
                        <p>DESC</p>
                        <img    src="../../public/Images/descending_icon.svg"
                                alt="Descending Icon"
                                onClick={handleDescending}
                        />
                    </div>
                </div>
            </div>
            <div>
                <ul>
                    {filteredItems.map(item=>(
                        <li key={item.id}>
                            <Link to={`/results/${item.display_name}`} onClick={() => handleSelection(item)}>
                                <div>
                                    <img src={item.icon_img || '../../public/Images/default_subreddit_icon.svg'} alt="Subreddit Icon Image" />
                                    <p>{item.display_name_prefixed} · created on {new Date(item.created_utc * 1000).toLocaleDateString()} ·
                                    {item.subscribers ? item.subscribers.toLocaleString() : "no subscriber data available"} subscribers</p>
                                </div>
                                <div>
                                    <h3>{item.title}</h3>
                                    <p>{item.public_description}</p>
                                </div>
                                <div>
                                    <img    src="../../public/Images/globe_icon.svg"
                                            alt="Public Icon"
                                    />
                                    <p>{item.subreddit_type}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Results