import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateAppointmentPage from './pages/CreateAppointmentPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import VideoRoomPage from './pages/VideoRoomPage';
import PatientRoomPage from './pages/PatientRoomPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sala/paciente/:token" element={<PatientRoomPage />} />

      {/* Protected routes with layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="citas/nueva" element={<CreateAppointmentPage />} />
        <Route path="citas/:id" element={<AppointmentDetailPage />} />
        <Route
          path="usuarios"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminUsersPage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Video room (protected, no layout) */}
      <Route
        path="/sala/:appointmentId"
        element={
          <PrivateRoute>
            <VideoRoomPage />
          </PrivateRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
