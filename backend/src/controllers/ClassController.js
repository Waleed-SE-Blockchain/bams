/**
 * Class Controller
 */
class ClassController {
  constructor(blockchainService) {
    this.service = blockchainService;
  }

  /**
   * Create a new class
   */
  async create(req, res) {
    try {
      const { name, departmentId, section, capacity } = req.body;

      if (!name || !departmentId) {
        return res.status(400).json({
          error: "Class name and department ID are required",
        });
      }

      const result = this.service.createClass(name, departmentId, {
        section: section || "",
        capacity: capacity || 35,
      });

      res.status(201).json({
        success: true,
        message: "Class created successfully",
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
   * Get all classes
   */
  async getAll(req, res) {
    try {
      const classes = this.service.getClassList();
      res.json({
        success: true,
        data: classes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get class by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const cls = this.service.getClass(id);

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
   * Get classes by department
   */
  async getByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const classes = this.service.getClassesByDepartment(departmentId);

      res.json({
        success: true,
        data: classes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update class
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, section, capacity } = req.body;

      const updateData = {};
      if (name) updateData.name_updated = name;
      if (section) updateData.section_updated = section;
      if (capacity) updateData.capacity_updated = capacity;

      const result = this.service.updateClass(id, updateData);

      res.json({
        success: true,
        message: "Class updated successfully",
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
   * Delete class
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      this.service.deleteClass(id);

      res.json({
        success: true,
        message: "Class marked as deleted",
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
   * Search classes
   */
  async search(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          error: "Search query is required",
        });
      }

      const results = this.service.searchClasses(query);

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

module.exports = ClassController;
