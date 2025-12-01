# BAMS Technical Architecture Document

## 📐 System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  Dashboard | Departments | Classes | Students | Attendance  │
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTP/JSON)
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Express.js)                    │
│              RESTful Routes & Controllers                    │
├─────────────────────────────────────────────────────────────┤
│                   BlockchainService                          │
│         (Business Logic & State Management)                  │
├─────────────────────────────────────────────────────────────┤
│                   BlockchainManager                          │
│  (Orchestrates Department, Class, Student Chains)           │
├─────────────────────────────────────────────────────────────┤
│     Blockchain Layers:                                      │
│  ├─ Layer 1: DepartmentChain                                │
│  ├─ Layer 2: ClassChain (Child of Department)               │
│  ├─ Layer 3: StudentChain (Child of Class)                  │
│  └─ Layer 4: Attendance Blocks (in Student Chain)           │
├─────────────────────────────────────────────────────────────┤
│                   BlockchainValidator                        │
│         (Multi-Level Validation & PoW Checking)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               Data Persistence Layer                         │
│         (DatabaseService - JSON File Storage)               │
│  ├─ departments.json                                        │
│  ├─ classes.json                                            │
│  └─ students.json                                           │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Blockchain Architecture

### Hierarchical Blockchain Pyramid

```
Layer 1: Department Blockchain (Independent)
┌───────────────────────────────────┐
│ Block 0 (Genesis): Dept A         │
│ - prev_hash: "0"                  │
│ - hash: SHA256(...) = 0000abc123  │
└───────────────────────────────────┘
              ↓
Layer 2: Class Blockchains (Child of Dept)
┌──────────────────────┐  ┌──────────────────────┐
│ B0 (Genesis): CS-101 │  │ B0 (Genesis): CS-102 │
│ - prev_hash: 0000abc │  │ - prev_hash: 0000abc │
│ - hash: 0000def456   │  │ - hash: 0000ghi789   │
└──────────────────────┘  └──────────────────────┘
        ↓                          ↓
Layer 3: Student Blockchains (Child of Class)
    ┌────────────────┐       ┌─────────────────┐
    │ B0: John Doe   │       │ B0: Jane Smith   │
    │ prev: 0000def  │       │ prev: 0000def    │
    │ hash: 0000xyz1 │       │ hash: 0000xyz2   │
    └────────────────┘       └─────────────────┘
           ↓                         ↓
  Layer 4: Attendance Blocks   Attendance Blocks
  ┌──────────────────┐        ┌──────────────────┐
  │ B1: Present      │        │ B1: Absent       │
  │ prev: 0000xyz1   │        │ prev: 0000xyz2   │
  │ hash: 0000aaa1   │        │ hash: 0000bbb1   │
  ├──────────────────┤        ├──────────────────┤
  │ B2: Absent       │        │ B2: Present      │
  │ prev: 0000aaa1   │        │ prev: 0000bbb1   │
  │ hash: 0000aaa2   │        │ hash: 0000bbb2   │
  └──────────────────┘        └──────────────────┘
```

### Block Linkage Flow

```
Department A
    genesis_hash = H(Dept_data + nonce₁) = 0000dep1

    ↓ (Creates)

Class CS-101 genesis_block
    prev_hash = 0000dep1
    hash = H(Class_data + nonce₂) = 0000cls1

    ↓ (Creates)

Student A genesis_block
    prev_hash = 0000cls1
    hash = H(Student_data + nonce₃) = 0000std1

    ↓ (Attendance)

Attendance Block 1
    prev_hash = 0000std1
    hash = H(Present + nonce₄) = 0000att1

    ↓ (Attendance)

Attendance Block 2
    prev_hash = 0000att1
    hash = H(Absent + nonce₅) = 0000att2

Chain Integrity: Each hash depends on previous, any change invalidates all descendants
```

## 💾 Data Model

### Block Structure

