/**
 * Blockchain Explorer Controller
 */
class ExplorerController {
  constructor(blockchainService) {
    this.service = blockchainService;
  }

  /**
   * Get system state overview
   */
  async getSystemState(req, res) {
    try {
      const state = this.service.getSystemState();

      res.json({
        success: true,
        data: state,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get system statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = this.service.getStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Validate entire system
   */
  async validateSystem(req, res) {
    try {
      const validation = this.service.validateSystem();

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get validation report
   */
  async getValidationReport(req, res) {
    try {
      const report = this.service.getValidationReport();

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get complete system export
   */
  async exportSystem(req, res) {
    try {
      const exportData = this.service.getSystemExport();

      res.json({
        success: true,
        data: exportData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get department blockchain details
   */
  async getDepartmentChain(req, res) {
    try {
      const { departmentId } = req.params;
      const dept = this.service.getDepartment(departmentId);

      res.json({
        success: true,
        data: dept,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get class blockchain details
   */
  async getClassChain(req, res) {
    try {
      const { classId } = req.params;
      const cls = this.service.getClass(classId);

      res.json({
        success: true,
        data: cls,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get student blockchain details
   */
  async getStudentChain(req, res) {
    try {
      const { studentId } = req.params;
      const student = this.service.getStudent(studentId);

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = ExplorerController;
