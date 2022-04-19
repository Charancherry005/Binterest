import './App.css';
import { NavLink, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import BinnedImages from './components/BinnedImages';
import Images from './components/Images';
import MyPosts from './components/MyPosts';
import NewImage from './components/NewImage';
import PopularImages from './components/PopularImages'
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client';
import BinnedImages from './components/BinnedImages';
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000'
  })
});

function App() {
  return (
    <ApolloProvider client={client}>
    <Router>
    <div className="App">
              <h1>Binterest</h1>
              <nav>
              <br/>
              <NavLink className="navlink" to="/my-bin">
                My Bin
              </NavLink>  
              &nbsp; 

              
              <NavLink className="navlink" to="/">
                Images
              </NavLink> 
             
              &nbsp;
              
             
              <NavLink className="navlink" to="/my-posts">
                My Posts
              </NavLink> 
              
              &nbsp;
              
              
              <NavLink className="navlink" to="/popularity">
                Popular posts
              </NavLink> 

            </nav>
            <br></br>
            <br></br> 
          <Routes>
             <Route exact path="/" element={<Images />} /> 
             <Route exact path="/my-posts" element={<MyPosts />}/>  
            <Route exact path="/my-bin" element={<BinnedImages />}/> 
            <Route exact path="/new-post" element={<NewImage />} /> 
            <Route exact path = "/popularity" element = {<PopularImages />} /> 
         </Routes>
      
    </div>
    </Router>
    </ApolloProvider>
  );
}

export default App;