```javascript
Block {
  index: number,                    // Position in chain (0 = genesis)
  timestamp: ISO8601,               // When block was created
  transactions: array,              // Payload:
                                   // - DEPARTMENT_GENESIS: dept metadata
                                   // - DEPARTMENT_UPDATE: dept changes
                                   // - CLASS_GENESIS: class metadata
                                   // - CLASS_UPDATE: class changes
                                   // - STUDENT_GENESIS: student metadata
                                   // - STUDENT_UPDATE: student changes
                                   // - ATTENDANCE_RECORD: attendance event
  prev_hash: string,                // SHA256 of previous block (genesis: "0")
  nonce: number,                    // Proof of Work nonce
  hash: string,                     // SHA256 of this block
  chainType: string                 // 'department' | 'class' | 'student'
}
```

### Hash Calculation

```javascript
Block.hash = SHA256(
  JSON.stringify({
    index: this.index,
    timestamp: this.timestamp,
    transactions: this.transactions,
    prev_hash: this.prev_hash,
    nonce: this.nonce,
  })
);
```

### Proof of Work Algorithm

```javascript
mineBlock(difficulty = 4) {
  const target = '0'.repeat(difficulty);  // "0000" for difficulty=4

  while (this.hash === null || !this.hash.startsWith(target)) {
    this.nonce++;
    this.hash = calculateHash();  // Recalculate with new nonce
  }

  // Average ~65,536 iterations to find valid hash
  // Each attempt requires full SHA256 computation
}
```

## 🔐 Security & Validation

### Multi-Level Validation Flow

```
validateSystem()
  │
  ├─ For each Department Chain:
  │  ├─ Check all blocks have valid hashes
  │  ├─ Check prev_hash chain continuity
  │  ├─ Check PoW (hash starts with "0000")
  │  │
  │  └─ For each Class in Department:
  │     ├─ Validate Class Chain
  │     ├─ Check Class genesis.prev_hash == Dept.latest_hash
  │     │
  │     └─ For each Student in Class:
  │        ├─ Validate Student Chain
  │        ├─ Check Student genesis.prev_hash == Class.latest_hash
  │        │
  │        └─ For each Attendance Block in Student:
  │           ├─ Verify hash and PoW
  │           └─ Check prev_hash continuity
  │
  └─ Report:
     - System Valid / Invalid
     - Errors found
     - Cascade impact analysis
```

### Validation Results Example

```
VALIDATION RESULT
├─ System Status: VALID ✓
├─ Departments: 2 (valid)
├─ Classes: 10 (all valid)
├─ Students: 350 (all valid)
│
├─ Department Chain Validation
│  ├─ School of Computing
│  │  ├─ Blocks: 1 ✓
│  │  ├─ Hash Continuity: ✓
│  │  ├─ PoW: ✓
│  │  └─ Cascade Impact: 5 classes, 175 students
│  │
│  └─ School of Software Engineering
│     ├─ Blocks: 1 ✓
│     ├─ Hash Continuity: ✓
│     ├─ PoW: ✓
│     └─ Cascade Impact: 5 classes, 175 students
│
├─ Class Chain Validation (Sample)
│  └─ CS-101
│     ├─ Blocks: 1 ✓
│     ├─ Parent Linkage: ✓ (linked to dept)
│     ├─ PoW: ✓
│     └─ Child Impact: 35 students
│
└─ Student Chain Validation (Sample)
   └─ John Doe
      ├─ Blocks: 8 (1 genesis + 7 attendance)
      ├─ Parent Linkage: ✓ (linked to class)
      ├─ Hash Continuity: ✓
      ├─ PoW: ✓ (all start with "0000")
      └─ Attendance: P=5, A=2, L=0
```

## 🔄 CRUD Operation Flow

### Create Department

```
Frontend
  │ POST /api/departments
  ├─ {name, description}
  │
  ↓
DepartmentController.create()
  │
  ↓
BlockchainService.createDepartment()
  │
  ├─ BlockchainManager.createDepartment()
  │  │
  │  ├─ DepartmentChain.initializeChain()
  │  │  │
  │  │  ├─ Block.mineBlock() [PoW mining]
  │  │  │  └─ Iterate nonce until hash = "0000..."
  │  │  │
  │  │  └─ Block added to chain
  │  │
  │  └─ Chain stored in memory
  │
  └─ DatabaseService.saveDepartment()
     └─ Write to departments.json
```

