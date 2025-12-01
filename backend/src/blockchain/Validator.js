/**
 * BlockchainValidator - Multi-level validation engine
 * Validates all three layers of the hierarchical blockchain
 */
class BlockchainValidator {
  /**
   * Validate entire system
   * @param {object} systemData - Contains all department, class, and student chains
   * @returns {object} - Comprehensive validation result
   */
  static validateSystem(systemData) {
    const result = {
      isValid: true,
      timestamp: new Date().toISOString(),
      departments: [],
      classes: [],
      students: [],
      errors: [],
      warnings: [],
    };

    // Validate each department chain
    for (const [deptId, deptChain] of Object.entries(
      systemData.departments || {}
    )) {
      const deptValidation = this.validateDepartmentChain(deptChain);
      result.departments.push(deptValidation);

      if (!deptValidation.isValid) {
        result.isValid = false;
      }
    }

    // Validate each class chain and its linkage to department
    for (const [classId, classChain] of Object.entries(
      systemData.classes || {}
    )) {
      const classValidation = this.validateClassChain(
        classChain,
        systemData.departments[classChain.departmentId]
      );
      result.classes.push(classValidation);

      if (!classValidation.isValid) {
        result.isValid = false;
      }
    }

    // Validate each student chain and its linkage to class
    for (const [studentId, studentChain] of Object.entries(
      systemData.students || {}
    )) {
      const studentValidation = this.validateStudentChain(
        studentChain,
        systemData.classes[studentChain.classId]
      );
      result.students.push(studentValidation);

      if (!studentValidation.isValid) {
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validate department chain
   * @param {DepartmentChain} chain
   * @returns {object}
   */
  static validateDepartmentChain(chain) {
    const validation = chain.validateChain();
    const essentialFieldsValidation = this.validateChainEssentialFields(
      chain.blocks
    );

    return {
      type: "DEPARTMENT",
      chainId: chain.chainId,
      chainName: chain.departmentName,
      blockCount: chain.blocks.length,
      isValid: validation.isValid && essentialFieldsValidation.isValid,
      errors: validation.errors,
      genesisBlockValid: this.validateGenesisBlock(chain.blocks[0]),
      poWValid: this.validateProofOfWork(chain.blocks),
      hashChainValid: this.validateHashChain(chain.blocks),
      essentialFieldsValid: essentialFieldsValidation.isValid,
      essentialFieldsSummary: essentialFieldsValidation.summary,
      blockchainCompliance: {
        description: "Real blockchain system with 6 essential fields",
        fields: [
          "✓ Index - Block number (0, 1, 2, ...)",
          "✓ Timestamp - Creation time (ISO-8601)",
          "✓ Transactions - Attendance records array",
          "✓ Previous Hash - Link to parent block (SHA-256)",
          "✓ Nonce - Proof of Work parameter",
          "✓ Hash - Block hash (SHA-256, starts with 0000)",
        ],
        compliant: essentialFieldsValidation.isValid,
      },
    };
  }

  /**
   * Validate class chain and its linkage to parent department
   * @param {ClassChain} chain
   * @param {DepartmentChain} parentChain
   * @returns {object}
   */
  static validateClassChain(chain, parentChain) {
    const validation = chain.validateChain();
    let parentLinkageValid = false;
    let parentHashInfo = null;

    if (parentChain && parentChain.blocks.length > 0) {
      // Check if the class genesis prev_hash is a valid block in the parent chain
      // (not necessarily the latest block, but any historical block)
      const classGenesisHash = chain.blocks[0]?.prev_hash;
      const parentBlockHashes = parentChain.blocks.map((b) => b.hash);
      parentLinkageValid = parentBlockHashes.includes(classGenesisHash);

      // Find which block in parent chain this class links to
      const linkedBlockIndex = parentChain.blocks.findIndex(
        (b) => b.hash === classGenesisHash
      );
      parentHashInfo =
        linkedBlockIndex >= 0
          ? `linked to parent block ${linkedBlockIndex}`
          : `BROKEN: prev_hash ${classGenesisHash} not found in parent chain`;
    }

    // Validate essential blockchain fields
    const essentialFieldsValidation = this.validateChainEssentialFields(
      chain.blocks
    );

    return {
      type: "CLASS",
      chainId: chain.chainId,
      chainName: chain.className,
      parentDepartmentId: chain.departmentId,
      blockCount: chain.blocks.length,
      isValid: validation.isValid && parentLinkageValid,
      errors: validation.errors,
      parentLinkageValid: parentLinkageValid,
      parentHashInfo: parentHashInfo,
      essentialFieldsValid: essentialFieldsValidation.isValid,
      essentialFieldsSummary: essentialFieldsValidation.summary,
      genesisBlockValid: this.validateGenesisBlock(chain.blocks[0]),
      poWValid: this.validateProofOfWork(chain.blocks),
      hashChainValid: this.validateHashChain(chain.blocks),
      blockchainCompliance: {
        description: "Real blockchain system with 6 essential fields",
        fields: [
          "✓ Index - Block number (0, 1, 2, ...)",
          "✓ Timestamp - Creation time (ISO-8601)",
          "✓ Transactions - Attendance records array",
          "✓ Previous Hash - Link to parent block (SHA-256)",
          "✓ Nonce - Proof of Work parameter",
          "✓ Hash - Block hash (SHA-256, starts with 0000)",
        ],
        compliant: essentialFieldsValidation.isValid,
      },
      childChainDependencyImpact: !parentLinkageValid
        ? `Class chain broken: ${parentHashInfo}`
        : "No impact",
    };
  }

  /**
   * Validate student chain and its linkage to parent class
   * @param {StudentChain} chain
   * @param {ClassChain} parentChain
   * @returns {object}
   */
  static validateStudentChain(chain, parentChain) {
    const validation = chain.validateChain();
    let parentLinkageValid = false;
    let parentHashInfo = null;

    if (parentChain && parentChain.blocks.length > 0) {
      // Check if the student genesis prev_hash is a valid block in the parent chain
      // (not necessarily the latest block, but any historical block)
      const studentGenesisHash = chain.blocks[0]?.prev_hash;
      const parentBlockHashes = parentChain.blocks.map((b) => b.hash);
      parentLinkageValid = parentBlockHashes.includes(studentGenesisHash);

      // Find which block in parent chain this student links to
      const linkedBlockIndex = parentChain.blocks.findIndex(
        (b) => b.hash === studentGenesisHash
      );
      parentHashInfo =
        linkedBlockIndex >= 0
          ? `linked to parent block ${linkedBlockIndex}`
          : `BROKEN: prev_hash ${studentGenesisHash} not found in parent chain`;
    }

    const attendanceRecords = chain.blocks.filter(
      (b) => b.transactions[0]?.type === "ATTENDANCE_RECORD"
    ).length;

    // Validate essential blockchain fields
    const essentialFieldsValidation = this.validateChainEssentialFields(
      chain.blocks
    );

    return {
      type: "STUDENT",
      chainId: chain.chainId,
      chainName: `${chain.studentName} (${chain.rollNumber})`,
      parentClassId: chain.classId,
      blockCount: chain.blocks.length,
      attendanceRecords: attendanceRecords,
      isValid: validation.isValid && parentLinkageValid,
      errors: validation.errors,
      parentLinkageValid: parentLinkageValid,
      parentHashInfo: parentHashInfo,
      essentialFieldsValid: essentialFieldsValidation.isValid,
      essentialFieldsSummary: essentialFieldsValidation.summary,
      genesisBlockValid: this.validateGenesisBlock(chain.blocks[0]),
      poWValid: this.validateProofOfWork(chain.blocks),
      hashChainValid: this.validateHashChain(chain.blocks),
      blockchainCompliance: {
        description: "Real blockchain system with 6 essential fields",
        fields: [
          "✓ Index - Block number (0, 1, 2, ...)",
          "✓ Timestamp - Creation time (ISO-8601)",
          "✓ Transactions - Attendance records array",
          "✓ Previous Hash - Link to parent block (SHA-256)",
          "✓ Nonce - Proof of Work parameter",
          "✓ Hash - Block hash (SHA-256, starts with 0000)",
        ],
        compliant: essentialFieldsValidation.isValid,
      },
      attendanceStats: chain.getAttendanceStats(),
      childChainDependencyImpact: !parentLinkageValid
        ? `Student chain broken: ${parentHashInfo}`
        : "No impact",
    };
  }

  /**
   * Validate genesis block
   * @param {Block} block
   * @returns {boolean}
   */
  static validateGenesisBlock(block) {
    if (!block) return false;

    const expectedTypes = [
      "DEPARTMENT_GENESIS",
      "CLASS_GENESIS",
      "STUDENT_GENESIS",
    ];

    return (
      block.index === 0 && expectedTypes.includes(block.transactions[0]?.type)
    );
  }

  /**
   * Validate Proof of Work for all blocks
   * @param {Block[]} blocks
   * @returns {object}
   */
  static validateProofOfWork(blocks) {
    const powValid = blocks.every((block) => {
      const target = "0".repeat(4); // Default difficulty
      return block.hash.startsWith(target);
    });

    return {
      isValid: powValid,
      blocksChecked: blocks.length,
      validBlocks: blocks.filter((b) => b.hash.startsWith("0000")).length,
    };
  }

  /**
   * Validate hash chain continuity
   * @param {Block[]} blocks
   * @returns {object}
   */
  static validateHashChain(blocks) {
    const errors = [];

    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const previous = blocks[i - 1];

      if (current.prev_hash !== previous.hash) {
        errors.push(
          `Block ${i}: prev_hash mismatch. Expected ${previous.hash}, got ${current.prev_hash}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      blocksChecked: blocks.length,
    };
  }

  /**
   * Validate all 6 essential blockchain fields in a block
   * Required fields: index, timestamp, transactions, prev_hash, nonce, hash
   * @param {Block} block
   * @returns {object}
   */
  static validateEssentialFields(block) {
    const essentialFields = {
      index: {
        present: block.index !== undefined && block.index !== null,
        type: "number",
      },
      timestamp: {
        present: block.timestamp !== undefined && block.timestamp !== null,
        type: "ISO-8601 string",
      },
      transactions: {
        present:
          Array.isArray(block.transactions) && block.transactions.length > 0,
        type: "array of transactions",
      },
      prev_hash: {
        present: block.prev_hash !== undefined && block.prev_hash !== null,
        type: "SHA-256 hash (64 hex chars)",
      },
      nonce: {
        present:
          block.nonce !== undefined &&
          block.nonce !== null &&
          typeof block.nonce === "number",
        type: "integer",
      },
      hash: {
        present:
          block.hash !== undefined &&
          block.hash !== null &&
          block.hash.length === 64,
        type: "SHA-256 hash (64 hex chars)",
      },
    };

    const missingFields = Object.entries(essentialFields)
      .filter(([field, validation]) => !validation.present)
      .map(([field]) => field);

    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields,
      essentialFieldsCount: 6,
      presentFieldsCount: Object.values(essentialFields).filter(
        (v) => v.present
      ).length,
      fields: {
        index: essentialFields.index,
        timestamp: essentialFields.timestamp,
        transactions: essentialFields.transactions,
        prev_hash: essentialFields.prev_hash,
        nonce: essentialFields.nonce,
        hash: essentialFields.hash,
      },
    };
  }

  /**
   * Validate essential fields across entire chain
   * @param {Block[]} blocks
   * @returns {object}
   */
  static validateChainEssentialFields(blocks) {
    const fieldValidations = blocks.map((block, index) => ({
      blockIndex: index,
      validation: this.validateEssentialFields(block),
    }));

    const allValid = fieldValidations.every((v) => v.validation.isValid);
    const blocksWithIssues = fieldValidations.filter(
      (v) => !v.validation.isValid
    );

    return {
      isValid: allValid,
      totalBlocks: blocks.length,
      blocksWithIssues: blocksWithIssues.length,
      issues: blocksWithIssues,
      summary: `${blocks.length - blocksWithIssues.length}/${
        blocks.length
      } blocks have all 6 essential fields`,
    };
  }
  /**
   * Check cascade impact of department tampering
   * @param {object} systemData
   * @param {string} tamperedDepartmentId
   * @returns {object}
   */
  static checkDepartmentTamperImpact(systemData, tamperedDepartmentId) {
    const impactedClasses = [];
    const impactedStudents = [];

    // Find all classes belonging to this department
    for (const [classId, classChain] of Object.entries(
      systemData.classes || {}
    )) {
      if (classChain.departmentId === tamperedDepartmentId) {
        impactedClasses.push(classId);

        // Find all students in these classes
        for (const [studentId, studentChain] of Object.entries(
          systemData.students || {}
        )) {
          if (studentChain.classId === classId) {
            impactedStudents.push(studentId);
          }
        }
      }
    }

    return {
      tamperedDepartmentId: tamperedDepartmentId,
      impactedClasses: impactedClasses,
      impactedClassCount: impactedClasses.length,
      impactedStudents: impactedStudents,
      impactedStudentCount: impactedStudents.length,
      cascadeImpact: `Tampering department affects ${impactedClasses.length} classes and ${impactedStudents.length} students`,
    };
  }

  /**
   * Check cascade impact of class tampering
   * @param {object} systemData
   * @param {string} tamperedClassId
   * @returns {object}
   */
  static checkClassTamperImpact(systemData, tamperedClassId) {
    const impactedStudents = [];

    // Find all students in this class
    for (const [studentId, studentChain] of Object.entries(
      systemData.students || {}
    )) {
      if (studentChain.classId === tamperedClassId) {
        impactedStudents.push(studentId);
      }
    }

    return {
      tamperedClassId: tamperedClassId,
      impactedStudents: impactedStudents,
      impactedStudentCount: impactedStudents.length,
      cascadeImpact: `Tampering class affects ${impactedStudents.length} students`,
    };
  }

  /**
   * Generate comprehensive validation report
   * @param {object} systemData
   * @returns {string} - Markdown formatted report
   */
  static generateValidationReport(systemData) {
    const validation = this.validateSystem(systemData);
    let report = "";

    report += "# Blockchain System Validation Report\n\n";
    report += `**Timestamp:** ${validation.timestamp}\n`;
    report += `**System Valid:** ${validation.isValid ? "✓ YES" : "✗ NO"}\n\n`;

    report += "## Department Chains\n";
    for (const dept of validation.departments) {
      report += `### ${dept.chainName}\n`;
      report += `- Status: ${dept.isValid ? "✓ Valid" : "✗ Invalid"}\n`;
      report += `- Blocks: ${dept.blockCount}\n`;
      report += `- PoW Valid: ${dept.poWValid.isValid ? "✓" : "✗"}\n`;
      report += `- Essential Fields Valid: ${
        dept.essentialFieldsValid ? "✓" : "✗"
      }\n`;
      report += `- Essential Fields Summary: ${dept.essentialFieldsSummary}\n`;
      report += `- Blockchain Compliance: ${
        dept.blockchainCompliance?.compliant ? "✓ Compliant" : "✗ Not Compliant"
      }\n`;
      if (dept.blockchainCompliance?.fields) {
        report += `  - 6 Essential Blockchain Fields:\n`;
        dept.blockchainCompliance.fields.forEach((field) => {
          report += `    ${field}\n`;
        });
      }
      if (dept.errors.length > 0) {
        report += `- Errors:\n`;
        dept.errors.forEach((e) => {
          report += `  - ${e}\n`;
        });
      }
    }

    report += "\n## Class Chains\n";
    for (const cls of validation.classes) {
      report += `### ${cls.chainName}\n`;
      report += `- Status: ${cls.isValid ? "✓ Valid" : "✗ Invalid"}\n`;
      report += `- Parent Linkage: ${
        cls.parentLinkageValid ? "✓ Valid" : "✗ Invalid"
      }\n`;
      report += `- Blocks: ${cls.blockCount}\n`;
      report += `- Essential Fields Valid: ${
        cls.essentialFieldsValid ? "✓" : "✗"
      }\n`;
      report += `- Essential Fields Summary: ${cls.essentialFieldsSummary}\n`;
      report += `- Blockchain Compliance: ${
        cls.blockchainCompliance?.compliant ? "✓ Compliant" : "✗ Not Compliant"
      }\n`;
      if (!cls.parentLinkageValid) {
        report += `- **Impact:** ${cls.childChainDependencyImpact}\n`;
      }
    }

    report += "\n## Student Chains\n";
    for (const student of validation.students) {
      report += `### ${student.chainName}\n`;
      report += `- Status: ${student.isValid ? "✓ Valid" : "✗ Invalid"}\n`;
      report += `- Attendance Records: ${student.attendanceRecords}\n`;
      report += `- Parent Linkage: ${
        student.parentLinkageValid ? "✓ Valid" : "✗ Invalid"
      }\n`;
      report += `- Essential Fields Valid: ${
        student.essentialFieldsValid ? "✓" : "✗"
      }\n`;
      report += `- Essential Fields Summary: ${student.essentialFieldsSummary}\n`;
      report += `- Blockchain Compliance: ${
        student.blockchainCompliance?.compliant
          ? "✓ Compliant"
          : "✗ Not Compliant"
      }\n`;
      if (!student.parentLinkageValid) {
        report += `- **Impact:** ${student.childChainDependencyImpact}\n`;
      }
    }

    return report;
  }
}

module.exports = BlockchainValidator;
