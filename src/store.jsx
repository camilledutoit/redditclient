import { configureStore } from "@reduxjs/toolkit";
import apiSearchSlice from "./Features/Search/apisSearchSlice";
import searchTermReducer from './Features/Search/searchTermSlice'
import apiResultsSlice from "./Features/Results/apiResultsSlice";

export const store = configureStore ({
    reducer: {
        [apiSearchSlice.reducerPath]: apiSearchSlice.reducer,
        [apiResultsSlice.reducerPath]:apiResultsSlice.reducer,
        searchTerm: searchTermReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSearchSlice.middleware).concat(apiResultsSlice.middleware)
})