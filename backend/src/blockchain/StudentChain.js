const Chain = require("./Chain");

/**
 * StudentChain - Layer 3 of the hierarchical blockchain
 * Each student has their own personal blockchain ledger
 * Its genesis block's prev_hash = latest block hash of the parent class chain
 * Attendance records are appended as blocks to this chain
 */
class StudentChain extends Chain {
  constructor(
    studentId,
    studentName,
    rollNumber,
    classId,
    departmentId,
    latestClassHash,
    difficulty = 4
  ) {
    super(studentId, "student", difficulty);
    this.studentName = studentName;
    this.rollNumber = rollNumber;
    this.classId = classId;
    this.departmentId = departmentId;
    this.parentHash = latestClassHash; // Link to parent class
    this.attendanceCount = {
      present: 0,
      absent: 0,
      leave: 0,
    };
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Initialize student chain with genesis block
   * IMPORTANT: Genesis block's prev_hash must be the latest hash from parent class
   * @param {object} studentData - Student metadata
   */
  initializeChain(studentData) {
    // Remove only unnecessary timestamps, but keep createdAt as it's the creation date
    const { timestamp, ...cleanData } = studentData;

    const genesisData = {
      type: "STUDENT_GENESIS",
      studentId: this.chainId,
      studentName: this.studentName,
      rollNumber: this.rollNumber,
      classId: this.classId,
      departmentId: this.departmentId,
      ...cleanData,
      // Keep createdAt as it represents when the student was created
      // Do NOT include timestamp - use block's timestamp instead
    };

    // Genesis block uses parent class's latest hash as prev_hash
    this.addGenesisBlock(genesisData, this.parentHash);
  }

  /**
   * Mark attendance for the student
   * Creates a new block with attendance record
   * @param {string} status - 'Present', 'Absent', or 'Leave'
   * @param {string} date - Date of attendance
   * @param {object} metadata - Additional metadata
   * @returns {Block} - The newly created attendance block
   */
  markAttendance(status, date = new Date().toISOString(), metadata = {}) {
    const validStatuses = ["Present", "Absent", "Leave"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid attendance status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Update attendance count
    const statusKey = status.toLowerCase();
    this.attendanceCount[statusKey]++;

    // Remove any timestamp from metadata to avoid conflicts with block timestamp
    const { timestamp, updatedAt, ...cleanMetadata } = metadata;

    const attendanceData = {
      type: "ATTENDANCE_RECORD",
      studentId: this.chainId,
      studentName: this.studentName,
      rollNumber: this.rollNumber,
      classId: this.classId,
      departmentId: this.departmentId,
      status: status,
      date: date,
      // Do NOT include timestamp here - use block's timestamp instead
      ...cleanMetadata,
    };

    const block = this.addBlock(attendanceData);
    this.metadata.updatedAt = new Date().toISOString();
    return block;
  }

  /**
   * Update student information
   * Creates a new block with updated student details
   * @param {object} updateData - Updated student fields
   */
  updateStudent(updateData) {
    // Remove any timestamp from updateData to avoid conflicts with block timestamp
    const { timestamp, updatedAt, ...cleanData } = updateData;

    // Handle updates to student name
    if (cleanData.name_updated) {
      this.studentName = cleanData.name_updated;
    }

    const transactionData = {
      type: "STUDENT_UPDATE",
      studentId: this.chainId,
      studentName: this.studentName,
      rollNumber: this.rollNumber,
      classId: this.classId,
      departmentId: this.departmentId,
      // Do NOT include timestamp here - use block's timestamp instead
      ...cleanData,
    };

    const block = this.addBlock(transactionData);
    this.metadata.updatedAt = new Date().toISOString();
    return block;
  }

  /**
   * Mark student as deleted
   * @param {string} reason - Reason for deletion
   */
  markAsDeleted(reason = "Student removed") {
    return this.updateStudent({
      status: "deleted",
      reason: reason,
    });
  }

  /**
   * Get attendance history
   * @returns {array} - All attendance records
   */
  getAttendanceHistory() {
    return this.blocks
      .filter((block) => block.transactions[0]?.type === "ATTENDANCE_RECORD")
      .map((block) => {
        const transaction = block.transactions[0];
        return {
          blockIndex: block.index,
          hash: block.hash,
          timestamp: block.timestamp,
          date: transaction.date,
          status: transaction.status,
          nonce: block.nonce,
        };
      });
  }

  /**
   * Get current state of student
   * @returns {object}
   */
  getCurrentState() {
    // Get createdAt from genesis block (block 0)
    let createdAt = null;
    if (this.blocks[0]?.transactions[0]) {
      createdAt = this.blocks[0].transactions[0].createdAt;
    }

    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      if (block.transactions[0]) {
        const transaction = block.transactions[0];
        if (transaction.status === "deleted") {
          return { status: "deleted", deletedAt: block.timestamp };
        }
        if (
          transaction.type === "STUDENT_GENESIS" ||
          transaction.type === "STUDENT_UPDATE"
        ) {
          return {
            studentId: this.chainId,
            studentName: this.studentName, // Use chain's current property
            rollNumber: this.rollNumber,
            classId: this.classId,
            departmentId: this.departmentId,
            createdAt: createdAt || transaction.createdAt, // Preserve createdAt
            status: "active",
            lastUpdated: block.timestamp,
            ...transaction,
          };
        }
      }
    }
    return null;
  }

  /**
   * Get attendance statistics
   * @returns {object}
   */
  getAttendanceStats() {
    return {
      studentId: this.chainId,
      studentName: this.studentName,
      rollNumber: this.rollNumber,
      total: this.blocks.length - 1, // Excluding genesis block
      present: this.attendanceCount.present,
      absent: this.attendanceCount.absent,
      leave: this.attendanceCount.leave,
    };
  }

  /**
   * Verify that this student chain is properly linked to parent class
   * @param {string} classLatestHash - Latest hash from parent class chain
   * @returns {boolean}
   */
  verifyParentLinkage(classLatestHash) {
    if (!this.blocks[0]) {
      return false;
    }
    return this.blocks[0].prev_hash === classLatestHash;
  }

  /**
   * Get complete student ledger
   * @returns {array}
   */
  getCompleteLedger() {
    return this.blocks.map((block) => {
      const transaction = block.transactions[0];
      return {
        blockIndex: block.index,
        timestamp: block.timestamp,
        hash: block.hash,
        prev_hash: block.prev_hash,
        nonce: block.nonce,
        type: transaction.type,
        status: transaction.status || transaction.type,
        data: transaction,
      };
    });
  }

  /**
   * Export student chain
   */
  toJSON() {
    const validation = this.validateChain();
    return {
      chainId: this.chainId,
      chainType: this.chainType,
      studentName: this.studentName,
      rollNumber: this.rollNumber,
      classId: this.classId,
      departmentId: this.departmentId,
      parentHash: this.parentHash,
      difficulty: this.difficulty,
      metadata: this.metadata,
      attendanceStats: this.getAttendanceStats(),
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        parentLinkageValid: this.verifyParentLinkage(this.parentHash),
      },
      blocks: this.blocks.map((block) => block.toJSON()),
    };
  }
}

module.exports = StudentChain;
