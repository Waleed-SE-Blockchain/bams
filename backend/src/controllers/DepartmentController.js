/**
 * Department Controller
 */
class DepartmentController {
  constructor(blockchainService) {
    this.service = blockchainService;
  }

  /**
   * Create a new department
   */
  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Department name is required" });
      }

      const result = this.service.createDepartment(name, {
        description: description || "",
      });

      res.status(201).json({
        success: true,
        message: "Department created successfully",
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
   * Get all departments
   */
  async getAll(req, res) {
    try {
      const departments = this.service.getDepartmentList();
      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get department by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const department = this.service.getDepartment(id);

      res.json({
        success: true,
        data: department,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update department
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const updateData = {};
      if (name) updateData.name_updated = name;
      if (description) updateData.description_updated = description;

      const result = this.service.updateDepartment(id, updateData);

      res.json({
        success: true,
        message: "Department updated successfully",
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
   * Delete department
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      this.service.deleteDepartment(id);

      res.json({
        success: true,
        message: "Department marked as deleted",
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
   * Search departments
   */
  async search(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          error: "Search query is required",
        });
      }

      const results = this.service.searchDepartments(query);

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

module.exports = DepartmentController;
