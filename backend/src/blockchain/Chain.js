const Block = require("./Block");

/**
 * Base Chain Class - Represents a blockchain
 * Handles generic blockchain operations
 */
class Chain {
  constructor(chainId, chainType = "base", difficulty = 4) {
    this.chainId = chainId; // Unique identifier for this chain
    this.chainType = chainType; // 'department', 'class', 'student'
    this.blocks = [];
    this.difficulty = difficulty; // PoW difficulty
    this.isValid = true;
  }

  /**
   * Add a genesis block to the chain
   * @param {*} genesisData - Data for the genesis block
   * @param {string} prevHash - Previous block hash (for hierarchical chains)
   */
  addGenesisBlock(genesisData, prevHash = "0") {
    const genesisBlock = new Block(0, [genesisData], prevHash, this.chainType);

    genesisBlock.mineBlock(this.difficulty);
    this.blocks.push(genesisBlock);
  }

  /**
   * Add a new block to the chain
   * @param {*} transactionData - Transaction data
   * @returns {Block} - The newly added block
   */
  addBlock(transactionData) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.blocks.length,
      Array.isArray(transactionData) ? transactionData : [transactionData],
      previousBlock.hash,
      this.chainType
    );

    newBlock.mineBlock(this.difficulty);
    this.blocks.push(newBlock);
    return newBlock;
  }

  /**
   * Get the latest block in the chain
   * @returns {Block} - The last block
   */
  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Get a block by index
   * @param {number} index - Block index
   * @returns {Block | null}
   */
  getBlockByIndex(index) {
    return this.blocks[index] || null;
  }

  /**
   * Get all blocks
   * @returns {Block[]}
   */
  getAllBlocks() {
    return this.blocks;
  }

  /**
   * Validate the entire chain
   * @returns {object} - Validation result { isValid, errors }
   */
  validateChain() {
    const errors = [];

    // Check first block
    if (!this.blocks[0]) {
      return { isValid: false, errors: ["No blocks in chain"] };
    }

    // Validate each block
    for (let i = 0; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];

      // Validate block integrity
      if (!currentBlock.isValid(this.difficulty)) {
        errors.push(`Block ${i} is invalid: Hash or PoW mismatch`);
      }

      // Validate chain continuity (except for genesis block)
      if (i > 0) {
        const previousBlock = this.blocks[i - 1];
        if (currentBlock.prev_hash !== previousBlock.hash) {
          errors.push(
            `Block ${i}: prev_hash doesn't match previous block's hash`
          );
        }
      }
    }

    this.isValid = errors.length === 0;
    return {
      isValid: this.isValid,
      errors: errors,
      blockCount: this.blocks.length,
    };
  }

  /**
   * Get chain statistics
   * @returns {object}
   */
  getStats() {
    return {
      chainId: this.chainId,
      chainType: this.chainType,
      blockCount: this.blocks.length,
      difficulty: this.difficulty,
      isValid: this.isValid,
      genesisHash: this.blocks[0]?.hash || null,
      latestHash: this.getLatestBlock()?.hash || null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Export chain as JSON
   */
  toJSON() {
    return {
      chainId: this.chainId,
      chainType: this.chainType,
      difficulty: this.difficulty,
      isValid: this.isValid,
      blocks: this.blocks.map((block) => block.toJSON()),
    };
  }
}

module.exports = Chain;
