const { BlockchainManager } = require("../blockchain");

/**
 * BlockchainService - Business logic for blockchain operations
 */
class BlockchainService {
  constructor(blockchainManager, databaseService) {
    this.manager = blockchainManager;
    this.db = databaseService;
  }

  /**
   * Initialize system with default departments
   */
  initializeSystem() {
    const departments = [
      "School of Computing",
      "School of Software Engineering",
    ];

    const createdDepts = [];
    let globalStudentCounter = 1; // Global counter for unique roll numbers

    for (let deptIndex = 1; deptIndex <= departments.length; deptIndex++) {
      const deptName = departments[deptIndex - 1];
      const dept = this.manager.createDepartment(deptName, {
        description: `${deptName} Department`,
      });
      createdDepts.push({ id: dept.chainId, name: deptName });

      // Create 5 classes per department
      for (let i = 1; i <= 5; i++) {
        const className = `${deptName} - Class ${i}`;
        const cls = this.manager.createClass(className, dept.chainId, {
          section: `Section ${i}`,
          capacity: 35,
        });

        // Add 35 students per class
        for (let j = 1; j <= 5; j++) {
          const studentName = `Student ${deptIndex}-${i}-${j}`;
          // Globally unique roll number format: DEPT-CLASS-STUDENT
          // Example: 1-01-01 (Dept 1, Class 1, Student 1), 1-01-02, ..., 2-01-01 (Dept 2, Class 1, Student 1)
          const rollNumber = `${deptIndex}-${String(i).padStart(
            2,
            "0"
          )}-${String(j).padStart(2, "0")}`;
          this.manager.addStudent(studentName, rollNumber, cls.chainId, {
            email: `student.${deptIndex}.${i}.${j}@school.edu`,
          });
          globalStudentCounter++;
        }
      }
    }

    this.saveSystemState();
    return createdDepts;
  }

  /**
   * Save current system state to database
   */
  saveSystemState() {
    const systemData = {
      departments: this.manager.departments,
      classes: this.manager.classes,
      students: this.manager.students,
    };
    this.db.saveSystemState(systemData);
  }

  /**
   * Department operations
   */

  createDepartment(departmentName, metadata = {}) {
    const dept = this.manager.createDepartment(departmentName, metadata);
    this.db.saveDepartment(dept.chainId, dept);
    return {
      id: dept.chainId,
      name: departmentName,
      state: dept.getCurrentState(),
    };
  }

  getDepartmentList() {
    return Object.entries(this.manager.departments)
      .map(([id, dept]) => {
        const state = dept.getCurrentState();
        return state && state.status !== "deleted" ? { id, ...state } : null;
      })
      .filter(Boolean);
  }

  getDepartment(departmentId) {
    const dept = this.manager.getDepartment(departmentId);
    if (!dept) {
      throw new Error(`Department ${departmentId} not found`);
    }

    return {
      id: departmentId,
      state: dept.getCurrentState(),
      blockCount: dept.blocks.length,
      validation: dept.validateChain(),
      history: dept.getHistory(),
    };
  }

  updateDepartment(departmentId, updateData) {
    this.manager.updateDepartment(departmentId, updateData);
    const dept = this.manager.getDepartment(departmentId);
    this.db.saveDepartment(departmentId, dept);
    return dept.getCurrentState();
  }

  deleteDepartment(departmentId) {
    this.manager.deleteDepartment(departmentId);
    const dept = this.manager.getDepartment(departmentId);
    this.db.saveDepartment(departmentId, dept);
    return { status: "deleted" };
  }

  searchDepartments(query) {
    return this.manager.searchDepartments(query);
  }

  /**
   * Class operations
   */

  createClass(className, departmentId, metadata = {}) {
    const cls = this.manager.createClass(className, departmentId, metadata);
    this.db.saveClass(cls.chainId, cls);
    return {
      id: cls.chainId,
      name: className,
      departmentId: departmentId,
      state: cls.getCurrentState(),
    };
  }

  getClassList() {
    return Object.entries(this.manager.classes)
      .map(([id, cls]) => {
        const state = cls.getCurrentState();
        return state && state.status !== "deleted" ? { id, ...state } : null;
      })
      .filter(Boolean);
  }

  getClass(classId) {
    const cls = this.manager.getClass(classId);
    if (!cls) {
      throw new Error(`Class ${classId} not found`);
    }

    return {
      id: classId,
      state: cls.getCurrentState(),
      blockCount: cls.blocks.length,
      validation: cls.validateChain(),
      history: cls.getHistory(),
    };
  }

  getClassesByDepartment(departmentId) {
    return this.manager
      .getClassesByDepartment(departmentId)
      .map((cls) => {
        const state = cls.getCurrentState();
        return state && state.status !== "deleted"
          ? { id: cls.chainId, ...state }
          : null;
      })
      .filter(Boolean);
  }

  updateClass(classId, updateData) {
    this.manager.updateClass(classId, updateData);
    const cls = this.manager.getClass(classId);
    this.db.saveClass(classId, cls);
    return cls.getCurrentState();
  }

  deleteClass(classId) {
    this.manager.deleteClass(classId);
    const cls = this.manager.getClass(classId);
    this.db.saveClass(classId, cls);
    return { status: "deleted" };
  }

  searchClasses(query) {
    return this.manager.searchClasses(query);
  }

  /**
   * Student operations
   */

