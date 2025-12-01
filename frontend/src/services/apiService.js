import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiService = {
  // ==================== Department API ====================
  departments: {
    create: (data) => api.post("/departments", data),
    getAll: () => api.get("/departments"),
    getById: (id) => api.get(`/departments/${id}`),
    update: (id, data) => api.put(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`),
    search: (query) => api.get(`/departments/search?query=${query}`),
  },

  // ==================== Class API ====================
  classes: {
    create: (data) => api.post("/classes", data),
    getAll: () => api.get("/classes"),
    getById: (id) => api.get(`/classes/${id}`),
    getByDepartment: (departmentId) =>
      api.get(`/departments/${departmentId}/classes`),
    update: (id, data) => api.put(`/classes/${id}`, data),
    delete: (id) => api.delete(`/classes/${id}`),
    search: (query) => api.get(`/classes/search?query=${query}`),
  },

  // ==================== Student API ====================
  students: {
    add: (data) => api.post("/students", data),
    getAll: () => api.get("/students"),
    getById: (id) => api.get(`/students/${id}`),
    getByClass: (classId) => api.get(`/classes/${classId}/students`),
    getByDepartment: (departmentId) =>
      api.get(`/departments/${departmentId}/students`),
    update: (id, data) => api.put(`/students/${id}`, data),
    remove: (id) => api.delete(`/students/${id}`),
    search: (query) => api.get(`/students/search?query=${query}`),
  },

  // ==================== Attendance API ====================
  attendance: {
    mark: (data) => api.post("/attendance", data),
    getStudentHistory: (studentId) =>
      api.get(`/attendance/student/${studentId}`),
    getStudentLedger: (studentId) => api.get(`/attendance/ledger/${studentId}`),
    getClassByDate: (classId, date) =>
      api.get(`/attendance/class/${classId}?date=${date}`),
    getDepartmentByDate: (departmentId, date) =>
      api.get(`/attendance/department/${departmentId}?date=${date}`),
  },

  // ==================== Blockchain Explorer API ====================
  explorer: {
    getSystemState: () => api.get("/explorer/state"),
    getStatistics: () => api.get("/explorer/stats"),
    validateSystem: () => api.get("/explorer/validate"),
    getValidationReport: () => api.get("/explorer/report"),
    exportSystem: () => api.get("/explorer/export"),
    getSystemExport: () => api.get("/explorer/export"),
    getDepartmentChain: (departmentId) =>
      api.get(`/explorer/departments/${departmentId}`),
    getClassChain: (classId) => api.get(`/explorer/classes/${classId}`),
    getStudentChain: (studentId) => api.get(`/explorer/students/${studentId}`),
  },

  // ==================== System API ====================
  system: {
    initialize: () => api.get("/initialize"),
    health: () => api.get("/health"),
  },
};

export default apiService;
