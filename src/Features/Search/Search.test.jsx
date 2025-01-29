import { render , screen } from "@testing-library/react";
import Search from "./Search";
import Results from "../Results/Results";
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { store } from "../../store";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import apiSearchSlice from "./apisSearchSlice";

global.fetch = jest.fn()

let mockApiState = {
    data: null,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false
}
const mockUseSearchQuery = jest.fn()

jest.mock('./apisSearchSlice', () => ({
    useSearchQuery: jest.fn((term, options) => {
        if (!options?.skip) {
            mockUseSearchQuery(term);
        }
        return mockApiState;
    }),
    reducerPath: 'apiSearch',
    reducer: () => ({}),
    middleware: () => (next) => (action) => next(action),
}));

let user

beforeEach(() => {
    render(
        <Provider store={store}>
            <MemoryRouter>
                <Routes>
                    <Route path="/" element={<Search />} />
                    <Route path="/results" element={<Results />} />
                </Routes>
            </MemoryRouter>
        </Provider>
    )

    user = userEvent.setup();

})


describe('verify that all elements are displayed',()=>{
    it('checks that the welcome message icon is displayed',()=>{
        const welcomeMessage = screen.getByText('What\'s on your mind?')
        expect(welcomeMessage).toBeInTheDocument()
    }),
    it('checks that the Reddit icon is displayed',()=>{
        const redditIcon = screen.getByAltText('Reddit Logo')
        expect(redditIcon).toBeInTheDocument()
    }),
    it('checks that the search icon is displayed',()=>{
        const searchIcon = screen.getByAltText('Search Icon')
        expect(searchIcon).toBeInTheDocument()
    }),
    it('checks that the input is displayed',()=>{
        const textbox = screen.getByRole('textbox')
        expect(textbox).toBeInTheDocument()
    }),
    it('checks that the input placeholder is correct', () => {
        const placeholder = screen.getByPlaceholderText('Type here...');
        expect(placeholder).toBeInTheDocument();
    })
})

describe('verify that input filling and submission behave properly',()=>{
    it('tests that the searchTerm is set when the user types into input', async () => {
        //ARRANGE
        const textbox = screen.getByRole('textbox')  
        const expectedValue= 'javaScript'      
        //ACT
        await user.type(textbox,'javaScript')
        //ASSERT
        expect(textbox).toHaveValue(expectedValue)
    }),
    it('tests that the submitTerm is set and useSearchQuery called when the user submits the form (click) and that the input field is cleaned',async ()=>{
        //ARRANGE
        const searchIcon = screen.getByAltText('Search Icon')
        const textbox = screen.getByRole('textbox')
        const expectedValue= 'javaScript'
        //ACT
        await user.type(textbox,'javaScript')
        await user.click(searchIcon)
        //ASSERT
        expect(mockUseSearchQuery).toHaveBeenCalledWith(expectedValue)
        expect(textbox).toHaveValue('')
    }),
    it('tests that the submitTerm is set and useSearchQuery called when the user submits the form (enter) and that the input field is cleaned',async ()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        const expectedValue= 'javaScript'
        //ACT
        await user.type(textbox,'javaScript{enter}')
        //ASSERT
        expect(mockUseSearchQuery).toHaveBeenCalledWith(expectedValue)
        expect(textbox).toHaveValue('')
    }),
    it('tests that useSearchQuery is not triggered if the input field is empty (click)',async ()=>{
        //ARRANGE
        const searchIcon = screen.getByAltText('Search Icon')
        const textbox = screen.getByRole('textbox')
        //ACT
        expect(textbox).toHaveValue('')
        await user.click(searchIcon)
        //ASSERT
        expect(mockUseSearchQuery).not.toHaveBeenCalled()
    }),
    it('tests that useSearchQuery is not triggered if the input field is empty (enter)',async ()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        //ACT
        await user.type(textbox,'{enter}')
        //ASSERT
        expect(mockUseSearchQuery).not.toHaveBeenCalled()
    }),
    it('handles whitespace-only input as empty', async () => {
        //ARRANGE
        const textbox = screen.getByRole('textbox');
        //ACT
        await user.type(textbox, '   {enter}');
        //ASSERT
        expect(mockUseSearchQuery).not.toHaveBeenCalled();
    }),
    it('tests that an error message appears if an empy input field is submitted (click)', async ()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        const searchIcon = screen.getByAltText('Search Icon')
        //ACT
        expect(textbox).toHaveValue('')
        await user.click(searchIcon)
        const errorMessage = await screen.findByText ('Please enter a search term')
        //ASSERT
        expect(errorMessage).toBeInTheDocument()
    }),
    it('tests that an error message appears if an empy input field is submitted (enter)', async ()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        //ACT
        expect(textbox).toHaveValue('')
        await user.type(textbox,'{enter}')
        const errorMessage = await screen.findByText ('Please enter a search term')
        //ASSERT
        expect(errorMessage).toBeInTheDocument()
    }),
    it('disables input when loading', async () => {
        //ARRANGE
        const textbox = screen.getByRole('textbox');
        mockApiState = {
            isLoading: true,
            isFetching: false
        };
        //ACT
        await user.type(textbox, 'javascript{enter}');
        //ASSERT
        expect(textbox).toBeDisabled();
    }),
    it('disables input when fetching', async () => {
        //ARRANGE
        const textbox = screen.getByRole('textbox');
        mockApiState = {
            isLoading: false,
            isFetching: true
        };
        //ACT
        await user.type(textbox, 'javascript{enter}');
        //ASSERT
        expect(textbox).toBeDisabled();
    }),
    it('dispatches search term to Redux store on submission', async () => {
        //ARRANGE
        const searchInput = screen.getByRole('textbox')
        //ACT
        await user.type(searchInput, 'javascript{enter}');
        const storeState = store.getState()
        //ASSERT
        expect(storeState.searchTerm).toBe('javascript')
    })
})

