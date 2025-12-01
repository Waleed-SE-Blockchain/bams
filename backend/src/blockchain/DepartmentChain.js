const Chain = require("./Chain");

/**
 * DepartmentChain - Layer 1 of the hierarchical blockchain
 * Each department has its own independent blockchain
 * All class chains will use this chain's latest block as their genesis prev_hash
 */
class DepartmentChain extends Chain {
  constructor(departmentId, departmentName, difficulty = 4) {
    super(departmentId, "department", difficulty);
    this.departmentName = departmentName;
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Initialize department chain with genesis block
   * @param {object} departmentData - Department metadata
   */
  initializeChain(departmentData) {
    // Remove only unnecessary timestamps, but keep createdAt as it's the creation date
    const { timestamp, ...cleanData } = departmentData;

    const genesisData = {
      type: "DEPARTMENT_GENESIS",
      departmentId: this.chainId,
      departmentName: this.departmentName,
      ...cleanData,
      // Keep createdAt as it represents when the department was created
      // Do NOT include timestamp - use block's timestamp instead
    };

    this.addGenesisBlock(genesisData, "0"); // Department chain has no parent
  }

  /**
   * Add a department update/deletion record
   * No block is ever removed; instead a new block is added with status
   * @param {object} updateData - Update or deletion data
   */
  addDepartmentUpdate(updateData) {
    // Remove any timestamp from updateData to avoid conflicts with block timestamp
    const { timestamp, updatedAt, ...cleanData } = updateData;

    // Handle updates to department name
    if (cleanData.name_updated) {
      this.departmentName = cleanData.name_updated;
    }

    const transactionData = {
      type: "DEPARTMENT_UPDATE",
      departmentId: this.chainId,
      departmentName: this.departmentName,
      ...cleanData,
      // Do NOT include timestamp here - use block's timestamp instead
    };

    const block = this.addBlock(transactionData);
    this.metadata.updatedAt = new Date().toISOString();
    return block;
  }

  /**
   * Mark department as deleted (doesn't remove the block)
   * @param {string} reason - Reason for deletion
   */
  markAsDeleted(reason = "Department removed") {
    return this.addDepartmentUpdate({
      status: "deleted",
      reason: reason,
    });
  }

  /**
   * Get current state of department (from latest block)
   * @returns {object} - Current department state
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

    // Scan blocks from latest to oldest to find the current state
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      if (block.transactions[0]) {
        const transaction = block.transactions[0];
        if (transaction.status === "deleted") {
          return { status: "deleted", deletedAt: block.timestamp };
        }
        // Return the latest non-deleted state
        if (
          transaction.type === "DEPARTMENT_GENESIS" ||
          transaction.type === "DEPARTMENT_UPDATE"
        ) {
          return {
            departmentId: this.chainId,
            departmentName: this.departmentName, // Use chain's current property
            description: description,
            createdAt: createdAt || transaction.createdAt,
            status: "active",
            lastUpdated: block.timestamp,
            ...transaction, // Still spread for any other fields
          };
        }
      }
    }
    return null;
  }

  /**
   * Get department history (all updates)
   * @returns {array} - Array of all state changes
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
   * Get department chain with validation
   * @returns {object}
   */
  toJSON() {
    const validation = this.validateChain();
    return {
      chainId: this.chainId,
      chainType: this.chainType,
      departmentName: this.departmentName,
      difficulty: this.difficulty,
      metadata: this.metadata,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
      },
      blocks: this.blocks.map((block) => block.toJSON()),
    };
  }
}

module.exports = DepartmentChain;
