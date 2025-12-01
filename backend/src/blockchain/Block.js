const crypto = require("crypto");

/**
 * Block Class - Represents a single block in the blockchain
 * A block contains:
 * - index: Block number
 * - timestamp: Creation time
 * - transactions: Data (attendance, metadata, etc.)
 * - prev_hash: Hash of the previous block
 * - nonce: Proof of Work nonce
 * - hash: SHA-256 hash of this block
 */
class Block {
  constructor(index, transactions, prev_hash = "0", chainType = "department") {
    this.index = index;
    this.timestamp = new Date().toISOString();
    this.transactions = transactions; // Array of transaction objects
    this.prev_hash = prev_hash;
    this.nonce = 0;
    this.hash = null;
    this.chainType = chainType; // 'department', 'class', 'student', 'attendance'
  }

  /**
   * Calculate SHA-256 hash of the block
   * Hash includes: timestamp, transactions, prev_hash, nonce
   */
  calculateHash() {
    const blockData = {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      prev_hash: this.prev_hash,
      nonce: this.nonce,
    };

    const blockString = JSON.stringify(blockData);
    return crypto.createHash("sha256").update(blockString).digest("hex");
  }

  /**
   * Mine the block using Proof of Work
   * Finds a nonce that makes the hash start with '0000'
   * @param {number} difficulty - Number of leading zeros required (default: 4)
   */
  mineBlock(difficulty = 4) {
    const target = "0".repeat(difficulty);

    while (this.hash === null || !this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(
      `✓ Block ${this.index} mined. Hash: ${this.hash}, Nonce: ${this.nonce}`
    );
  }

  /**
   * Validate the block
   * Checks if the hash is correctly calculated and PoW is valid
   * @param {number} difficulty - Expected difficulty level
   * @returns {boolean} - Whether the block is valid
   */
  isValid(difficulty = 4) {
    // Recalculate the hash
    const recalculatedHash = this.calculateHash();

    // Check if hash matches
    if (recalculatedHash !== this.hash) {
      return false;
    }

    // Check PoW condition
    const target = "0".repeat(difficulty);
    if (!this.hash.startsWith(target)) {
      return false;
    }

    return true;
  }

  /**
   * Get block data for API response
   */
  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      prev_hash: this.prev_hash,
      nonce: this.nonce,
      hash: this.hash,
      chainType: this.chainType,
    };
  }
}

module.exports = Block;
