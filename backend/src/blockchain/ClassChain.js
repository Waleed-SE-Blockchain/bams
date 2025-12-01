const Chain = require("./Chain");

/**
 * ClassChain - Layer 2 of the hierarchical blockchain
 * Each class belongs to a department and inherits the department chain's security
 * Its genesis block's prev_hash = latest block hash of the parent department chain
 */
class ClassChain extends Chain {
  constructor(
    classId,
    className,
    departmentId,
    latestDepartmentHash,
    difficulty = 4
  ) {
    super(classId, "class", difficulty);
    this.className = className;
    this.departmentId = departmentId;
    this.parentHash = latestDepartmentHash; // Link to parent department
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Initialize class chain with genesis block
   * IMPORTANT: Genesis block's prev_hash must be the latest hash from parent department
   * This creates the hierarchical linkage
   * @param {object} classData - Class metadata
   */
  initializeChain(classData) {
    // Remove only unnecessary timestamps, but keep createdAt as it's the creation date
    const { timestamp, ...cleanData } = classData;

    const genesisData = {
      type: "CLASS_GENESIS",
      classId: this.chainId,
      className: this.className,
      departmentId: this.departmentId,
      ...cleanData,
      // Keep createdAt as it represents when the class was created
      // Do NOT include timestamp - use block's timestamp instead
    };

    // Genesis block uses parent department's latest hash as prev_hash
    this.addGenesisBlock(genesisData, this.parentHash);
  }

  /**
   * Add a class update/deletion record
   * @param {object} updateData - Update or deletion data
   */
  addClassUpdate(updateData) {
    // Remove any timestamp from updateData to avoid conflicts with block timestamp
    const { timestamp, updatedAt, ...cleanData } = updateData;

    // Handle updates to class name
    if (cleanData.name_updated) {
      this.className = cleanData.name_updated;
    }

    const transactionData = {
      type: "CLASS_UPDATE",
      classId: this.chainId,
      className: this.className,
      departmentId: this.departmentId,
      ...cleanData,
      // Do NOT include timestamp here - use block's timestamp instead
    };

    const block = this.addBlock(transactionData);
    this.metadata.updatedAt = new Date().toISOString();
    return block;
  }

  /**
   * Mark class as deleted
   * @param {string} reason - Reason for deletion
   */
  markAsDeleted(reason = "Class removed") {
    return this.addClassUpdate({
      status: "deleted",
      reason: reason,
    });
  }

  /**
   * Get current state of class
   * @returns {object} - Current class state
   */
  getCurrentState() {
    // Get createdAt from genesis block (block 0)
    let createdAt = null;
    if (this.blocks[0]?.transactions[0]) {
      createdAt = this.blocks[0].transactions[0].createdAt;
    }

    // Get description from latest transaction if available
    let description = null;
    if (this.blocks.length > 0) {
      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const transaction = this.blocks[i]?.transactions[0];
        if (transaction && transaction.description_updated) {
          description = transaction.description_updated;
          break;
        }
        if (transaction && transaction.description) {
          description = transaction.description;
          break;
        }
      }
    }

    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      if (block.transactions[0]) {
        const transaction = block.transactions[0];
        if (transaction.status === "deleted") {
          return { status: "deleted", deletedAt: block.timestamp };
        }
        if (
          transaction.type === "CLASS_GENESIS" ||
          transaction.type === "CLASS_UPDATE"
        ) {
          return {
            classId: this.chainId,
            className: this.className, // Use chain's current property
            departmentId: this.departmentId,
            description: description,
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
   * Verify that this class chain is properly linked to parent department
   * @param {string} departmentLatestHash - Latest hash from parent department chain
   * @returns {boolean} - Whether the linkage is valid
   */
  verifyParentLinkage(departmentLatestHash) {
    if (!this.blocks[0]) {
      return false;
    }
    // Genesis block's prev_hash should match the parent's latest hash
    return this.blocks[0].prev_hash === departmentLatestHash;
  }

  /**
   * Get class history
   * @returns {array}
   */
  getHistory() {
    return this.blocks.map((block) => {
      const transaction = block.transactions[0];
      return {
        blockIndex: block.index,
        timestamp: block.timestamp,
        hash: block.hash,
        action: transaction.type,
        status: transaction.status || "active",
        ...transaction,
      };
    });
  }

  /**
   * Export class chain
   */
  toJSON() {
    const validation = this.validateChain();
    return {
      chainId: this.chainId,
      chainType: this.chainType,
      className: this.className,
      departmentId: this.departmentId,
      parentHash: this.parentHash,
      difficulty: this.difficulty,
      metadata: this.metadata,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        parentLinkageValid: this.verifyParentLinkage(this.parentHash),
      },
      blocks: this.blocks.map((block) => block.toJSON()),
    };
  }
}

module.exports = ClassChain;
