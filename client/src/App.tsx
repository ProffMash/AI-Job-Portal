import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { SeekerDashboard } from './seeker/SeekerDashboard';
import { Messages } from './seeker/Messages';
import { MyApplications } from './seeker/MyApplications';
import { SavedJobs } from './seeker/SavedJobs';
import { Notifications } from './seeker/Notifications';
import { EmployerDashboard } from './employer/EmployerDashboard';
import { ManageApplications } from './employer/ManageApplications';
import { TalentPool } from './employer/TalentPool';
import { EmployerMessages } from './employer/EmployerMessages';
import { SavedCandidates } from './employer/SavedCandidates';
import { EmployerNotifications } from './employer/EmployerNotifications';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              user?.role === 'seeker' ? (
                <Navigate to="/seeker" replace />
              ) : (
                <Navigate to="/employer" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/seeker"
          element={
            isAuthenticated && user?.role === 'seeker' ? (
              <SeekerDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/seeker/messages"
          element={
            isAuthenticated && user?.role === 'seeker' ? (
              <Messages />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/seeker/applications"
          element={
            isAuthenticated && user?.role === 'seeker' ? (
              <MyApplications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/seeker/saved"
          element={
            isAuthenticated && user?.role === 'seeker' ? (
              <SavedJobs />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/seeker/notifications"
          element={
            isAuthenticated && user?.role === 'seeker' ? (
              <Notifications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/employer"
          element={
            isAuthenticated && user?.role === 'employer' ? (
              <EmployerDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/employer/applications"
          element={
            isAuthenticated && user?.role === 'employer' ? (
              <ManageApplications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/employer/talent"
          element={
            isAuthenticated && user?.role === 'employer' ? (
              <TalentPool />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/employer/messages"
          element={
            isAuthenticated && user?.role === 'employer' ? (
              <EmployerMessages />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/employer/saved"
          element={
            isAuthenticated && user?.role === 'employer' ? (
              <SavedCandidates />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/employer/notifications"
          element={
            isAuthenticated && user?.role === 'employer' ? (
              <EmployerNotifications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Profile />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;