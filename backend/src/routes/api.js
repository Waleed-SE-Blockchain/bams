const express = require("express");

/**
 * Setup routes for the BAMS system
 */
function setupRoutes(
  app,
  departmentController,
  classController,
  studentController,
  attendanceController,
  explorerController
) {
  const router = express.Router();

  // ==================== Department Routes ====================
  router.post("/departments", (req, res) =>
    departmentController.create(req, res)
  );
  router.get("/departments", (req, res) =>
    departmentController.getAll(req, res)
  );
  router.get("/departments/search", (req, res) =>
    departmentController.search(req, res)
  );
  router.get("/departments/:id", (req, res) =>
    departmentController.getById(req, res)
  );
  router.put("/departments/:id", (req, res) =>
    departmentController.update(req, res)
  );
  router.delete("/departments/:id", (req, res) =>
    departmentController.delete(req, res)
  );

  // ==================== Class Routes ====================
  router.post("/classes", (req, res) => classController.create(req, res));
  router.get("/classes", (req, res) => classController.getAll(req, res));
  router.get("/classes/search", (req, res) => classController.search(req, res));
  router.get("/classes/:id", (req, res) => classController.getById(req, res));
  router.get("/departments/:departmentId/classes", (req, res) =>
    classController.getByDepartment(req, res)
  );
  router.put("/classes/:id", (req, res) => classController.update(req, res));
  router.delete("/classes/:id", (req, res) => classController.delete(req, res));

  // ==================== Student Routes ====================
  router.post("/students", (req, res) => studentController.add(req, res));
  router.get("/students", (req, res) => studentController.getAll(req, res));
  router.get("/students/search", (req, res) =>
    studentController.search(req, res)
  );
  router.get("/students/:id", (req, res) =>
    studentController.getById(req, res)
  );
  router.get("/classes/:classId/students", (req, res) =>
    studentController.getByClass(req, res)
  );
  router.get("/departments/:departmentId/students", (req, res) =>
    studentController.getByDepartment(req, res)
  );
  router.put("/students/:id", (req, res) => studentController.update(req, res));
  router.delete("/students/:id", (req, res) =>
    studentController.remove(req, res)
  );

  // ==================== Attendance Routes ====================
  router.post("/attendance", (req, res) => attendanceController.mark(req, res));
  router.get("/attendance/student/:studentId", (req, res) =>
    attendanceController.getStudentHistory(req, res)
  );
  router.get("/attendance/ledger/:studentId", (req, res) =>
    attendanceController.getStudentLedger(req, res)
  );
  router.get("/attendance/class/:classId", (req, res) =>
    attendanceController.getClassAttendanceByDate(req, res)
  );
  router.get("/attendance/department/:departmentId", (req, res) =>
    attendanceController.getDepartmentAttendanceByDate(req, res)
  );

  // ==================== Blockchain Explorer Routes ====================
  router.get("/explorer/state", (req, res) =>
    explorerController.getSystemState(req, res)
  );
  router.get("/explorer/stats", (req, res) =>
    explorerController.getStatistics(req, res)
  );
  router.get("/explorer/validate", (req, res) =>
    explorerController.validateSystem(req, res)
  );
  router.get("/explorer/report", (req, res) =>
    explorerController.getValidationReport(req, res)
  );
  router.get("/explorer/export", (req, res) =>
    explorerController.exportSystem(req, res)
  );
  router.get("/explorer/departments/:departmentId", (req, res) =>
    explorerController.getDepartmentChain(req, res)
  );
  router.get("/explorer/classes/:classId", (req, res) =>
    explorerController.getClassChain(req, res)
  );
  router.get("/explorer/students/:studentId", (req, res) =>
    explorerController.getStudentChain(req, res)
  );

  // ==================== Health Check ====================
  router.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "BAMS Backend is running",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", router);
}

module.exports = setupRoutes;
