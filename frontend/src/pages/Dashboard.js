import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await apiService.explorer.getStatistics();
      if (response.data.success) {
        setStats(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : stats ? (
        <div className="grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Departments</h3>
            </div>
            <div className="card-content">
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#1e40af",
                }}
              >
                {stats.departments}
              </div>
              <p style={{ marginTop: "0.5rem", color: "#666" }}>
                Total Departments
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Classes</h3>
            </div>
            <div className="card-content">
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#0ea5e9",
                }}
              >
                {stats.classes}
              </div>
              <p style={{ marginTop: "0.5rem", color: "#666" }}>
                Total Classes
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Students</h3>
            </div>
            <div className="card-content">
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {stats.students}
              </div>
              <p style={{ marginTop: "0.5rem", color: "#666" }}>
                Total Students
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Blockchain Blocks</h3>
            </div>
            <div className="card-content">
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#f59e0b",
                }}
              >
                {stats.totalBlocks}
              </div>
              <p style={{ marginTop: "0.5rem", color: "#666" }}>Total Blocks</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Attendance Records</h3>
            </div>
            <div className="card-content">
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#06b6d4",
                }}
              >
                {stats.attendanceRecords}
              </div>
              <p style={{ marginTop: "0.5rem", color: "#666" }}>
                Total Records
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Last Updated</h3>
            </div>
            <div className="card-content">
              <p>{new Date(stats.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="container"
        style={{ marginTop: "2rem", backgroundColor: "#f9fafb" }}
      >
        <h3>System Overview</h3>
        <p>
          This is a Blockchain-Based Attendance Management System (BAMS) with
          three hierarchical blockchain layers:
        </p>
        <ul style={{ marginTop: "1rem", marginLeft: "2rem" }}>
          <li>
            <strong>Layer 1:</strong> Department Blockchain - Each department
            has its own independent chain
          </li>
          <li>
            <strong>Layer 2:</strong> Class Blockchain - Each class chain is
            linked to its parent department
          </li>
          <li>
            <strong>Layer 3:</strong> Student Blockchain - Each student chain is
            linked to their class
          </li>
        </ul>
        <p style={{ marginTop: "1rem" }}>
          Attendance records are stored as blocks in the student's personal
          blockchain, maintaining a complete immutable history of all attendance
          events.
        </p>
      </div>

      <button
        onClick={fetchStatistics}
        className="btn btn-secondary"
        style={{ marginTop: "1rem" }}
      >
        Refresh Statistics
      </button>
    </div>
  );
}

export default Dashboard;