### Mark Attendance

```
Frontend
  │ POST /api/attendance
  ├─ {studentId, status, date}
  │
  ↓
AttendanceController.mark()
  │
  ↓
BlockchainService.markAttendance()
  │
  ├─ BlockchainManager.markAttendance()
  │  │
  │  ├─ StudentChain.markAttendance()
  │  │  │
  │  │  ├─ StudentChain.addBlock()
  │  │  │  │
  │  │  │  ├─ Block.mineBlock() [PoW mining]
  │  │  │  │  └─ Iterate nonce until hash = "0000..."
  │  │  │  │
  │  │  │  └─ Block added to student's chain
  │  │  │
  │  │  └─ Attendance count updated
  │  │
  │  └─ Block returned
  │
  ├─ DatabaseService.saveStudent()
  │  └─ Write updated chain to students.json
  │
  └─ Response with block details
```

### Update Department (Immutable Append)

```
Original Department Chain:
Block 0 (Genesis): School of Computing
  hash: 0000abc123

UPDATE REQUEST: Change name to "School of Computing & IT"

NEW APPEND:
Block 1 (Update):
  type: DEPARTMENT_UPDATE
  name_updated: "School of Computing & IT"
  prev_hash: 0000abc123
  hash: 0000def456

Result: Original block unchanged, history preserved
Query System: Uses latest block to determine current state
```

## 📊 State Management

### System State Architecture

```
BlockchainManager
  ├─ departments: {
  │   "dept-uuid": DepartmentChain {
  │     blocks: [Block0, Block1, ...]
  │     chainId: "dept-uuid"
  │     getCurrentState(): {...}
  │   }
  │  }
  │
  ├─ classes: {
  │   "class-uuid": ClassChain {
  │     blocks: [Block0, Block1, ...]
  │     chainId: "class-uuid"
  │     parentHash: "dept-hash"
  │     getCurrentState(): {...}
  │   }
  │  }
  │
  └─ students: {
      "student-uuid": StudentChain {
        blocks: [Block0, Block1, Block2, ...]
        chainId: "student-uuid"
        parentHash: "class-hash"
        attendanceCount: {present: 5, absent: 2, leave: 0}
        getCurrentState(): {...}
      }
     }
```

### State Persistence

```
Memory State ──(BlockchainService)──→ JSON Persistence
                                    ↓
                        departments.json
                          ├─ "dept-id": {
                          │    chainId: "..."
                          │    chainType: "department"
                          │    blocks: [...]
                          │    blockCount: 1
                          │  }
                          │
                        classes.json
                          ├─ "class-id": {
                          │    chainId: "..."
                          │    chainType: "class"
                          │    blocks: [...]
                          │    parentHash: "..."
                          │  }
                          │
                        students.json
                          └─ "student-id": {
                               chainId: "..."
                               chainType: "student"
                               blocks: [...]
                               parentHash: "..."
                             }
```

## 🛣️ API Call Flow

### Example: Get Student Attendance Ledger

```
1. Frontend Request
   GET /api/attendance/ledger/student-123

2. Express Router
   └─ routes/api.js
      └─ GET /attendance/ledger/:studentId

3. AttendanceController
   └─ getStudentLedger(req, res)
      └─ studentId = req.params.studentId

4. BlockchainService
   └─ getStudentCompleteLedger(studentId)
      │
      ├─ BlockchainManager.getStudent(studentId)
      │  └─ returns StudentChain instance
      │
      ├─ student.getCompleteLedger()
      │  └─ Transforms all blocks to response format
      │
      └─ Returns: {
           studentId, studentName, rollNumber,
           stats: {present, absent, leave, total},
           ledger: [
             {blockIndex, type, hash, prev_hash, nonce, ...},
             ...
           ]
         }

5. Express Response
   └─ res.json({
       success: true,
       data: ledger
      })

6. Axios in Frontend
   └─ response.data.data
      └─ Rendered in StudentLedger.js
         └─ Display table with blockchain data
```

