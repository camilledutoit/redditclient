import './App.css'
import { RouterProvider,createBrowserRouter,Route,createRoutesFromElements } from 'react-router-dom'
import Root from './Components/Root/Root.jsx'
import Search from './Features/Search/Search.jsx'
import Results from './Features/Results/Results.jsx'
import Subreddit from './Components/Subreddit/Subreddit.jsx'
import About from './Features/About/About.jsx'

const router = createBrowserRouter(createRoutesFromElements(
<Route path="/" element={<Root/>}>  
  <Route index element={<Search/>}/>
  <Route path="results">
    <Route index element={<Results/>}/>
    <Route path=":subreddit" element={<Subreddit/>}/>
  </Route>
  <Route path="about" element={<About/>}/>
</Route>
))

function App() {
  return(
  <RouterProvider router={router} />
  )
}

export default App
