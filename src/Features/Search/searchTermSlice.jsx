import { createSlice } from "@reduxjs/toolkit";

const searchTermSlice = createSlice({
    name: 'searchTerm',
    initialState: '',
    reducers: {
        setSearchTerm: (state, action) => action.payload
    }
})

export const { setSearchTerm } = searchTermSlice.actions
export default searchTermSlice.reducer