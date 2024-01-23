import React from 'react'
import { Router, Routes, Route } from 'react-router-dom'
import { Login } from './authentication/Login/Login'
import { Register } from './authentication/Register/Register'
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import {LayoutPages} from './components/LayoutPages'
import { PrivateRoutes } from './utils/PrivateRoutes'


function  App () {
  return (
    <div className='App'>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route Component={LayoutPages} path='/'>
            <Route element={<Home />} path='' />
            <Route element={<Projects />} path='/projects' />
          </Route>
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
