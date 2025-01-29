import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiResultsSlice = createApi({
    reducerPath: 'apiResult',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://www.reddit.com',
        headers: {
            'User-Agent': 'MyApp/1.0.0'
        }
    }),
    tagTypes: ['Subreddit'],
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
        })
    })
});

export const { useFetchSubredditQuery } = apiResultsSlice;
export default apiResultsSlice;