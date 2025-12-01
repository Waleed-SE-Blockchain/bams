# Viewing the Blockchain Structure in BAMS

## 📱 User Interface Guide

Your BAMS system provides multiple ways to view the real blockchain structure with all essential fields.

## 1. Student Attendance Ledger View

### Where to Access

- **Menu:** Navigate to **"Student Ledger"** page
- **URL:** `/ledger`

### What You'll See

#### Block Display Table

The main table shows all fields of each block:

| Column            | Shows                    | Example                               |
| ----------------- | ------------------------ | ------------------------------------- |
| **Index**         | Block number             | #0, #1, #2                            |
| **Timestamp**     | Creation time (ISO 8601) | 1/15/2024, 9:30:45 AM                 |
| **Transactions**  | Attendance type          | Genesis Block, Present, Absent, Leave |
| **Previous Hash** | Link to parent block     | 0000abc123...                         |
| **Nonce**         | Proof of Work value      | 67890, 45231, 123456                  |
| **Block Hash**    | SHA-256 hash of block    | 0000def789...                         |
| **PoW Status**    | Validation status        | ✓ Valid, ✗ Invalid                    |

#### Step-by-Step Guide

**Step 1: Select Student**

```
1. Open Student Ledger page
2. Click dropdown "-- Select Student --"
3. Choose a student (e.g., "John Doe (2-01-001)")
4. Click "View Ledger" button
```

**Step 2: View Complete Blockchain**

```
The system displays:
- Student name and roll number
- Attendance statistics (Present/Absent/Leave counts)
- Complete blockchain ledger table
- Blockchain information panel
```

**Step 3: Examine Block Details**

```
For each block, you can see:
- Block #0: Genesis block (first block)
- Block #1-N: Attendance records
- Each with all 6 essential fields
```

## 2. Blockchain Information Panel

Located below the ledger table, showing:

### Genesis Block Details

```
Genesis Block Hash (Initial Block):
0000abc123def456ghi789jkl012mnopqrs345tuv678wxyz

(Complete SHA-256 hash shown)
```

### Latest Block Details

```
Latest Block Hash (Current Chain Tip):
0000ghi345jkl678mno901pqr234stu567vwx890yz123abc

(Complete SHA-256 hash shown)
```

### Chain Statistics

```
Total Blocks in Chain: 8
- 1 Genesis block
- 7 Attendance records

Attendance Records: 7
Chain Status: ✓ Valid
```

### Blockchain Technology Info

- ✓ Hash Algorithm: SHA-256
- ✓ Proof of Work: Nonce-based mining (difficulty = 4)
- ✓ Chain Type: Hierarchical blockchain
- ✓ Immutability: Cryptographically linked
- ✓ Genesis Block: Links to parent chain
- ✓ Block Structure: Index | Timestamp | Transactions | Prev_Hash | Nonce | Hash

## 3. Block Field Explanations

### 1. Index

```
What: Block number in sequence
Where: First column "Index"
Example: #0 (genesis), #1 (first attendance), #2 (second attendance)
Why: Identifies block position in chain
```

### 2. Timestamp

```
What: Exact time block was created
Where: "Timestamp" column
Format: Date and time in your local timezone
Example: 1/15/2024, 9:30:45 AM
Purpose: Chronological audit trail
```

### 3. Transactions

```
What: Attendance records in this block
Where: "Transactions" column (with colored badges)
Types:
  - "Genesis Block" (blue) = Student initialization
  - "Present" (green) = Attendance marked
  - "Absent" (red) = Absence marked
  - "Leave" (yellow) = Leave marked
```

### 4. Previous Hash (Prev Hash)

```
What: SHA-256 hash of previous block
Where: "Previous Hash" column
Display: First 16 characters (full hash available on hover)
Example: 0000abc123...
Purpose: Creates cryptographic link to parent block
```

### 5. Nonce

```
What: Proof of Work parameter
Where: "Nonce" column
Example: 67890, 45231, 123456
Meaning: Number of iterations to find valid hash
Range: 0 to millions (depends on mining difficulty)
```

### 6. Block Hash

```
What: SHA-256 hash of entire block
Where: "Block Hash" column (last column)
Display: Complete 64-character hexadecimal
Example: 0000a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
Requirement: MUST start with "0000" (Proof of Work)
```

## 4. Understanding the Block Chain Links

### Visual Representation in UI

```
Genesis Block (Index #0)
├─ Timestamp: 1/15/2024, 9:30:45 AM
├─ Prev_Hash: "0" (first block)
├─ Hash: 0000abc123...
└─ Nonce: 67890
        ↓ (This hash becomes prev_hash of next block)

Attendance Block (Index #1)
├─ Timestamp: 1/15/2024, 9:35:22 AM
├─ Prev_Hash: 0000abc123... (linked to Block #0)
├─ Hash: 0000def789...
└─ Nonce: 45231
        ↓ (This hash becomes prev_hash of next block)

Attendance Block (Index #2)
├─ Timestamp: 1/16/2024, 9:30:15 AM
├─ Prev_Hash: 0000def789... (linked to Block #1)
├─ Hash: 0000ghi345...
└─ Nonce: 123456
```

### What This Means

- Each block's "Prev_Hash" field contains the "Hash" of the previous block
- This creates an **unbreakable chain**
- If you try to modify Block #1, its hash changes
- This breaks the link from Block #2 (which still points to old hash)
- System immediately detects tampering ✓

