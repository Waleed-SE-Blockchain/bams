/**
 * Attendance Controller
 */
class AttendanceController {
  constructor(blockchainService) {
    this.service = blockchainService;
  }

  /**
   * Mark attendance for a student
   */
  async mark(req, res) {
    try {
      const { studentId, status, date } = req.body;

      if (!studentId || !status) {
        return res.status(400).json({
          error: "Student ID and attendance status are required",
        });
      }

      const validStatuses = ["Present", "Absent", "Leave"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const result = this.service.markAttendance(
        studentId,
        status,
        date || new Date().toISOString()
      );

      res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get attendance history for a student
   */
  async getStudentHistory(req, res) {
    try {
      const { studentId } = req.params;
      const history = this.service.getStudentAttendanceHistory(studentId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get complete student ledger (blockchain)
   */
  async getStudentLedger(req, res) {
    try {
      const { studentId } = req.params;
      const ledger = this.service.getStudentCompleteLedger(studentId);

      res.json({
        success: true,
        data: ledger,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get attendance by class for a specific date
   */
  async getClassAttendanceByDate(req, res) {
    try {
      const { classId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          error: "Date query parameter is required",
        });
      }

      const attendance = this.service.getClassAttendanceByDate(classId, date);

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get attendance by department for a specific date
   */
  async getDepartmentAttendanceByDate(req, res) {
    try {
      const { departmentId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          error: "Date query parameter is required",
        });
      }

      const attendance = this.service.getDepartmentAttendanceByDate(
        departmentId,
        date
      );

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = AttendanceController;
