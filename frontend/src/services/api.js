import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token) {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
}

export const api = {
  modelInfo: () => http.get("/model-info"),
  register: (payload) => http.post("/api/auth/register", payload),
  login: (formData) =>
    http.post("/api/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  me: () => http.get("/api/auth/me"),
  forgotPassword: (email) => http.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    http.post("/api/auth/reset-password", { token, new_password: newPassword }),
  profile: () => http.get("/api/auth/profile"),
  updateProfile: (payload) => http.patch("/api/auth/update", payload),
  changePassword: (payload) => http.post("/api/auth/change-password", payload),
  deleteAccount: () => http.delete("/api/auth/delete-account"),

  predict: (payload) => http.post("/predict", payload),
  predictAndSave: (payload) => http.post("/api/records/predict-and-save", payload),
  listRecords: () => http.get("/api/records/"),
  uploadAndPredict: (formData) => http.post("/api/records/upload-and-predict", formData),

  patientDashboard: () => http.get("/api/dashboards/patient"),
  doctorDashboard: () => http.get("/api/dashboards/doctor"),
  adminDashboard: () => http.get("/api/dashboards/admin"),
  adminAnalytics: () => http.get("/api/analytics/admin"),

  recommendations: (riskLevel) =>
    http.get("/api/recommendations/latest", { params: { risk_level: riskLevel } }),

  notifications: () => http.get("/api/notifications/"),
  createRiskAlert: (message) => http.post("/api/notifications/high-risk-alert", null, { params: { message } }),
  markNotificationRead: (id) => http.patch(`/api/notifications/read/${id}`),
  markAllNotificationsRead: () => http.patch("/api/notifications/read-all"),
  deleteNotification: (id) => http.delete(`/api/notifications/${id}`),

  medicalPdf: (payload) =>
    http.post("/api/reports/medical-pdf", payload, { responseType: "blob" }),
  explain: (prediction) => http.post("/api/ai/explain", { prediction }),
  chatbot: (query) => http.post("/api/ai/chatbot", { query }),
  listDoctors: () => http.get("/api/appointments/doctors"),
  bookAppointment: (payload) => http.post("/api/appointments/", payload),
  myAppointments: () => http.get("/api/appointments/mine"),
  cancelAppointment: (appointmentId) => http.patch(`/api/appointments/cancel/${appointmentId}`),
  updateAppointmentStatus: (appointmentId, payload) =>
    http.patch(`/api/appointments/${appointmentId}/status`, payload),
  patientHistoryForDoctor: (patientId) =>
    http.get(`/api/appointments/patient-history/${patientId}`),
  addConsultationNote: (payload) => http.post("/api/appointments/notes", payload),
  adminCreateStaff: (payload) => http.post("/api/admin/users/create-staff", payload),
  adminDoctorList: () => http.get("/api/admin/users/doctors"),
  adminUsersStats: () => http.get("/api/platform/admin_users/stats"),
  adminUsersAll: () => http.get("/api/platform/admin_users/all"),
  adminUsersCreate: (payload) => http.post("/api/platform/admin_users/create", payload),
  adminUsersUpdate: (id, payload) => http.patch(`/api/platform/admin_users/update/${id}`, payload),
  adminUsersDelete: (id) => http.delete(`/api/platform/admin_users/delete/${id}`),
  assignDoctorToPatient: (payload) => http.post("/api/platform/admin_users/assign-doctor", payload),
  doctorPatients: () => http.get("/api/platform/admin_users/doctor-patients"),
  analyticsModel: () => http.get("/api/platform/analytics/model"),
  analyticsDataset: () => http.get("/api/platform/analytics/dataset"),
  analyticsPredictions: () => http.get("/api/platform/analytics/predictions"),
  analyticsAuditLogs: () => http.get("/api/platform/analytics/audit-logs"),
  analyticsExportLogs: () => http.get("/api/platform/analytics/export-logs"),
  analyticsClearLogs: () => http.delete("/api/platform/analytics/clear-logs"),
  analyticsHealth: () => http.get("/api/platform/analytics/health"),
  analyticsErrors: () => http.get("/api/platform/analytics/errors"),
  analyticsPing: () => http.post("/api/platform/analytics/ping"),
  reportsGenerate: (payload) => http.post("/api/platform/reports/generate", payload),
  reportsList: () => http.get("/api/platform/reports/list"),
  reportsDownload: (id) => http.get(`/api/platform/reports/download/${id}`),
  reportsDelete: (id) => http.delete(`/api/platform/reports/${id}`),
  reportsSchedule: (payload) => http.post("/api/platform/reports/schedule", payload),
};