## 5. Real Blockchain Validation

### PoW Status Column Shows

**✓ Valid (Green)**

```
Meaning: Block hash starts with "0000"
Proof of Work requirement satisfied
Block is authentic
```

**✗ Invalid (Red)**

```
Meaning: Block hash does NOT start with "0000"
Proof of Work not satisfied
Block has been tampered with
```

## 6. Example: Complete Student Blockchain

### Scenario: John Doe (2-01-001)

```
┌────────────────────────────────────────────────────────────────┐
│ STUDENT LEDGER - John Doe                                     │
│ Roll Number: 2-01-001                                         │
│ Total Attendance Blocks: 3                                    │
│ Present: 2  |  Absent: 1  |  Leave: 0                        │
└────────────────────────────────────────────────────────────────┘

┌────┬──────────────────────┬──────────────┬──────────┬────────┬──────────┬─────────┐
│ #  │ Timestamp            │ Transaction  │Prev Hash │ Nonce  │Block Hash│PoW Stat │
├────┼──────────────────────┼──────────────┼──────────┼────────┼──────────┼─────────┤
│ #0 │1/15/2024, 9:30:45   │Genesis Block │    0     │ 67890  │0000abc...│ ✓ Valid │
│ #1 │1/15/2024, 9:35:22   │ Present      │0000abc...│ 45231  │0000def...│ ✓ Valid │
│ #2 │1/15/2024, 10:42:15  │ Present      │0000def...│ 12345  │0000ghi...│ ✓ Valid │
│ #3 │1/16/2024, 9:30:05   │ Absent       │0000ghi...│ 89012  │0000jkl...│ ✓ Valid │
└────┴──────────────────────┴──────────────┴──────────┴────────┴──────────┴─────────┘

BLOCKCHAIN INFORMATION PANEL:
├─ Total Blocks: 4
├─ Genesis Hash: 0000abc123def456ghi789...
├─ Latest Hash: 0000jkl456mno789pqr012...
└─ Status: ✓ Valid (All blocks valid, chain intact)
```

## 7. Checking for Tampering

If someone tries to modify a block:

### Before Tampering

```
Block #1: Hash = 0000def789...
Block #2: Prev_Hash = 0000def789... ✓ Matches
          Status = ✓ Valid
```

### After Tampering (Block #1 modified)

```
Block #1: Hash = 1111xyz999... (changed!)
Block #2: Prev_Hash = 0000def789... (still points to old hash)
          Status = ✗ Invalid (mismatch detected!)
```

**Result:** Tampering immediately detected! ✓

## 8. API Endpoint Reference

### Get Student Ledger

```
Endpoint: GET /api/attendance/ledger/:studentId
Response: Complete blockchain with all 6 fields
```

**Example Request:**

```
GET /api/attendance/ledger/s-abc123
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "studentId": "s-abc123",
    "studentName": "John Doe",
    "rollNumber": "2-01-001",
    "ledger": [
      {
        "blockIndex": 0,
        "timestamp": "2024-01-15T09:30:45.123Z",
        "type": "STUDENT_GENESIS",
        "prev_hash": "0",
        "nonce": 67890,
        "hash": "0000abc123...",
        "transactions": [...]
      },
      {
        "blockIndex": 1,
        "timestamp": "2024-01-15T09:35:22.456Z",
        "type": "ATTENDANCE_RECORD",
        "prev_hash": "0000abc123...",
        "nonce": 45231,
        "hash": "0000def789...",
        "transactions": [...]
      }
    ]
  }
}
```

## 9. Real Blockchain System Checklist

✅ **All Required Fields Present:**

- [x] Index - Block number
- [x] Timestamp - Creation time
- [x] Transactions - Attendance records
- [x] Previous Hash - Link to parent
- [x] Nonce - Proof of Work
- [x] Hash - SHA-256 of block

✅ **Real Blockchain Features:**

- [x] Immutable blocks (append-only)
- [x] Cryptographic linking (prev_hash)
- [x] Proof of Work (difficulty = 4)
- [x] Chain validation
- [x] Tamper detection
- [x] Complete audit trail

✅ **Hierarchical Structure:**

- [x] Department → Class → Student chains
- [x] Genesis blocks link to parent
- [x] Multi-level validation
- [x] Cascade impact analysis

## 10. How to Verify Blockchain Integrity

### Manual Verification Steps

1. **Open Student Ledger**

   - Navigate to Student Ledger page
   - Select any student

2. **Check Genesis Block**

   - Block #0 should have Prev_Hash = "0"
   - Hash should start with "0000"
   - PoW Status = ✓ Valid

3. **Verify Chain Links**

   ```
   For each block:
   - Note its Hash value
   - Check next block's Prev_Hash
   - They should match exactly
   ```

4. **Confirm All Hashes Valid**

   - All Block Hashes should start with "0000"
   - All PoW Status should show ✓ Valid
   - No ✗ Invalid status should appear

5. **Check Complete Chain**
   - Total Blocks shown at bottom
   - Genesis Hash should match Block #0 Hash
   - Latest Hash should match last block Hash

---

**UI Version:** 1.0  
**Blockchain Implementation:** Real Blockchain ✓  
**All Fields Present:** Yes ✓  
**Tamper Detection:** Enabled ✓
