import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Login } from './authentication/Login/Login';
import { Register } from './authentication/Register/Register';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { LayoutPages } from './components/LayoutPages';
import { PrivateRoutes } from './utils/PrivateRoutes';
import { NewTicket } from './components/TicketComponents/NewTicket';
import { TicketDetails } from './components/TicketComponents/TicketDetails';
import { AddProjectForm } from './components/ProjectComponents/AddProjectForm';
import { ProjectDetails } from './components/ProjectComponents/ProjectDetails';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { NotificationDetails } from './components/NotificationComponents/NotificationDetails';
import { Users } from './pages/Users';
import { Admin } from './pages/Admin';

function App() {

  return (
    <div className='App'>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route element={<LayoutPages />} path='/'>
            <Route element={<Home />} path='' />
            <Route element={<Projects />} path='/projects' />
            <Route element={<NewTicket />} path='/create-ticket' />
            <Route element={<TicketDetails />} path='/tickets/:id' />
            <Route element={<AddProjectForm />} path='/create-project' />
            <Route element={<ProjectDetails />} path='/projects/:id' />
            <Route element={<Messages />} path='/messages' />
            <Route element={<Notifications />} path='/notifications' />
            <Route element={<NotificationDetails />} path='/notifications/:userId/:notificationId' />
            <Route element={<Users />} path='/users' />
            <Route element={<Admin />} path='/admin' />
          </Route>
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
