
import { Routes, Route } from 'react-router-dom';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import ConfirmationPage from '../pages/ConfirmationPage'

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Clients from '../pages/Clients';
import CompletedTasks from '../pages/CompletedTasks';
import Reports from '../pages/Reports';
import PrivateRoutes from './PrivateRoutes';
import ConfirmEmail from '../pages/ConfirmEmail';
import ChangePassword from '../pages/ChangePassword';
import TaskTypes from '../pages/TaskTypes';
import Subjects from '../pages/Subjects';
import Status from '../pages/Status';



export default function Rotas() {
  return (
    <Routes>

      <Route exact path="/completedtasks" element={<PrivateRoutes><CompletedTasks /></PrivateRoutes>} />
      <Route exact path="/reports" element={<PrivateRoutes><Reports /></PrivateRoutes>} />
      <Route exact path="/profile" element={<PrivateRoutes><Profile /></PrivateRoutes>} />
      <Route exact path="/clients" element={<PrivateRoutes><Clients /></PrivateRoutes>} />
      <Route exact path="/dashboard" element={<PrivateRoutes ><Dashboard /></PrivateRoutes>} />
      <Route exact path="/tasktypes" element={<PrivateRoutes><TaskTypes /> </PrivateRoutes>} />
      <Route exact path="/subjects" element={<PrivateRoutes><Subjects /> </PrivateRoutes>} />
      <Route exact path="/status" element={<PrivateRoutes><Status /> </PrivateRoutes>} />

      {/* <Route exact path="/dashboard" element={<Dashboard />} /> */}
      <Route exact path="/" element={<SignIn />} />
      <Route exact path="/register" element={<SignUp />} />
      <Route exact path="/emailcheck" element={<ConfirmEmail />} />
      <Route exact path="/recovery/:email" element={<ChangePassword />} />
      <Route exact path="/confirmation" element={<ConfirmationPage />} />

    </Routes>
  )
}