import { render, screen, waitFor, cleanup } from "@testing-library/react"
import Results from "./Results";
import Subreddit from "../../Components/Subreddit/Subreddit";
import { Provider } from 'react-redux'
import { store } from "../../store";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import apiSearchSlice from "../Search/apisSearchSlice";
import apiResultsSlice from "./apiResultsSlice";
import { setSearchTerm } from "../Search/searchTermSlice";


global.fetch = jest.fn()

let mockApiState = {
    data: [
        {
          id: '1',
          display_name: 'react',
          display_name_prefixed: 'r/react',
          title: 'React JS',
          public_description: 'A JavaScript library',
          created_utc: 1420070400,
          subscribers: 100000,
          subreddit_type: 'public',
          icon_img: 'test.jpg'
        },
        {
          id: '2',
          display_name: 'javascript',
          display_name_prefixed: 'r/javascript',
          title: 'JavaScript',
          public_description: 'Programming language',
          created_utc: 1420070400,
          subscribers: 200000,
          subreddit_type: 'public'
        }
      ],
      isLoading: false,
      isFetching: false,
      error: null
    }

const mockUseSearchQuery = jest.fn()

jest.mock('../Search/apisSearchSlice', () => ({
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

const mockUseFetchSubredditQuery = jest.fn()

jest.mock('./apiResultsSlice', () => ({
    useFetchSubredditQuery: jest.fn((term, options) => {
        if (!options?.skip) {
            mockUseFetchSubredditQuery(term);
        }
        return {
            isLoading: false,
            isFetching: false,
            data: null
        }
    }),
    reducerPath: 'apiResult',
    reducer: () => ({}),
    middleware: () => (next) => (action) => next(action),
}));

let user
  
  beforeEach(() => {
    store.dispatch(setSearchTerm('react'))
    
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/results']}>
                <Routes>
                    <Route path="/results" element={<Results />} />
                    <Route path="/results/:subreddit" element={<Subreddit />} />
                </Routes>
            </MemoryRouter>
        </Provider>
    )
    
    user = userEvent.setup()
  })

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ children, onClick }) => (
        <a onClick={onClick} href="#">
            {children}
        </a>
    ),
}))

describe('verify that initial rendering is adquate',() => {
    test('displays default UI elements', () => {
        expect(screen.getByAltText('Reddit Logo')).toBeInTheDocument()
        expect(screen.getByLabelText('Filter results:')).toBeInTheDocument()
        expect(screen.getByText('Order by:')).toBeInTheDocument()
        expect(screen.getByText('ASC')).toBeInTheDocument()
        expect(screen.getByAltText('Ascending Icon')).toBeInTheDocument()
        expect(screen.getByText('DESC')).toBeInTheDocument()
        expect(screen.getByAltText('Descending Icon')).toBeInTheDocument()
    }),
    test('filter input is empty by default', () => {
        const filterInput = screen.getByLabelText('Filter results:')
        expect(filterInput.value).toBe('')
    })
})

describe('verify that fetched data is correctly displayed and rendered',() => {
    test('displays subreddit information correctly', () => {
        const subredditName = screen.getByText(/r\/react/);
        const subredditTitle = screen.getByText('React JS');
        const subredditDescription = screen.getByText('A JavaScript library');        
        expect(subredditName).toBeInTheDocument();
        expect(subredditTitle).toBeInTheDocument();
        expect(subredditDescription).toBeInTheDocument();
    }),
    test('uses fallback image when icon_img is missing', () => {
        const fallbackImages = screen.getAllByAltText('Subreddit Icon');
        expect(fallbackImages[1].src).toContain('subreddit_icon.svg');
    }),
    test('formats date correctly', () => {
        const dates = screen.getAllByText(/31\/12\/2014/);
        expect(dates[0]).toBeInTheDocument();
        expect(dates).toHaveLength(2);
    }),
    test('formats subscriber count correctly', () => {
        expect(screen.getByText(/100,000 subscribers/)).toBeInTheDocument();
    }),
    test('displays header with search term', () => {
        expect(screen.getByText(/Search Results for/)).toHaveTextContent(store.getState().searchTerm);
    })
})

