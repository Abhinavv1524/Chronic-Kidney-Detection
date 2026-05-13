import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/core/ProtectedRoute";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import DoctorAnalyticsPage from "./pages/DoctorAnalyticsPage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import DoctorNotificationsPage from "./pages/DoctorNotificationsPage";
import DoctorPage from "./pages/DoctorPage";
import DoctorSettingsPage from "./pages/DoctorSettingsPage";
import EducationPage from "./pages/EducationPage";
import LandingPage from "./pages/LandingPage";
import ModelAnalyticsPage from "./pages/ModelAnalyticsPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import PatientPage from "./pages/PatientPage";
import PatientsListPage from "./pages/PatientsListPage";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";
import RecordsHistoryPage from "./pages/RecordsHistoryPage";
import ReportsCenterPage from "./pages/ReportsCenterPage";
import ResultsPage from "./pages/ResultsPage";
import SettingsPage from "./pages/SettingsPage";
import SystemHealthPage from "./pages/SystemHealthPage";
import UserManagementPage from "./pages/UserManagementPage";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-slate-200">Loading...</div>;
  if (!user) return <LandingPage />;
  return <Navigate to={`/${user.role || "patient"}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/patient" element={<ProtectedRoute roles={["patient"]}><PersonalizedDashboard /></ProtectedRoute>} />
          <Route path="/patient/assessment" element={<ProtectedRoute roles={["patient"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/patient/results/:id" element={<ProtectedRoute roles={["patient"]}><ResultsPage /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute roles={["patient"]}><RecordsHistoryPage /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={["patient"]}><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/patient/education" element={<ProtectedRoute roles={["patient"]}><EducationPage /></ProtectedRoute>} />
          <Route path="/patient/notifications" element={<ProtectedRoute roles={["patient"]}><NotificationsPage /></ProtectedRoute>} />
          <Route path="/patient/settings" element={<ProtectedRoute roles={["patient"]}><SettingsPage /></ProtectedRoute>} />

          <Route path="/doctor" element={<ProtectedRoute roles={["doctor"]}><DoctorPage /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute roles={["doctor"]}><PatientsListPage /></ProtectedRoute>} />
          <Route path="/doctor/patients/:patientId" element={<ProtectedRoute roles={["doctor"]}><PatientDetailPage /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={["doctor"]}><DoctorAppointmentsPage /></ProtectedRoute>} />
          <Route path="/doctor/analytics" element={<ProtectedRoute roles={["doctor"]}><DoctorAnalyticsPage /></ProtectedRoute>} />
          <Route path="/doctor/notifications" element={<ProtectedRoute roles={["doctor"]}><DoctorNotificationsPage /></ProtectedRoute>} />
          <Route path="/doctor/settings" element={<ProtectedRoute roles={["doctor"]}><DoctorSettingsPage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/model" element={<ProtectedRoute roles={["admin"]}><ModelAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute roles={["admin"]}><AuditLogsPage /></ProtectedRoute>} />
          <Route path="/admin/health" element={<ProtectedRoute roles={["admin"]}><SystemHealthPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><ReportsCenterPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><AdminSettingsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
