import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiResultsSlice = createApi({
    reducerPath: 'apiResult',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://www.reddit.com',
        headers: {
            //'User-Agent': 'MyApp/1.0.0'
        }
    }),
    tagTypes: ['Subreddit','Comments'],
    endpoints: (builder) => ({
        fetchSubreddit: builder.query({
            query: (selectedResult) => `/r/${selectedResult}/about.json`,
            transformResponse: (response) => {
                if (!response?.data) {
                    throw new Error('Invalid response format from Reddit');
                }
                return response.data;
            },
            transformErrorResponse: (response) => {
                if (response.status === 429) {
                    return { message: 'Too many requests. Please try again later.' };
                }
                if (response.status === 404) {
                    return { message: 'No results found' };
                }
                if (response.status >= 500) {
                    return { message: 'Reddit service is currently unavailable' };
                }
                return { message: 'An error occurred while searching' };
            },
            providesTags: ['Subreddit'],
            invalidatesTags: ['Subreddit']
        }),
        fetchComments: builder.query({
            query: (subreddit) => `/r/${subreddit}/hot.json?limit=20`,
            transformResponse: (response) => {
                if (!response?.data?.children) {
                    throw new Error('Invalid response format from Reddit');
                }
                return response.data.children.map(child => child.data);
            },
            transformErrorResponse: (response) => {
                if (response.status === 429) {
                    return { message: 'Too many requests. Please try again later.' };
                }
                if (response.status === 404) {
                    return { message: 'No results found' };
                }
                if (response.status >= 500) {
                    return { message: 'Reddit service is currently unavailable' };
                }
                return { message: 'An error occurred while searching' };
            },
            providesTags: ['Comments'],
            invalidatesTags: ['Comments']
        })
    })
});

export const { useFetchSubredditQuery, useFetchCommentsQuery } = apiResultsSlice;
export default apiResultsSlice;