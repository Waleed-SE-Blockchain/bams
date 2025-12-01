const DepartmentChain = require("./DepartmentChain");
const ClassChain = require("./ClassChain");
const StudentChain = require("./StudentChain");
const BlockchainValidator = require("./Validator");
const { v4: uuidv4 } = require("uuid");

/**
 * BlockchainManager - Main orchestrator for the entire BAMS system
 * Manages all three layers and maintains hierarchical relationships
 */
class BlockchainManager {
  constructor(difficulty = 4) {
    this.difficulty = difficulty;
    this.departments = {}; // {departmentId: DepartmentChain}
    this.classes = {}; // {classId: ClassChain}
    this.students = {}; // {studentId: StudentChain}
  }

  /**
   * Create a new department
   * @param {string} departmentName
   * @param {object} metadata
   * @returns {DepartmentChain}
   */
  createDepartment(departmentName, metadata = {}) {
    const departmentId = uuidv4();
    const deptChain = new DepartmentChain(
      departmentId,
      departmentName,
      this.difficulty
    );

    const genesisData = {
      ...metadata,
      createdAt: new Date().toISOString(),
    };

    deptChain.initializeChain(genesisData);
    this.departments[departmentId] = deptChain;

    console.log(`✓ Department created: ${departmentName} (${departmentId})`);
    return deptChain;
  }

  /**
   * Get department by ID
   * @param {string} departmentId
   * @returns {DepartmentChain | null}
   */
  getDepartment(departmentId) {
    return this.departments[departmentId] || null;
  }

  /**
   * Get all departments
   * @returns {object}
   */
  getAllDepartments() {
    return this.departments;
  }