  addStudent(studentName, rollNumber, classId, metadata = {}) {
    // Check for duplicate roll number across entire school
    const allStudents = this.getStudentList();
    const isDuplicate = allStudents.some(
      (s) => s.rollNumber === rollNumber && s.status !== "removed"
    );

    if (isDuplicate) {
      throw new Error(
        `Roll number '${rollNumber}' already exists in the school. Please use a unique roll number.`
      );
    }

    const student = this.manager.addStudent(
      studentName,
      rollNumber,
      classId,
      metadata
    );
    this.db.saveStudent(student.chainId, student);
    return {
      id: student.chainId,
      name: studentName,
      rollNumber: rollNumber,
      classId: classId,
      state: student.getCurrentState(),
    };
  }

  getStudentList() {
    return Object.entries(this.manager.students)
      .map(([id, student]) => {
        const state = student.getCurrentState();
        return state && state.status !== "deleted"
          ? {
              id,
              ...state,
              stats: student.getAttendanceStats(),
            }
          : null;
      })
      .filter(Boolean);
  }

  getStudent(studentId) {
    const student = this.manager.getStudent(studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    return {
      id: studentId,
      state: student.getCurrentState(),
      blockCount: student.blocks.length,
      stats: student.getAttendanceStats(),
      validation: student.validateChain(),
      ledger: student.getCompleteLedger(),
    };
  }

  getStudentsByClass(classId) {
    return this.manager
      .getStudentsByClass(classId)
      .map((student) => {
        const state = student.getCurrentState();
        return state && state.status !== "deleted"
          ? {
              id: student.chainId,
              ...state,
              stats: student.getAttendanceStats(),
            }
          : null;
      })
      .filter(Boolean);
  }

  getStudentsByDepartment(departmentId) {
    return this.manager
      .getStudentsByDepartment(departmentId)
      .map((student) => {
        const state = student.getCurrentState();
        return state && state.status !== "deleted"
          ? {
              id: student.chainId,
              ...state,
              stats: student.getAttendanceStats(),
            }
          : null;
      })
      .filter(Boolean);
  }

  updateStudent(studentId, updateData) {
    this.manager.updateStudent(studentId, updateData);
    const student = this.manager.getStudent(studentId);
    this.db.saveStudent(studentId, student);
    return student.getCurrentState();
  }

  removeStudent(studentId) {
    this.manager.removeStudent(studentId);
    const student = this.manager.getStudent(studentId);
    this.db.saveStudent(studentId, student);
    return { status: "deleted" };
  }

  searchStudents(query) {
    return this.manager.searchStudents(query);
  }

  /**
   * Get all roll numbers in system for uniqueness validation
   */
  getAllRollNumbers() {
    return this.getStudentList()
      .filter((s) => s.status !== "removed")
      .map((s) => s.rollNumber);
  }

  /**
   * Check if roll number is unique in the school
   */
  isRollNumberUnique(rollNumber, excludeStudentId = null) {
    const allStudents = this.getStudentList();
    return !allStudents.some(
      (s) =>
        s.rollNumber === rollNumber &&
        s.status !== "removed" &&
        s.id !== excludeStudentId
    );
  }

  /**
   * Attendance operations
   */

  markAttendance(studentId, status, date = new Date().toISOString()) {
    const block = this.manager.markAttendance(studentId, status, date);
    const student = this.manager.getStudent(studentId);
    this.db.saveStudent(studentId, student);

    return {
      blockIndex: block.index,
      hash: block.hash,
      nonce: block.nonce,
      timestamp: block.timestamp,
      status: status,
      date: date,
    };
  }

  getStudentAttendanceHistory(studentId) {
    const student = this.manager.getStudent(studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    return {
      studentId: student.chainId,
      studentName: student.studentName,
      rollNumber: student.rollNumber,
      stats: student.getAttendanceStats(),
      history: student.getAttendanceHistory(),
    };
  }

  getStudentCompleteLedger(studentId) {
    const student = this.manager.getStudent(studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    return {
      studentId: student.chainId,
      studentName: student.studentName,
      rollNumber: student.rollNumber,
      stats: student.getAttendanceStats(),
      ledger: student.getCompleteLedger(),
    };
  }

  getClassAttendanceByDate(classId, date) {
    return {
      classId: classId,
      date: date,
      records: this.manager.getClassAttendanceByDate(classId, date),
    };
  }

  getDepartmentAttendanceByDate(departmentId, date) {
    return {
      departmentId: departmentId,
      date: date,
      classes: this.manager.getDepartmentAttendanceByDate(departmentId, date),
    };
  }

  /**
   * Validation operations
   */

  validateSystem() {
    return this.manager.validateSystem();
  }

  getValidationReport() {
    return this.manager.generateValidationReport();
  }

  /**
   * Explorer operations
   */

  getSystemState() {
    return this.manager.getSystemState();
  }

  getSystemExport() {
    return this.manager.exportSystem();
  }

  /**
   * Statistics
   */

  getStatistics() {
    const systemState = this.manager.getSystemState();

    const stats = {
      timestamp: systemState.timestamp,
      departments: systemState.departments.length,
      classes: systemState.classes.length,
      students: systemState.students.length,
      totalBlocks:
        (systemState.departments || []).reduce(
          (sum, d) => sum + d.blockCount,
          0
        ) +
        (systemState.classes || []).reduce((sum, c) => sum + c.blockCount, 0) +
        (systemState.students || []).reduce((sum, s) => sum + s.blockCount, 0),
      attendanceRecords: (systemState.students || []).reduce(
        (sum, s) => sum + (s.stats?.total || 0),
        0
      ),
    };

    return stats;
  }
}

module.exports = BlockchainService;
