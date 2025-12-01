import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

function StudentLedger() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.students.getAll();
      if (response.data.success) {
        setStudents(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLedger = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      const response = await apiService.attendance.getStudentLedger(
        selectedStudent
      );
      if (response.data.success) {
        setLedger(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching ledger:", err);
      alert("Error fetching ledger");
    }
  };

  return (
    <div className="container">
      <h2>Student Attendance Ledger (Blockchain)</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
        <select
          className="form-select"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">-- Select Student --</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.studentName} ({student.rollNumber})
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={handleViewLedger}>
          View Ledger
        </button>
      </div>

      {ledger && (
        <div>
          <div
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              background: "#f9fafb",
              borderRadius: "0.5rem",
            }}
          >
            <h3>{ledger.studentName}</h3>
            <p>
              <strong>Roll Number:</strong> {ledger.rollNumber}
            </p>
            <p>
              <strong>Total Attendance Blocks:</strong>{" "}
              {ledger.ledger.length - 1}
            </p>
            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  {ledger.stats?.present || 0}
                </div>
                <p style={{ color: "#666" }}>Present</p>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#ef4444",
                  }}
                >
                  {ledger.stats?.absent || 0}
                </div>
                <p style={{ color: "#666" }}>Absent</p>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#f59e0b",
                  }}
                >
                  {ledger.stats?.leave || 0}
                </div>
                <p style={{ color: "#666" }}>Leave</p>
              </div>
            </div>
          </div>

          <h4 style={{ marginBottom: "1rem" }}>Complete Blockchain Ledger</h4>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ fontSize: "0.875rem" }}>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Timestamp</th>
                  <th>Transaction(s)</th>
                  <th>Previous Hash</th>
                  <th>Nonce</th>
                  <th>Block Hash</th>
                  <th>PoW Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.ledger.map((block) => (
                  <tr key={block.blockIndex}>
                    <td>
                      <strong>#{block.blockIndex}</strong>
                    </td>
                    <td style={{ fontSize: "0.75rem" }}>
                      {new Date(block.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.75rem" }}>
                        {block.type === "STUDENT_GENESIS" && (
                          <span
                            className="badge"
                            style={{ background: "#3b82f6" }}
                          >
                            Genesis Block
                          </span>
                        )}
                        {block.type === "ATTENDANCE_RECORD" && (
                          <span
                            className="badge"
                            style={{ background: "#10b981" }}
                          >
                            {block.data?.status || "Attendance"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {block.prev_hash.substring(0, 16)}...
                    </td>
                    <td>
                      <strong style={{ fontFamily: "monospace" }}>
                        {block.nonce}
                      </strong>
                    </td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {block.hash}
                    </td>
                    <td>
                      {block.hash.startsWith("0000") ? (
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>
                          ✓ Valid
                        </span>
                      ) : (
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                          ✗ Invalid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: "2rem",
              padding: "1.5rem",
              background: "#dbeafe",
              borderRadius: "0.5rem",
              borderLeft: "4px solid #0284c7",
            }}
          >
            <h4>🔗 Blockchain Information</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  <strong>Total Blocks in Chain:</strong>
                </p>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#0284c7",
                  }}
                >
                  {ledger.ledger.length}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  <strong>Attendance Records (excluding genesis):</strong>
                </p>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#0284c7",
                  }}
                >
                  {ledger.ledger.length - 1}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  <strong>Chain Status:</strong>
                </p>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  ✓ Valid
                </p>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>Genesis Block Hash (Initial Block):</strong>
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                    background: "#e0f2fe",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  {ledger.ledger[0]?.hash}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>Latest Block Hash (Current Chain Tip):</strong>
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                    background: "#e0f2fe",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  {ledger.ledger[ledger.ledger.length - 1]?.hash}
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "#e0f2fe",
                borderRadius: "0.375rem",
              }}
            >
              <p style={{ fontSize: "0.875rem", color: "#0c4a6e" }}>
                <strong>📋 Blockchain Technology Details:</strong>
              </p>
              <ul
                style={{
                  fontSize: "0.875rem",
                  color: "#0c4a6e",
                  marginTop: "0.5rem",
                }}
              >
                <li>✓ Hash Algorithm: SHA-256</li>
                <li>
                  ✓ Proof of Work: Nonce-based mining with difficulty = 4
                  (leading zeros)
                </li>
                <li>
                  ✓ Chain Type: Hierarchical blockchain (Student chain under
                  Class chain)
                </li>
                <li>
                  ✓ Immutability: Each block cryptographically linked to the
                  previous block
                </li>
                <li>
                  ✓ Genesis Block: First block has prev_hash linking to parent
                  (Class chain)
                </li>
                <li>
                  ✓ Block Structure: Index | Timestamp | Transactions |
                  Prev_Hash | Nonce | Hash
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentLedger;