  /**
   * Update department
   * @param {string} departmentId
   * @param {object} updateData
   */
  updateDepartment(departmentId, updateData) {
    const dept = this.departments[departmentId];
    if (!dept) {
      throw new Error(`Department ${departmentId} not found`);
    }

    dept.addDepartmentUpdate({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete department (marks as deleted in blockchain)
   * Cascade: Also marks all classes in this department as deleted
   * @param {string} departmentId
   * @param {string} reason
   */
  deleteDepartment(departmentId, reason = "Department removed") {
    const dept = this.departments[departmentId];
    if (!dept) {
      throw new Error(`Department ${departmentId} not found`);
    }

    // Mark department as deleted
    dept.markAsDeleted(reason);

    // CASCADE: Mark all classes in this department as deleted
    const classes = this.getClassesByDepartment(departmentId);
    for (const cls of classes) {
      // Also cascade delete students in each class
      this.deleteClass(
        cls.chainId,
        `Cascade: Parent department deleted (${reason})`
      );
    }
  }

  /**
   * Create a class in a department
   * @param {string} className
   * @param {string} departmentId
   * @param {object} metadata
   * @returns {ClassChain}
   */
  createClass(className, departmentId, metadata = {}) {
    const dept = this.departments[departmentId];
    if (!dept) {
      throw new Error(`Department ${departmentId} not found`);
    }

    const classId = uuidv4();
    const latestDeptHash = dept.getLatestBlock().hash;

    const classChain = new ClassChain(
      classId,
      className,
      departmentId,
      latestDeptHash,
      this.difficulty
    );

    const genesisData = {
      ...metadata,
      createdAt: new Date().toISOString(),
    };

    classChain.initializeChain(genesisData);
    this.classes[classId] = classChain;

    console.log(
      `✓ Class created: ${className} (${classId}) in department ${departmentId}`
    );
    return classChain;
  }

  /**
   * Get class by ID
   * @param {string} classId
   * @returns {ClassChain | null}
   */
  getClass(classId) {
    return this.classes[classId] || null;
  }

  /**
   * Get all classes
   * @returns {object}
   */
  getAllClasses() {
    return this.classes;
  }

  /**
   * Get classes by department
   * @param {string} departmentId
   * @returns {ClassChain[]}
   */
  getClassesByDepartment(departmentId) {
    return Object.values(this.classes).filter(
      (cls) => cls.departmentId === departmentId
    );
  }

  /**
   * Update class
   * @param {string} classId
   * @param {object} updateData
   */
  updateClass(classId, updateData) {
    const cls = this.classes[classId];
    if (!cls) {
      throw new Error(`Class ${classId} not found`);
    }

    cls.addClassUpdate({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete class
   * Cascade: Also marks all students in this class as deleted
   * @param {string} classId
   * @param {string} reason
   */
  deleteClass(classId, reason = "Class removed") {
    const cls = this.classes[classId];
    if (!cls) {
      throw new Error(`Class ${classId} not found`);
    }

    // Mark class as deleted
    cls.markAsDeleted(reason);

    // CASCADE: Mark all students in this class as deleted
    const students = this.getStudentsByClass(classId);
    for (const student of students) {
      student.markAsDeleted(`Cascade: Parent class deleted (${reason})`);
    }
  }

  /**
   * Add a student to a class
   * @param {string} studentName
   * @param {string} rollNumber
   * @param {string} classId
   * @param {object} metadata
   * @returns {StudentChain}
   */
  addStudent(studentName, rollNumber, classId, metadata = {}) {
    const cls = this.classes[classId];
    if (!cls) {
      throw new Error(`Class ${classId} not found`);
    }

    const studentId = uuidv4();
    const latestClassHash = cls.getLatestBlock().hash;
    const departmentId = cls.departmentId;

    const studentChain = new StudentChain(
      studentId,
      studentName,
      rollNumber,
      classId,
      departmentId,
      latestClassHash,
      this.difficulty
    );

    const genesisData = {
      ...metadata,
      createdAt: new Date().toISOString(),
    };

    studentChain.initializeChain(genesisData);
    this.students[studentId] = studentChain;

    console.log(
      `✓ Student added: ${studentName} (${rollNumber}) to class ${classId}`
    );
    return studentChain;
  }

  /**
   * Get student by ID
   * @param {string} studentId
   * @returns {StudentChain | null}
   */
  getStudent(studentId) {
    return this.students[studentId] || null;
  }

  /**
   * Get all students
   * @returns {object}
   */
  getAllStudents() {
    return this.students;
  }

  /**
   * Get students by class
   * @param {string} classId
   * @returns {StudentChain[]}
   */
  getStudentsByClass(classId) {
    return Object.values(this.students).filter(
      (student) => student.classId === classId
    );
  }

  /**
   * Get students by department
   * @param {string} departmentId
   * @returns {StudentChain[]}
   */
  getStudentsByDepartment(departmentId) {
    return Object.values(this.students).filter(
      (student) => student.departmentId === departmentId
    );
  }

  /**
   * Update student
   * @param {string} studentId
   * @param {object} updateData
   */
  updateStudent(studentId, updateData) {
    const student = this.students[studentId];
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    student.updateStudent(updateData);
  }

  /**
   * Remove student
   * @param {string} studentId
   * @param {string} reason
   */
  removeStudent(studentId, reason = "Student removed") {
    const student = this.students[studentId];
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    student.markAsDeleted(reason);
  }

  /**
   * Mark attendance for a student
   * @param {string} studentId
   * @param {string} status - 'Present', 'Absent', or 'Leave'
   * @param {string} date
   * @param {object} metadata
   * @returns {Block}
   */
  markAttendance(
    studentId,
    status,
    date = new Date().toISOString(),
    metadata = {}
  ) {
    const student = this.students[studentId];
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    return student.markAttendance(status, date, metadata);
  }

  /**
   * Get attendance history for a student
   * @param {string} studentId
   * @returns {array}
   */
  getStudentAttendanceHistory(studentId) {
    const student = this.students[studentId];
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    return student.getAttendanceHistory();
  }

  /**
   * Get attendance for a class on a specific date
   * @param {string} classId
   * @param {string} date
   * @returns {array}
   */
  getClassAttendanceByDate(classId, date) {
    const students = this.getStudentsByClass(classId);
    const attendance = [];

    for (const student of students) {
      const history = student.getAttendanceHistory();
      const dayRecord = history.find((record) => record.date === date);
      if (dayRecord) {
        attendance.push({
          studentId: student.chainId,
          studentName: student.studentName,
          rollNumber: student.rollNumber,
          status: dayRecord.status,
          timestamp: dayRecord.timestamp,
        });
      }
    }

    return attendance;
  }

  /**
   * Get attendance for entire department on a specific date
   * @param {string} departmentId
   * @param {string} date
   * @returns {array}
   */
  getDepartmentAttendanceByDate(departmentId, date) {
    const classes = this.getClassesByDepartment(departmentId);
    const attendance = [];

    for (const cls of classes) {
      const classAttendance = this.getClassAttendanceByDate(cls.chainId, date);
      attendance.push({
        className: cls.className,
        classId: cls.chainId,
        records: classAttendance,
      });
    }

    return attendance;
  }

  /**
   * Validate entire blockchain system
   * @returns {object}
   */
  validateSystem() {
    const systemData = {
      departments: this.departments,
      classes: this.classes,
      students: this.students,
    };

    return BlockchainValidator.validateSystem(systemData);
  }

  /**
   * Generate validation report
   * @returns {string}
   */
  generateValidationReport() {
    const systemData = {
      departments: this.departments,
      classes: this.classes,
      students: this.students,
    };

    return BlockchainValidator.generateValidationReport(systemData);
  }

  /**
   * Search departments by name
   * @param {string} query
   * @returns {array}
   */
  searchDepartments(query) {
    const lowerQuery = query.toLowerCase();
    return Object.entries(this.departments)
      .filter(([_, dept]) => {
        const state = dept.getCurrentState();
        return (
          state &&
          state.status !== "deleted" &&
          state.departmentName.toLowerCase().includes(lowerQuery)
        );
      })
      .map(([id, dept]) => ({
        id,
        ...dept.getCurrentState(),
      }));
  }

  /**
   * Search classes by name
   * @param {string} query
   * @returns {array}
   */
  searchClasses(query) {
    const lowerQuery = query.toLowerCase();
    return Object.entries(this.classes)
      .filter(([_, cls]) => {
        const state = cls.getCurrentState();
        return (
          state &&
          state.status !== "deleted" &&
          state.className.toLowerCase().includes(lowerQuery)
        );
      })
      .map(([id, cls]) => ({
        id,
        ...cls.getCurrentState(),
      }));
  }

  /**
   * Search students by name or roll number
   * @param {string} query
   * @returns {array}
   */
  searchStudents(query) {
    const lowerQuery = query.toLowerCase();
    return Object.entries(this.students)
      .filter(([_, student]) => {
        const state = student.getCurrentState();
        return (
          state &&
          state.status !== "deleted" &&
          (state.studentName.toLowerCase().includes(lowerQuery) ||
            state.rollNumber.toLowerCase().includes(lowerQuery))
        );
      })
      .map(([id, student]) => ({
        id,
        ...student.getCurrentState(),
        stats: student.getAttendanceStats(),
      }));
  }

  /**
   * Get complete system state
   * @returns {object}
   */
  getSystemState() {
    return {
      timestamp: new Date().toISOString(),
      departments: Object.entries(this.departments).map(([id, dept]) => ({
        id,
        state: dept.getCurrentState(),
        blockCount: dept.blocks.length,
      })),
      classes: Object.entries(this.classes).map(([id, cls]) => ({
        id,
        state: cls.getCurrentState(),
        blockCount: cls.blocks.length,
      })),
      students: Object.entries(this.students).map(([id, student]) => ({
        id,
        state: student.getCurrentState(),
        blockCount: student.blocks.length,
        stats: student.getAttendanceStats(),
      })),
    };
  }

  /**
   * Export entire system as JSON
   * @returns {object}
   */
  exportSystem() {
    return {
      timestamp: new Date().toISOString(),
      validation: this.validateSystem(),
      departments: Object.entries(this.departments).map(([id, dept]) => ({
        id,
        chain: dept.toJSON(),
      })),
      classes: Object.entries(this.classes).map(([id, cls]) => ({
        id,
        chain: cls.toJSON(),
      })),
      students: Object.entries(this.students).map(([id, student]) => ({
        id,
        chain: student.toJSON(),
      })),
    };
  }
}

module.exports = BlockchainManager;
