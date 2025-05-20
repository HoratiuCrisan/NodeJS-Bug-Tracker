import { Routes, Route, BrowserRouter } from 'react-router-dom';
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
import { UserProvider } from './context/UserProvider';

function App() {
  return (
    <div className="App">
  
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private routes */}
          <Route element={<PrivateRoutes />}>
            <Route
              element={
                <UserProvider>
                  <LayoutPages />
                </UserProvider>
              }
            >
              <Route index element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="create-ticket" element={<NewTicket />} />
              <Route path="tickets/:ticketId" element={<TicketDetails />} />
              <Route path="create-project" element={<AddProjectForm />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="notifications/:userId/:notificationId" element={<NotificationDetails />} />
              <Route path="users" element={<Users />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Route>
        </Routes>
    </div>
  );
}

export default App;
