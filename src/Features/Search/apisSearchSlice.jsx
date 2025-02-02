import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const apiSearchSlice = createApi ({
    reducerPath:'apiSearch',
    baseQuery: fetchBaseQuery({
        baseUrl:'https://www.reddit.com',
        headers: {
            //'User-Agent': 'MyApp/1.0.0'
        }}),
    tagTypes: ['SearchResults'],
    endpoints: (builder) => ({
        search: builder.query ({
            query: (submitTerm) => ({
                url: '/subreddits/search.json',
                params: {
                    q: submitTerm,
                    limit: 25,
                    sort: 'relevance'
                }
            }),
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
            providesTags: ['SearchResults'],
            invalidatesTags: ['SearchResults']
        })
    })
})

export default apiSearchSlice
export const {useSearchQuery} = apiSearchSlice