describe('verify that filtering functionality works',() => {
    test('filters by subreddit name', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'react');
        expect(screen.getByText('A JavaScript library')).toBeInTheDocument();
        expect(screen.queryByText('Programming language')).not.toBeInTheDocument();
    }),
    test('filters by title', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'JS');
        expect(screen.getByText('A JavaScript library')).toBeInTheDocument();
        expect(screen.queryByText('Programming language')).not.toBeInTheDocument();
      });
      test('filters by description', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'Programming');
        expect(screen.queryByText('A JavaScript library')).not.toBeInTheDocument();
        expect(screen.getByText('Programming language')).toBeInTheDocument();
      }),
      test('filters are case insensitive', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'REaCT');
        expect(screen.getByText('A JavaScript library')).toBeInTheDocument();
      }),
      test('shows no results when filter has no matches', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'nonexistent');
        expect(screen.queryByAltText('Public Icon')).not.toBeInTheDocument();
      }),
      test('handles special characters in filter', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, '!@#$%');
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      }),
      test('handles whitespace in filter', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, '   react   ');
        expect(screen.getByText('A JavaScript library')).toBeInTheDocument();
    }),
    test('clears filter input and shows all results', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'react');
        await user.clear(filterInput);
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    }),
    test('applies sort after changing filter', async () => {
        await user.click(screen.getByAltText('Ascending Icon'));
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'react');
        const items = await screen.findAllByRole('listitem');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent('react');
    })    
})

describe('verify that sorting functionality works',() => {
    test('sorts ascending when clicking ASC button', async () => {
        await user.click(screen.getByAltText('Ascending Icon'));
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('javascript');
        expect(items[1]).toHaveTextContent('react');
      }),    
      test('sorts descending when clicking DESC button', async () => {
        await user.click(screen.getByAltText('Descending Icon'));
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('react');
        expect(items[1]).toHaveTextContent('javascript');
      }),    
      test('maintains filter while sorting', async () => {
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'react');
        await user.click(screen.getByAltText('Ascending Icon'));
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
      }),
      test('maintains sort order after filter changes', async () => {
        await user.click(screen.getByAltText('Ascending Icon'));
        const filterInput = screen.getByLabelText('Filter results:');
        await user.type(filterInput, 'react');
        await user.clear(filterInput);        
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('javascript');
        expect(items[1]).toHaveTextContent('react');
    })
})


describe('verify that API calls are properly performed upon selection',() => {
    test('calls API with correct parameters on selection', async () => {
        const link = screen.getByText('React JS');
        await user.click(link);
        expect(mockUseFetchSubredditQuery).toHaveBeenCalledWith('react');
      })    
})

describe('check that navigation and routing is properly handled', () => {
    test('navigates to correct URL on subreddit selection', async () => {
      const link = screen.getByText('React JS');
      await user.click(link);
      expect(screen.findByTestId('subreddit-page')).toBeInTheDocument;
    })
  });

describe('verify handling of missing data', () => {
    beforeEach(() => {
        mockApiState = {
            data: [{
                ...mockApiState.data[0],
                subscribers: null,
                public_description: null
            }],
            isLoading: false,
            error: null
        };
        
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/results']}>
                    <Results />
                </MemoryRouter>
            </Provider>
        );
    })
    
    test('handles missing subscriber count', () => { 
        expect(screen.getByText(/no subscriber data available/i)).toBeInTheDocument();
    });
    test('handles missing description', () => {        
        expect(screen.queryByText('A JavaScript library')).not.toBeInTheDocument();
    });
});

describe('verify handling of null or undefined data', () => {
    beforeEach(() => {
        cleanup();
        mockApiState = {
            ...mockApiState,
            data: [],
        };
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/results']}>
                    <Results />
                </MemoryRouter>
            </Provider>
        );
    });
    test('handles null data gracefully', () => {
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
})