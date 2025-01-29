import { useFetchSubredditQuery,useFetchCommentsQuery } from "../../Features/Results/apiResultsSlice"
import { useParams } from "react-router-dom";

function Subreddit () {
    const { subreddit } = useParams()

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

    if (isLoadingSubreddit || isFetchingSubreddit) {
        return <div>Loading...</div>;
    }

    if (isErrorSubreddit) {
        return <div>Error: {error?.message || 'Something went wrong'}</div>;
    }

    if (!dataSubreddit) {
        return <div>No data available</div>;
    }

    return (
        <div data-testid="subreddit-page">
            <div>
                <img src={dataSubreddit.icon_img} alt="" />
                <h1>{dataSubreddit.display_name_prefixed}</h1>
            </div>
            <div>
                <p>Subscribers: {dataSubreddit.subscribers} · created on {dataSubreddit.created_utc}</p>
            </div>
            <div>
                <p>{dataSubreddit.public_description}</p>
            </div>
        </div>
    )
}

export default Subreddit