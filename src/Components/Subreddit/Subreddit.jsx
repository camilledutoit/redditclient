import { useFetchSubredditQuery,useFetchCommentsQuery } from "../../Features/Results/apiResultsSlice"
import { useSearchQuery } from "../../Features/Search/apisSearchSlice";
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import styles from './Subreddit.module.css'
import { useState } from "react";

function Subreddit () {
    const [expandedIds, setExpandedIds] = useState(new Set())
    const userIcons = ['/src/assets/Images/reddituser1_icon.svg','/src/assets/Images/reddituser2_icon.svg','/src/assets/Images/reddituser3_icon.svg'];
    const searchTerm = useSelector(state => state.searchTerm)

    const { subreddit } = useParams()

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
          const newIds = new Set(prev);
          if (newIds.has(id)) {
            newIds.delete(id);
          } else {
            newIds.add(id);
          }
          return newIds;
        });
      };

    const {
        data: dataSubreddit,
        isLoading: isLoadingSubreddit,
        isFetching: isFetchingSubreddit,
        isError: isErrorSubreddit,
        error: errorSubreddit
    } = useFetchSubredditQuery(subreddit)

    const {
        data: dataComments,
        isLoading: isLoadingComments,
        isFetching: isFetchingComments,
        isError: isErrorComments,
        error: errorComments
    } = useFetchCommentsQuery(subreddit,{
        skip: !subreddit,
        retryOn: [503, 502, 500],
        maxRetries: 3
    })

    const {data: dataSearchQuery} = useSearchQuery (searchTerm)

  // Handle loading for subreddit query
  if (isLoadingSubreddit || isFetchingSubreddit) {
    return <div>LOADING...</div>;
  }

  // Handle error for subreddit query
  if (isErrorSubreddit) {
    return (
      <div>
        <p>Error: {errorSubreddit?.message || "Something went wrong."}</p>
        <Link to="/results">Click here to go back to results</Link>
      </div>
    );
  }

  // Handle case when subreddit data is unavailable
  if (!dataSubreddit) {
    return <div>No data available</div>;
  }

  return (
    <div data-testid="subreddit-page" className={styles.subredditPage}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.bannerContainer}></div>

        <div className={styles.subredditInfo}>
          <img
            src='/src/assets/Images/subreddit_icon.svg'
            alt="Subreddit Icon"
            className={styles.subredditIcon}
          />
          <div className={styles.subredditText}>
            <h1 className={styles.subredditName}>{dataSubreddit.display_name_prefixed}</h1>
            <p className={styles.subredditStats}>
              subscribers: {dataSubreddit.subscribers}<span className={styles.subredditUsersDate}>&nbsp;&nbsp; · &nbsp;&nbsp;active users: {dataSubreddit.accounts_active} &nbsp;&nbsp;·&nbsp;&nbsp;
              created on {new Date(dataSubreddit.created_utc * 1000).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className={styles.subredditDescription}>
          <p>{dataSubreddit.public_description}</p>
        </div>

        <div className={styles.headerDivider}></div>
      </div>

      {/* Comments Section */}
      <div className={styles.commentsSection}>
        {isLoadingComments || isFetchingComments ? (
          <div className={styles.loadingComments}>
            <p>Loading comments...</p>
          </div>
        ) : null}

        {isErrorComments ? (
          <div className={styles.errorComments}>
            <p>Error: {errorComments?.message || "Failed to fetch comments."}</p>
          </div>
        ) : null}

        <div className={styles.commentsGrid}>
          {dataComments?.map((comment,index) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.userInfo}>
                <img
                  src={userIcons[index % 3]}
                  alt="Reddit User Icon"
                  className={styles.userIcon}
                />
                <p>{comment.author} · {new Date(comment.created_utc * 1000).toLocaleDateString()}</p>
              </div>

              <div className={styles.postTitle}>
                <p>{comment.title}</p>
              </div>

              <div className={styles.postFlair}>
                <p>{comment.link_flair_text !== null ? comment.link_flair_text : 'Convo'}</p>
              </div>

              <div className={styles.postImage}>
                {comment.thumbnail && !comment.is_video && !['self', 'default', 'nsfw', 'spoiler'].includes(comment.thumbnail) && (
                    <img src={comment.thumbnail} alt={comment.title || "Post Image"} />
                )}
                {comment.is_video? (<video width="100%" controls>
                    <source src={comment.media.reddit_video.fallback_url} type="video/mp4" />
                </video>) : ''}
                <div className={styles.descriptionsAndLinks}>               
                  <p className={`${styles.text} ${expandedIds.has(comment.id) ? styles.expanded : ''}`}>
                      {comment.selftext}<a href={comment.url_overridden_by_dest}>{comment.url_overridden_by_dest}</a>
                  </p>
                </div> 
                <button 
                    onClick={() => toggleExpand(comment.id)}
                    className={styles.expandButton}
                >
                {expandedIds.has(comment.id) ? 'Show less' : 'Show more'}
                </button>
              </div>

              <div className={styles.postStats}>
                <p>Score: {comment.score}</p>
                <p>{comment.num_comments} comments</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Subreddit;