describe('verify that upon calling async function loading data and errors are properly handled',()=>{
    it('tests that the isLoading text correctly displays when loading',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: null,
            error: null,
            isError: false,
            isLoading: true,
            isFetching: false
        }
        //ACT
        await user.type(textbox,'javaScript{enter}')
        const isLoadingText = await screen.findByText('Loading...')
        //ASSERT
        expect(isLoadingText).toBeInTheDocument()
    }),
    it('tests that the isLoading icon correctly displays when loading',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: null,
            error: null,
            isError: false,
            isLoading: true,
            isFetching: false
        }
        //ACT
        await user.type(textbox,'javaScript{enter}')
        const isLoadingText = await screen.findByAltText('Loading Icon')
        //ASSERT
        expect(isLoadingText).toBeInTheDocument()
    }),
    it('tests that the isLoading text correctly displays when fetching',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: null,
            error: null,
            isError: false,
            isLoading: false,
            isFetching: true
        }
        //ACT
        await user.type(textbox,'javaScript{enter}')
        const isLoadingText = await screen.findByText('Loading...')
        //ASSERT
        expect(isLoadingText).toBeInTheDocument()        
    }),
    it('tests that the isLoading icon correctly displays when fetching',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: null,
            error: null,
            isError: false,
            isLoading: false,
            isFetching: true
        }
        //ACT
        await user.type(textbox,'javaScript{enter}')
        const isLoadingText = await screen.findByAltText('Loading Icon')
        //ASSERT
        expect(isLoadingText).toBeInTheDocument()
    }),
    it('tests that a default data format error message is correctly displayed if there was an error but no specific error was provided',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: null,
            error: null,
            isError: true,
            isLoading: false,
            isFetching: false
        }
        //ACT
        await user.type(textbox,'javaScript{enter}')
        const errorMessage = await screen.findByText('Failed to fetch results')
        //ASSERT
        expect(errorMessage).toBeInTheDocument()
    }),
    it('tests that the correct error message is displayed if the data is not received in the expected format',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: null,
            error: {message: 'Invalid response format from Reddit'},
            isError: true,
            isLoading: false,
            isFetching: false
        }
        //ACT
        await user.type(textbox,'javaScript{enter}')
        const errorMessage = await screen.findByText('Invalid response format from Reddit')
        //ASSERT
        expect(errorMessage).toBeInTheDocument()
    }),
    it('tests that the correct error message is displayed if there is a network error',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: null,
            error: {message: 'No results found'},
            isError: true,
            isLoading: false,
            isFetching: false
        }
        //ACT
        await user.type(textbox,'javaScript{enter}')
        const errorMessage = await screen.findByText('No results found')
        //ASSERT
        expect(errorMessage).toBeInTheDocument()
    }),
    it('tests that a no results message is displayed if the API calls retrieves no results',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox')
        mockApiState = {
            data: [],
            error: null,
            isError: false,
            isLoading: false,
            isFetching: false
        }
        //ACT
        await user.type(textbox,'JavaScript{enter}')
        const noResults = await screen.findByText('No results found for "JavaScript"')
        //ASSERT
        expect(noResults).toBeInTheDocument()
    }),
    it('clears error message when user starts typing', async () => {
        const textbox = screen.getByRole('textbox');
        await user.type(textbox, '{enter}');
        
        const errorMessage = await screen.findByText('Please enter a search term');
        expect(errorMessage).toBeInTheDocument();
        
        await user.type(textbox, 'j');
        expect(errorMessage).not.toBeInTheDocument();
      });
})

describe('check that navigation is correctly handled',()=>{
    it('navigates the user to the results page upon successful submission',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox');
        mockApiState = {
            data: [{ id: 1, title: 'Result' }],
            error: null,
            isError: false,
            isLoading: false,
            isFetching: false
        };
        //ACT
        await user.type(textbox, 'javascript{enter}');
        const resultsPage= await screen.findByTestId('results-page')
        //ASSERT
        expect(resultsPage).toBeInTheDocument()
    }),    
    it('does not navigate to another page upon abscence of data',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox');
        mockApiState = {
            data: [],
            error: null,
            isError: false,
            isLoading: false,
            isFetching: false
        }
        //ACT
        await user.type(textbox, 'javascript{enter}');
        const resultsPage= screen.queryByTestId('results-page')
        //ASSERT
        expect(resultsPage).not.toBeInTheDocument()
    }),
    it('does not navigate to another page upon data formating error',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox');
        mockApiState = {
            data: null,
            error: {message: 'Invalid response format from Reddit'},
            isError: true,
            isLoading: false,
            isFetching: false
        }
        //ACT
        await user.type(textbox, 'javascript{enter}');
        const resultsPage= screen.queryByTestId('results-page')
        //ASSERT
        expect(resultsPage).not.toBeInTheDocument()
    }),
    it('does not navigate to another page upon network error',async()=>{
        //ARRANGE
        const textbox = screen.getByRole('textbox');
        mockApiState = {
            data: null,
            error: {message: 'Invalid response format from Reddit'},
            isError: true,
            isLoading: false,
            isFetching: false
        }
        //ACT
        await user.type(textbox, 'javascript{enter}');
        const resultsPage= screen.queryByTestId('Reddit service is currently unavailable')
        //ASSERT
        expect(resultsPage).not.toBeInTheDocument()
    })
})

afterEach(() => {
    jest.clearAllMocks()

    mockApiState = {
        data: null,
        error: null,
        isError: false,
        isLoading: false,
        isFetching: false
    }
})