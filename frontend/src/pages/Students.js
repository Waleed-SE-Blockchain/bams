import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    classId: "",
    email: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [editingId, setEditingId] = useState(null);

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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.classId) {
      alert("Please select a class");
      return;
    }
    if (!formData.rollNumber.trim()) {
      alert("Roll number is required and must be unique across the school");
      return;
    }
    try {
      const response = await apiService.students.add(formData);
      if (response.data.success) {
        alert("Student added successfully");
        setFormData({ name: "", rollNumber: "", classId: "", email: "" });
        setShowForm(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error("Error adding student:", err);
      const errorMsg = err.response?.data?.error || "Error adding student";
      alert(errorMsg);
    }
  };

  const handleRemoveStudent = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will mark the student as removed in the blockchain."
      )
    ) {
      try {
        await apiService.students.remove(id);
        alert("Student marked as removed");
        fetchInitialData();
      } catch (err) {
        console.error("Error removing student:", err);
        alert("Error removing student");
      }
    }
  };

  const handleUpdateStudent = async (e, id) => {
    e.preventDefault();
    try {
      const response = await apiService.students.update(id, formData);
      if (response.data.success) {
        alert("Student updated successfully");
        setFormData({ name: "", rollNumber: "", classId: "", email: "" });
        setEditingId(null);
        setShowForm(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error("Error updating student:", err);
      alert(
        "Error updating student: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const startEdit = (student) => {
    setFormData({
      name: student.studentName,
      rollNumber: student.rollNumber,
      classId: student.classId,
      email: student.email || "",
    });
    setEditingId(student.studentId);
    setShowForm(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInitialData();
      setCurrentPage(1);
      return;
    }
    try {
      const response = await apiService.students.search(searchQuery);
      if (response.data.success) {
        setStudents(response.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error searching students:", err);
      alert("Error searching students");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2>Students</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", rollNumber: "", classId: "", email: "" });
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "Add Student"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form
          onSubmit={
            editingId
              ? (e) => handleUpdateStudent(e, editingId)
              : handleAddStudent
          }
          style={{
            marginBottom: "2rem",
            background: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "0.5rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Select Class *</label>
            <select
              className="form-select"
              required
              value={formData.classId}
              onChange={(e) =>
                setFormData({ ...formData, classId: e.target.value })
              }
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Student Name *</label>
            <input
              className="form-input"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="E.g., John Doe"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Roll Number *</label>
            <input
              className="form-input"
              type="text"
              required
              value={formData.rollNumber}
              onChange={(e) =>
                setFormData({ ...formData, rollNumber: e.target.value })
              }
              placeholder="E.g., 001"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="E.g., student@school.edu"
            />
          </div>
          <button type="submit" className="btn btn-success">
            {editingId ? "Update Student" : "Add Student"}
          </button>
        </form>
      )}

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <input
          className="form-input"
          type="text"
          placeholder="Search by name or roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-secondary" onClick={handleSearch}>
          Search
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setSearchQuery("");
            fetchInitialData();
          }}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="alert alert-info">No students found</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Class</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Actions</th>
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
                  <td>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() =>
                        (window.location.href = `/ledger?id=${student.id}`)
                      }
                    >
                      View Ledger
                    </button>
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => startEdit(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleRemoveStudent(student.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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

export default Students;
