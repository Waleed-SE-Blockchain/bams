/**
 * Student Controller
 */
class StudentController {
  constructor(blockchainService) {
    this.service = blockchainService;
  }

  /**
   * Add a new student
   */
  async add(req, res) {
    try {
      const { name, rollNumber, classId, email } = req.body;

      if (!name || !rollNumber || !classId) {
        return res.status(400).json({
          error: "Student name, roll number, and class ID are required",
        });
      }

      const result = this.service.addStudent(name, rollNumber, classId, {
        email: email || "",
      });

      res.status(201).json({
        success: true,
        message: "Student added successfully",
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
   * Get all students
   */
  async getAll(req, res) {
    try {
      const students = this.service.getStudentList();
      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get student by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const student = this.service.getStudent(id);

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

  /**
   * Get students by class
   */
  async getByClass(req, res) {
    try {
      const { classId } = req.params;
      const students = this.service.getStudentsByClass(classId);

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get students by department
   */
  async getByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const students = this.service.getStudentsByDepartment(departmentId);

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update student
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const updateData = {};
      if (name) updateData.name_updated = name;
      if (email) updateData.email_updated = email;

      const result = this.service.updateStudent(id, updateData);

      res.json({
        success: true,
        message: "Student updated successfully",
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
   * Remove student
   */
  async remove(req, res) {
    try {
      const { id } = req.params;

      this.service.removeStudent(id);

      res.json({
        success: true,
        message: "Student marked as removed",
        data: { status: "deleted" },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Search students
   */
  async search(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          error: "Search query is required",
        });
      }

      const results = this.service.searchStudents(query);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = StudentController;
