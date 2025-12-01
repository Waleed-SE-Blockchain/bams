import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

function Explorer() {
  const [tab, setTab] = useState("overview");
  const [validation, setValidation] = useState(null);
  const [report, setReport] = useState(null);
  const [systemState, setSystemState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Blockchain view state
  const [blockchainData, setBlockchainData] = useState(null);
  const [expandedChains, setExpandedChains] = useState({});

  // Pagination state
  const [departmentPage, setDepartmentPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchValidation = async () => {
    setLoading(true);
    try {
      const response = await apiService.explorer.validateSystem();
      if (response.data.success) {
        setValidation(response.data.data);
        setTab("validation");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch validation");
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await apiService.explorer.getValidationReport();
      if (response.data.success) {
        setReport(response.data.data);
        setTab("report");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemState = async () => {
    setLoading(true);
    try {
      const response = await apiService.explorer.getSystemState();
      if (response.data.success) {
        setSystemState(response.data.data);
        setBlockchainData(response.data.data);
        setTab("overview");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch system state");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchainView = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.explorer.exportSystem();
      if (response.data.success) {
        setBlockchainData(response.data.data);
        setTab("blockchain");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(`Failed to fetch blockchain data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemState();
  }, []);

  const toggleChainExpansion = (chainId) => {
    setExpandedChains((prev) => ({
      ...prev,
      [chainId]: !prev[chainId],
    }));
  };

  // Pagination helpers
  const paginateArray = (arr, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return arr.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (length) => Math.ceil(length / itemsPerPage);

  return (
    <div className="container">
      <h2>Blockchain Explorer</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`btn ${
            tab === "overview" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={fetchSystemState}
        >
          System Overview
        </button>
        <button
          className={`btn ${
            tab === "blockchain" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={fetchBlockchainView}
        >
          Blockchain View
        </button>
        <button
          className={`btn ${
            tab === "validation" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={fetchValidation}
        >
          Validate System
        </button>
        <button
          className={`btn ${
            tab === "report" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={fetchReport}
        >
          Validation Report
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {tab === "overview" && systemState && (
        <div>
          <h3>System Overview</h3>
          <div className="grid" style={{ marginBottom: "2rem" }}>
            <div className="card">
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#1e40af",
                }}
              >
                {systemState.departments.length}
              </div>
              <p style={{ color: "#666" }}>Departments</p>
            </div>
            <div className="card">
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#0ea5e9",
                }}
              >
                {systemState.classes.length}
              </div>
              <p style={{ color: "#666" }}>Classes</p>
            </div>
            <div className="card">
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {systemState.students.length}
              </div>
              <p style={{ color: "#666" }}>Students</p>
            </div>
          </div>

          <h4 style={{ marginBottom: "1rem" }}>
            Departments ({systemState.departments.length})
          </h4>
          <table className="table" style={{ marginBottom: "2rem" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Blocks</th>
              </tr>
            </thead>
            <tbody>
              {paginateArray(systemState.departments, departmentPage).map(
                (dept) => (
                  <tr key={dept.id}>
                    <td>
                      <strong>{dept.state.departmentName}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          dept.state.status === "active"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {dept.state.status}
                      </span>
                    </td>
                    <td>{dept.blockCount}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Department Pagination */}
          {getTotalPages(systemState.departments.length) > 1 && (
            <div
              style={{
                marginBottom: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <button
                className="btn btn-secondary"
                disabled={departmentPage === 1}
                onClick={() =>
                  setDepartmentPage((prev) => Math.max(1, prev - 1))
                }
              >
                ← Previous
              </button>
              <span
                style={{
                  padding: "0.5rem 1rem",
                  background: "#f3f4f6",
                  borderRadius: "0.375rem",
                  minWidth: "120px",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Page {departmentPage} of{" "}
                {getTotalPages(systemState.departments.length)}
              </span>
              <button
                className="btn btn-secondary"
                disabled={
                  departmentPage >=
                  getTotalPages(systemState.departments.length)
                }
                onClick={() => setDepartmentPage((prev) => prev + 1)}
              >
                Next →
              </button>
            </div>
          )}

          <h4 style={{ marginBottom: "1rem" }}>
            Classes ({systemState.classes.length})
          </h4>
          <table className="table" style={{ marginBottom: "2rem" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Blocks</th>
              </tr>
            </thead>
            <tbody>
              {paginateArray(systemState.classes, classPage).map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <strong>{cls.state.className}</strong>
                  </td>
                  <td>{cls.state.departmentName}</td>
                  <td>
                    <span
                      className={`badge ${
                        cls.state.status === "active"
                          ? "badge-success"
                          : "badge-danger"
                      }`}
                    >
                      {cls.state.status}
                    </span>
                  </td>
                  <td>{cls.blockCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Class Pagination */}
          {getTotalPages(systemState.classes.length) > 1 && (
            <div
              style={{
                marginBottom: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <button
                className="btn btn-secondary"
                disabled={classPage === 1}
                onClick={() => setClassPage((prev) => Math.max(1, prev - 1))}
              >
                ← Previous
              </button>
              <span
                style={{
                  padding: "0.5rem 1rem",
                  background: "#f3f4f6",
                  borderRadius: "0.375rem",
                  minWidth: "120px",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Page {classPage} of {getTotalPages(systemState.classes.length)}
              </span>
              <button
                className="btn btn-secondary"
                disabled={
                  classPage >= getTotalPages(systemState.classes.length)
                }
                onClick={() => setClassPage((prev) => prev + 1)}
              >
                Next →
              </button>
            </div>
          )}

          <h4 style={{ marginBottom: "1rem" }}>
            Students ({systemState.students.length})
          </h4>
          <table className="table" style={{ marginBottom: "2rem" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Status</th>
                <th>Attendance Records</th>
              </tr>
            </thead>
            <tbody>
              {paginateArray(systemState.students, studentPage).map(
                (student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.state.studentName}</strong>
                    </td>
                    <td>{student.state.className}</td>
                    <td>
                      <span
                        className={`badge ${
                          student.state.status === "active"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {student.state.status}
                      </span>
                    </td>
                    <td>{student.stats.total}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Student Pagination */}
          {getTotalPages(systemState.students.length) > 1 && (
            <div
              style={{
                marginBottom: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <button
                className="btn btn-secondary"
                disabled={studentPage === 1}
                onClick={() => setStudentPage((prev) => Math.max(1, prev - 1))}
              >
                ← Previous
              </button>
              <span
                style={{
                  padding: "0.5rem 1rem",
                  background: "#f3f4f6",
                  borderRadius: "0.375rem",
                  minWidth: "120px",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Page {studentPage} of{" "}
                {getTotalPages(systemState.students.length)}
              </span>
              <button
                className="btn btn-secondary"
                disabled={
                  studentPage >= getTotalPages(systemState.students.length)
                }
                onClick={() => setStudentPage((prev) => prev + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "blockchain" && blockchainData && (
        <div>
          <h3>Blockchain Structure View</h3>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Full blockchain hierarchy showing all blocks, hashes, and
            connections
          </p>

          {/* Departments with their connections */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ marginBottom: "1rem", color: "#1e40af" }}>
              📊 Department Chains ({blockchainData.departments?.length || 0})
            </h4>
            {blockchainData.departments?.map((deptObj) => (
              <div
                key={deptObj.id}
                style={{
                  marginBottom: "1.5rem",
                  border: "2px solid #1e40af",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#1e40af",
                    color: "white",
                    padding: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => toggleChainExpansion(`dept-${deptObj.id}`)}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {expandedChains[`dept-${deptObj.id}`] ? "▼" : "▶"}{" "}
                    {deptObj.chain.departmentName}
                  </span>
                  <span style={{ fontSize: "0.875rem" }}>
                    {deptObj.chain.blocks.length} blocks
                  </span>
                </div>

                {expandedChains[`dept-${deptObj.id}`] && (
                  <div style={{ padding: "1rem", background: "#f9fafb" }}>
                    {deptObj.chain.blocks.map((block, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: "1rem",
                          padding: "0.75rem",
                          background: "white",
                          border: "1px solid #ddd",
                          borderRadius: "0.375rem",
                          fontFamily: "monospace",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <div style={{ fontWeight: "bold", color: "#1e40af" }}>
                          Block #{block.index} ({block.transactions[0]?.type})
                        </div>
                        <div style={{ color: "#666", marginTop: "0.5rem" }}>
                          <div>
                            <strong>Hash:</strong>{" "}
                            <code
                              style={{
                                background: "#f3f4f6",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                              }}
                            >
                              {block.hash.substring(0, 16)}...
                            </code>
                          </div>
                          <div>
                            <strong>Prev:</strong>{" "}
                            <code
                              style={{
                                background: "#f3f4f6",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                              }}
                            >
                              {block.prev_hash.substring(0, 16)}...
                            </code>
                          </div>
                          <div>
                            <strong>Nonce:</strong> {block.nonce}
                          </div>
                          <div>
                            <strong>Timestamp:</strong> {block.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show connected classes */}
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "#eff6ff",
                        borderRadius: "0.375rem",
                        borderLeft: "4px solid #0ea5e9",
                      }}
                    >
                      <h5 style={{ color: "#0ea5e9", marginBottom: "0.5rem" }}>
                        Connected Classes (
                        {blockchainData.classes?.filter(
                          (c) => c.chain.departmentId === deptObj.id
                        ).length || 0}
                        )
                      </h5>
                      {blockchainData.classes
                        ?.filter((c) => c.chain.departmentId === deptObj.id)
                        .map((classObj) => (
                          <div
                            key={classObj.id}
                            style={{
                              padding: "0.5rem",
                              marginTop: "0.5rem",
                              background: "white",
                              borderRadius: "0.25rem",
                              borderLeft: "3px solid #0ea5e9",
                            }}
                          >
                            <div
                              style={{ fontWeight: "500", color: "#0ea5e9" }}
                            >
                              → {classObj.chain.className}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>
                              Genesis prev_hash:{" "}
                              <code>
                                {classObj.chain.blocks[0].prev_hash.substring(
                                  0,
                                  12
                                )}
                                ...
                              </code>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Classes with their connections */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ marginBottom: "1rem", color: "#0ea5e9" }}>
              📚 Class Chains ({blockchainData.classes?.length || 0})
            </h4>
            {blockchainData.classes?.map((classObj) => (
              <div
                key={classObj.id}
                style={{
                  marginBottom: "1.5rem",
                  border: "2px solid #0ea5e9",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#0ea5e9",
                    color: "white",
                    padding: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => toggleChainExpansion(`class-${classObj.id}`)}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {expandedChains[`class-${classObj.id}`] ? "▼" : "▶"}{" "}
                    {classObj.chain.className}
                  </span>
                  <span style={{ fontSize: "0.875rem" }}>
                    {classObj.chain.blocks.length} blocks
                  </span>
                </div>

                {expandedChains[`class-${classObj.id}`] && (
                  <div style={{ padding: "1rem", background: "#f9fafb" }}>
                    {classObj.chain.blocks.map((block, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: "1rem",
                          padding: "0.75rem",
                          background: "white",
                          border: "1px solid #ddd",
                          borderRadius: "0.375rem",
                          fontFamily: "monospace",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <div style={{ fontWeight: "bold", color: "#0ea5e9" }}>
                          Block #{block.index} ({block.transactions[0]?.type})
                        </div>
                        <div style={{ color: "#666", marginTop: "0.5rem" }}>
                          <div>
                            <strong>Hash:</strong>{" "}
                            <code
                              style={{
                                background: "#f3f4f6",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                              }}
                            >
                              {block.hash.substring(0, 16)}...
                            </code>
                          </div>
                          <div>
                            <strong>Prev:</strong>{" "}
                            <code
                              style={{
                                background: "#f3f4f6",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                              }}
                            >
                              {block.prev_hash.substring(0, 16)}...
                            </code>
                          </div>
                          <div>
                            <strong>Nonce:</strong> {block.nonce}
                          </div>
                          <div>
                            <strong>Timestamp:</strong> {block.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show connected students */}
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "#f0fdf4",
                        borderRadius: "0.375rem",
                        borderLeft: "4px solid #10b981",
                      }}
                    >
                      <h5 style={{ color: "#10b981", marginBottom: "0.5rem" }}>
                        Connected Students (
                        {blockchainData.students?.filter(
                          (s) => s.chain.classId === classObj.id
                        ).length || 0}
                        )
                      </h5>
                      {blockchainData.students
                        ?.filter((s) => s.chain.classId === classObj.id)
                        .slice(0, 5)
                        .map((studentObj) => (
                          <div
                            key={studentObj.id}
                            style={{
                              padding: "0.5rem",
                              marginTop: "0.5rem",
                              background: "white",
                              borderRadius: "0.25rem",
                              borderLeft: "3px solid #10b981",
                            }}
                          >
                            <div
                              style={{ fontWeight: "500", color: "#10b981" }}
                            >
                              → {studentObj.chain.studentName} (
                              {studentObj.chain.rollNumber})
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>
                              Genesis prev_hash:{" "}
                              <code>
                                {studentObj.chain.blocks[0].prev_hash.substring(
                                  0,
                                  12
                                )}
                                ...
                              </code>
                            </div>
                          </div>
                        ))}
                      {(blockchainData.students?.filter(
                        (s) => s.chain.classId === classObj.id
                      ).length || 0) > 5 && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#666",
                            marginTop: "0.5rem",
                          }}
                        >
                          +
                          {(blockchainData.students?.filter(
                            (s) => s.chain.classId === classObj.id
                          ).length || 0) - 5}{" "}
                          more students
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Students */}
          <div>
            <h4 style={{ marginBottom: "1rem", color: "#10b981" }}>
              👥 Student Chains ({blockchainData.students?.length || 0})
            </h4>
            <p
              style={{
                color: "#666",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              Showing first 10 students (expand to view all blocks)
            </p>
            {blockchainData.students?.slice(0, 10).map((studentObj) => (
              <div
                key={studentObj.id}
                style={{
                  marginBottom: "1rem",
                  border: "2px solid #10b981",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#10b981",
                    color: "white",
                    padding: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() =>
                    toggleChainExpansion(`student-${studentObj.id}`)
                  }
                >
                  <span style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    {expandedChains[`student-${studentObj.id}`] ? "▼" : "▶"}{" "}
                    {studentObj.chain.studentName}
                  </span>
                  <span style={{ fontSize: "0.75rem" }}>
                    {studentObj.chain.blocks.length} blocks
                  </span>
                </div>

                {expandedChains[`student-${studentObj.id}`] && (
                  <div style={{ padding: "0.75rem", background: "#f9fafb" }}>
                    {studentObj.chain.blocks.map((block, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: "0.5rem",
                          padding: "0.5rem",
                          background: "white",
                          border: "1px solid #ddd",
                          borderRadius: "0.25rem",
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div style={{ fontWeight: "bold", color: "#10b981" }}>
                          #{block.index} {block.transactions[0]?.type}
                        </div>
                        <div style={{ color: "#666", fontSize: "0.7rem" }}>
                          Hash: {block.hash.substring(0, 12)}... | Prev:{" "}
                          {block.prev_hash.substring(0, 12)}... | Nonce:{" "}
                          {block.nonce}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(blockchainData.students?.length || 0) > 10 && (
              <div
                style={{
                  padding: "1rem",
                  background: "#f9fafb",
                  borderRadius: "0.375rem",
                  textAlign: "center",
                  color: "#666",
                  fontSize: "0.875rem",
                }}
              >
                +{(blockchainData.students?.length || 0) - 10} more students not
                shown
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "validation" && validation && (
        <div>
          <h3>System Validation Results</h3>
          <div
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              background: validation.isValid ? "#d1fae5" : "#fee2e2",
              borderRadius: "0.5rem",
            }}
          >
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: validation.isValid ? "#065f46" : "#991b1b",
              }}
            >
              {validation.isValid ? "✓ System is Valid" : "✗ System has Errors"}
            </p>
          </div>

          <h4 style={{ marginBottom: "1rem" }}>
            Departments ({validation.departments.length})
          </h4>
          {validation.departments.map((dept) => (
            <div
              key={dept.chainId}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
              }}
            >
              <p>
                <strong>{dept.chainName}</strong> -{" "}
                {dept.isValid ? "✓ Valid" : "✗ Invalid"}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#666" }}>
                Blocks: {dept.blockCount}
              </p>
            </div>
          ))}

          <h4 style={{ marginBottom: "1rem" }}>
            Classes ({validation.classes.length})
          </h4>
          {validation.classes.slice(0, 5).map((cls) => (
            <div
              key={cls.chainId}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
              }}
            >
              <p>
                <strong>{cls.chainName}</strong> -{" "}
                {cls.isValid ? "✓ Valid" : "✗ Invalid"}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#666" }}>
                Parent Linkage: {cls.parentLinkageValid ? "✓" : "✗"} | Blocks:{" "}
                {cls.blockCount}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "report" && report && (
        <div
          style={{
            padding: "1.5rem",
            background: "#f9fafb",
            borderRadius: "0.5rem",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            overflow: "auto",
            maxHeight: "600px",
          }}
        >
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {report}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Explorer;
