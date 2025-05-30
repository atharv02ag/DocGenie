import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom' 

//pages and components
import Home from './pages/Home.jsx'
import Library from './pages/Library.jsx'
import Upload from './pages/Upload.jsx'
import View from './pages/View.jsx'
import Insight from './pages/Insight.jsx'
import Error from './pages/Error.jsx'
import ProtectedRoutes from './lib/ProtectedRoutes.jsx'

function App() {

  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState(0);

  return (
    <div className='App'>
      <BrowserRouter>
        <div className='pages'>
          <Routes>
            <Route
              path='/'
              element={<Home />}
            />
            <Route element={<ProtectedRoutes />}>
              <Route
                path='/Library'
                element={<Library setErrorMsg = {setErrorMsg} setErrorCode = {setErrorCode} errorCode = {errorCode}/>}
              />
              <Route
                path='/Upload'
                element={<Upload setErrorMsg = {setErrorMsg} setErrorCode = {setErrorCode} errorCode = {errorCode}/>}
              />
              <Route
                path='/View/:id'
                element={<View setErrorMsg = {setErrorMsg} setErrorCode = {setErrorCode} errorCode = {errorCode}/>}
              />
              <Route
                path='/Insight/:id'
                element={<Insight setErrorMsg = {setErrorMsg} setErrorCode = {setErrorCode} errorCode = {errorCode}/>}
              />
            </Route>
              <Route 
                path='/*'
                element={<Error errorMessage={errorMsg} errorCode={errorCode}/>}
              />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
