import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [classFilter, setClassFilter] = useState("all");
  const [classes, setClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("Present");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classRes, studentRes] = await Promise.all([
        apiService.classes.getAll(),
        apiService.students.getAll(),
      ]);
      if (classRes.data.success) setClasses(classRes.data.data);
      if (studentRes.data.success) setStudents(studentRes.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      const response = await apiService.attendance.mark({
        studentId: selectedStudent,
        status: attendanceStatus,
        date: selectedDate + "T" + new Date().toTimeString().split(" ")[0],
      });
      if (response.data.success) {
        alert(`Attendance marked as ${attendanceStatus}`);
        setSelectedStudent("");
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Error marking attendance");
    }
  };

  const filteredStudents =
    classFilter === "all"
      ? students
      : students.filter((s) => s.classId === classFilter);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [classFilter]);

  return (
    <div className="container">
      <h2>Mark Attendance</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Filter by Class</label>
          <select
            className="form-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">-- All Classes --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Student</label>
          <select
            className="form-select"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Select Student --</option>
            {filteredStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentName} ({student.rollNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={attendanceStatus}
            onChange={(e) => setAttendanceStatus(e.target.value)}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
      </div>

      <button
        className="btn btn-success"
        onClick={handleMarkAttendance}
        style={{ marginBottom: "2rem" }}
      >
        Mark Attendance
      </button>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div>
            <h3>Students in Selected Filter ({filteredStudents.length})</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Leave</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.studentName}</strong>
                    </td>
                    <td>{student.rollNumber}</td>
                    <td>{student.className}</td>
                    <td>
                      <span className="badge badge-success">
                        {student.stats?.present || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-danger">
                        {student.stats?.absent || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        {student.stats?.leave || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <button
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Attendance;