## 🚀 Performance Considerations

### Block Mining Performance

```
Difficulty = 4 (requires hash starting with "0000")

Target Space: 16^4 = 65,536 possible valid hashes
Expected Iterations: ~65,536 / 2 = 32,768 average
Time per Block: 5-10 seconds

PoW Time = f(difficulty) exponentially
  difficulty=3 ("000"): ~0.5 seconds
  difficulty=4 ("0000"): ~5 seconds
  difficulty=5 ("00000"): ~80 seconds
  difficulty=6 ("000000"): ~20 minutes
```

### System Scalability

```
Current Implementation:
- 2 departments: 2 genesis blocks
- 10 classes: 10 genesis blocks
- 350 students: 350 genesis blocks
- 350 attendance records: 350 blocks (if all marked)
- TOTAL: 712+ blocks

Performance:
- Validation: < 1 second
- Storage: ~200 KB JSON
- Memory: ~50 MB

Scaling to 1000 students:
- Estimated blocks: 2000+
- Still manageable with JSON
- Recommended: Migrate to MongoDB for 10,000+

Mining Bottleneck:
- Each block takes 5-10 seconds to mine
- 350 students × average PoW = 30-60 minutes of CPU time
- Distributed mining not implemented (single process)
```

### Optimization Opportunities

```
1. Reduce PoW Difficulty
   - Current: 4 (0000 prefix)
   - Reduce to: 3 (000 prefix)
   - Result: ~10x faster mining

2. Database Migration
   - Current: JSON files
   - Target: MongoDB / PostgreSQL
   - Benefit: Faster querying, indexing

3. Batch Operations
   - Mine multiple blocks asynchronously
   - Use worker threads for PoW
   - Parallel validation

4. Caching
   - Cache validation results
   - Invalidate on chain updates
   - LRU cache for frequently accessed chains

5. Pagination
   - Limit block returns per query
   - Implement cursor-based pagination
   - Reduce response payload
```

## 🧪 Testing Strategy

### Unit Tests (Recommended)

```javascript
// Test Block Mining
test("Block mines with valid PoW", () => {
  const block = new Block(0, [{}], "0");
  block.mineBlock(4);
  expect(block.hash.startsWith("0000")).toBe(true);
});

// Test Chain Validation
test("Valid chain passes validation", () => {
  const chain = new DepartmentChain("id", "name");
  chain.addGenesisBlock({});
  const result = chain.validateChain();
  expect(result.isValid).toBe(true);
});

// Test Hierarchical Linkage
test("Class chain links to department", () => {
  const dept = new DepartmentChain("d1", "Dept");
  dept.addGenesisBlock({});

  const cls = new ClassChain("c1", "Class", "d1", dept.getLatestBlock().hash);
  cls.initializeChain({});

  expect(cls.verifyParentLinkage(dept.getLatestBlock().hash)).toBe(true);
});
```

### Integration Tests

```javascript
// Full workflow test
test("Department → Class → Student → Attendance", async () => {
  const manager = new BlockchainManager();

  // Create department
  const dept = manager.createDepartment("Test Dept");

  // Create class
  const cls = manager.createClass("Test Class", dept.chainId);

  // Add student
  const student = manager.addStudent("John", "001", cls.chainId);

  // Mark attendance
  manager.markAttendance(student.chainId, "Present");

  // Validate
  const validation = manager.validateSystem();
  expect(validation.isValid).toBe(true);
});
```

## 📋 Deployment Checklist

- [ ] Backend server builds without errors
- [ ] Frontend builds without errors
- [ ] All API endpoints respond correctly
- [ ] Database persistence works
- [ ] System initialization completes
- [ ] Blockchain validation passes
- [ ] CRUD operations functional
- [ ] Search functionality works
- [ ] Attendance marking works
- [ ] Ledger viewing works
- [ ] Explorer shows accurate data
- [ ] Frontend routes all work
- [ ] UI is responsive
- [ ] No console errors
- [ ] Backend logs are clean

---

**Document Version:** 1.0  
**Last Updated:** January 2024  
**Technical Level:** Advanced
