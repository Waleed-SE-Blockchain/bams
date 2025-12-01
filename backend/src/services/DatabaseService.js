const fs = require("fs");
const path = require("path");

/**
 * DatabaseService - Handles persistence of blockchain data
 */
class DatabaseService {
  constructor(dataDir = "./data") {
    this.dataDir = dataDir;
    this.departmentsFile = path.join(dataDir, "departments.json");
    this.classesFile = path.join(dataDir, "classes.json");
    this.studentsFile = path.join(dataDir, "students.json");
    this.initializeDataFiles();
  }

  /**
   * Initialize data files if they don't exist
   */
  initializeDataFiles() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    [this.departmentsFile, this.classesFile, this.studentsFile].forEach(
      (file) => {
        if (!fs.existsSync(file)) {
          fs.writeFileSync(file, JSON.stringify({}, null, 2));
        }
      }
    );
  }

  /**
   * Save department chain
   * @param {string} departmentId
   * @param {DepartmentChain} chain
   */
  saveDepartment(departmentId, chain) {
    const data = this.loadAllDepartments();
    data[departmentId] = chain.toJSON();
    this.writeFile(this.departmentsFile, data);
  }

  /**
   * Load department chain
   * @param {string} departmentId
   * @returns {object | null}
   */
  loadDepartment(departmentId) {
    const data = this.loadAllDepartments();
    return data[departmentId] || null;
  }

  /**
   * Load all departments
   * @returns {object}
   */
  loadAllDepartments() {
    return this.readFile(this.departmentsFile);
  }

  /**
   * Save class chain
   * @param {string} classId
   * @param {ClassChain} chain
   */
  saveClass(classId, chain) {
    const data = this.loadAllClasses();
    data[classId] = chain.toJSON();
    this.writeFile(this.classesFile, data);
  }

  /**
   * Load class chain
   * @param {string} classId
   * @returns {object | null}
   */
  loadClass(classId) {
    const data = this.loadAllClasses();
    return data[classId] || null;
  }

  /**
   * Load all classes
   * @returns {object}
   */
  loadAllClasses() {
    return this.readFile(this.classesFile);
  }

  /**
   * Save student chain
   * @param {string} studentId
   * @param {StudentChain} chain
   */
  saveStudent(studentId, chain) {
    const data = this.loadAllStudents();
    data[studentId] = chain.toJSON();
    this.writeFile(this.studentsFile, data);
  }

  /**
   * Load student chain
   * @param {string} studentId
   * @returns {object | null}
   */
  loadStudent(studentId) {
    const data = this.loadAllStudents();
    return data[studentId] || null;
  }

  /**
   * Load all students
   * @returns {object}
   */
  loadAllStudents() {
    return this.readFile(this.studentsFile);
  }

  /**
   * Save entire system state
   * @param {object} systemData
   */
  saveSystemState(systemData) {
    const departments = {};
    const classes = {};
    const students = {};

    // Extract and save department chains
    Object.entries(systemData.departments || {}).forEach(([id, chain]) => {
      departments[id] = chain.toJSON();
    });

    // Extract and save class chains
    Object.entries(systemData.classes || {}).forEach(([id, chain]) => {
      classes[id] = chain.toJSON();
    });

    // Extract and save student chains
    Object.entries(systemData.students || {}).forEach(([id, chain]) => {
      students[id] = chain.toJSON();
    });

    this.writeFile(this.departmentsFile, departments);
    this.writeFile(this.classesFile, classes);
    this.writeFile(this.studentsFile, students);
  }

  /**
   * Load entire system state
   * @returns {object}
   */
  loadSystemState() {
    return {
      departments: this.loadAllDepartments(),
      classes: this.loadAllClasses(),
      students: this.loadAllStudents(),
    };
  }

  /**
   * Read file
   * @private
   */
  readFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return {};
    }
  }

  /**
   * Write file
   * @private
   */
  writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
    }
  }

  /**
   * Clear all data
   */
  clearAllData() {
    [this.departmentsFile, this.classesFile, this.studentsFile].forEach(
      (file) => {
        this.writeFile(file, {});
      }
    );
  }

  /**
   * Export backup
   * @param {string} backupPath
   */
  createBackup(backupPath) {
    const systemState = this.loadSystemState();
    this.writeFile(backupPath, systemState);
  }

  /**
   * Import from backup
   * @param {string} backupPath
   */
  importFromBackup(backupPath) {
    try {
      const backup = this.readFile(backupPath);
      if (backup.departments) {
        this.writeFile(this.departmentsFile, backup.departments);
      }
      if (backup.classes) {
        this.writeFile(this.classesFile, backup.classes);
      }
      if (backup.students) {
        this.writeFile(this.studentsFile, backup.students);
      }
      return true;
    } catch (error) {
      console.error("Error importing backup:", error);
      return false;
    }
  }
}

module.exports = DatabaseService;
