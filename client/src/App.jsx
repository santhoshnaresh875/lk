import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Add from './components/Add'
import User from './components/User'
import 'bootstrap/dist/css/bootstrap.min.css'
import "./components/App.css"



function App() {
  return <>
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Add/>}/>
      <Route path='/users' element={<User/>}/>
    </Routes>
  </BrowserRouter>
  </>
}

export default App