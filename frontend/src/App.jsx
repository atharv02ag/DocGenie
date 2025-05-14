import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom' 

//pages and components
import Home from './pages/Home.jsx'
import Library from './pages/Library.jsx'
import Upload from './pages/Upload.jsx'

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <div className='pages'>
          <Routes>
            <Route
              path='/'
              element={<Home />}
            />
            <Route
              path='/Library'
              element={<Library />}
            />
            <Route
              path='/Upload'
              element={<Upload />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
