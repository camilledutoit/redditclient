import { useSearchQuery } from "../Search/apisSearchSlice"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from 'react-redux'
import { useFetchSubredditQuery } from "./apiResultsSlice"
import styles from './Results.module.css'


function Results () {
    const [filterTerm,setFilterTerm]=useState('')
    const [sortOrder, setSortOrder] = useState(null)
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
            item.subreddit_type !== 'private' &&
            (
                (item.display_name?.toLowerCase().includes(trimmedFilterTerm) || false) ||
                (item.title?.toLowerCase().includes(trimmedFilterTerm) || false) ||
                (item.public_description?.toLowerCase().includes(trimmedFilterTerm) || false)
            )
        );
    }

    function getSortedAndFilteredData() {
        const filtered = getFilteredData();
        
        if (!sortOrder) return filtered;
        
        return filtered.sort((a, b) => {
            const comparison = a.display_name_prefixed.localeCompare(b.display_name_prefixed);
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }

    const handleAscending = () => {
        setSortOrder('asc');
    }
    
    const handleDescending = () => {
        setSortOrder('desc');
    }

    const displayedItems = getSortedAndFilteredData()

    function handleSelection(item) {
        setSelectedResult(item.display_name)
    }

    return (
        <div data-testid="results-page" className={styles.resultsPage}>
          {/* Search results header */}
          <div className={styles.resultsHeader}>
            <img
              src='/src/assets/Images/reddit_logo.svg'
              alt="Reddit Logo"
              className={styles.logo}
            />
            <h1 className={styles.searchTitle}>
              Search Results for "{searchTerm}":
            </h1>
            <h1 className={styles.searchTitleMobile}>
              "{searchTerm}" results:
            </h1>
          </div>
          <div className={styles.searchResults}>
            <p>{displayedItems.length} results</p>
          </div>          
    
          {/* Filters and Sorting */}
          <div className={styles.resultsContainer}>
            <div className={styles.filterContainer}>
              <label htmlFor="filterResults" className={styles.filterLabel}>
                Filter results:
              </label>
              <input
                type="text"
                id="filterResults"
                name="filterResults"
                value={filterTerm}
                onChange={handleChange}
                placeholder="Type here"
                className={styles.filterInput}
              />
              <input
                type="text"
                id="filterResults"
                name="filterResults"
                value={filterTerm}
                onChange={handleChange}
                placeholder="Type here to filter results"
                className={styles.filterInputMobile}
              />
            </div>
            <div className={styles.sortContainer}>
              <h2 className={styles.sortTitle}>Order by:</h2>
              <div className={styles.sortButtons}>
                <div className={styles.sortButton} onClick={handleAscending}>
                  <img
                    src='/src/assets/Images/ascending_icon.svg'
                    alt="Ascending Icon"
                    className={styles.sortIcon}
                  />
                  <p>ASC</p>
                </div>
                <div className={styles.sortButton} onClick={handleDescending}>
                  <img
                    src='/src/assets/Images/descending_icon.svg'
                    alt="Descending Icon"
                    className={styles.sortIcon}
                  />
                  <p>DESC</p>
                </div>
              </div>
            </div>
          </div>
    
          {/* Subreddit list */}
          <div className={styles.subredditsContainer}>
            <ul className={styles.subredditList}>
              {displayedItems.map((item) => (
                <li
                  key={item.id}
                  className={styles.subredditItem}
                  onClick={() => handleSelection(item)}
                >
                  <Link
                    to={`/results/${item.display_name}`}
                    className={styles.subredditLink}
                  >
                    <div className={styles.subredditContent}>
                      {/* Left: Subreddit Icon */}
                      <div className={styles.subredditLeft}>
                        <img
                          src={
                            item.icon_img ||
                            '/src/assets/Images/subreddit_icon.svg'
                          }
                          alt="Subreddit Icon"
                          className={styles.subredditIcon}
                        />
                      </div>
                      {/* Center: Subreddit Info */}
                      <div className={styles.subredditCenter}>
                        <div className={styles.subredditHeader}>
                          <p className={styles.subredditName}>
                            {item.display_name_prefixed}
                          </p>
                          <p className={styles.subredditDetails}>
                            created on{" "}
                            {new Date(item.created_utc * 1000).toLocaleDateString()}{" "}
                            <span className={styles.details}>&nbsp;&nbsp;·&nbsp;&nbsp;{" "}
                            {item.subscribers
                              ? `${item.subscribers.toLocaleString()} subscribers`
                              : "no subscriber data available"}{" "}</span>
                          </p>
                        </div>
                        <h3 className={styles.subredditTitle}>{item.title}</h3>
                        <p className={styles.subredditDescription}>
                          {item.public_description ? item.public_description : 'no description for this r/subreddit'}
                        </p>
                      </div>
                      {/* Right: Banner Image */}
                      <div className={styles.subredditRight}>
                            <img
                                src={
                                item.banner_img || '/src/assets/Images/subreddit_banner.svg'
                                }
                                alt="Subreddit Banner"
                                className={styles.bannerImage}
                            />
                            <div className={styles.subredditInfo}>
                                <img
                                src='/src/assets/Images/globe_icon.svg'
                                alt="Globe Icon"
                                className={styles.globeIcon}
                                />
                                <p className={styles.subredditType}>{item.subreddit_type}</p>
                            </div>
                       </div>
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