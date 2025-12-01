import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
    section: "",
    capacity: 35,
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
      const [deptRes, classRes] = await Promise.all([
        apiService.departments.getAll(),
        apiService.classes.getAll(),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (classRes.data.success) setClasses(classRes.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
      alert("Please select a department");
      return;
    }
    try {
      const response = await apiService.classes.create(formData);
      if (response.data.success) {
        alert("Class created successfully");
        setFormData({ name: "", departmentId: "", section: "", capacity: 35 });
        setShowForm(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Error creating class");
    }
  };

  const handleDeleteClass = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will mark the class as deleted in the blockchain."
      )
    ) {
      try {
        await apiService.classes.delete(id);
        alert("Class marked as deleted");
        fetchInitialData();
      } catch (err) {
        console.error("Error deleting class:", err);
        alert("Error deleting class");
      }
    }
  };

  const handleUpdateClass = async (e, id) => {
    e.preventDefault();
    try {
      const response = await apiService.classes.update(id, formData);
      if (response.data.success) {
        alert("Class updated successfully");
        setFormData({ name: "", departmentId: "", section: "", capacity: 35 });
        setEditingId(null);
        setShowForm(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error("Error updating class:", err);
      alert("Error updating class");
    }
  };

  const startEdit = (cls) => {
    setFormData({
      name: cls.className,
      departmentId: cls.departmentId,
      section: cls.section || "",
      capacity: cls.capacity || 35,
    });
    setEditingId(cls.classId);
    setShowForm(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInitialData();
      setCurrentPage(1);
      return;
    }
    try {
      const response = await apiService.classes.search(searchQuery);
      if (response.data.success) {
        setClasses(response.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error searching classes:", err);
      alert("Error searching classes");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = classes.slice(startIndex, endIndex);

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
        <h2>Classes</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              departmentId: "",
              section: "",
              capacity: 35,
            });
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "Add Class"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form
          onSubmit={
            editingId
              ? (e) => handleUpdateClass(e, editingId)
              : handleCreateClass
          }
          style={{
            marginBottom: "2rem",
            background: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "0.5rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Select Department *</label>
            <select
              className="form-select"
              required
              value={formData.departmentId}
              onChange={(e) =>
                setFormData({ ...formData, departmentId: e.target.value })
              }
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Class Name *</label>
            <input
              className="form-input"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="E.g., Class A"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section</label>
            <input
              className="form-input"
              type="text"
              value={formData.section}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value })
              }
              placeholder="E.g., Section 1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Capacity</label>
            <input
              className="form-input"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              placeholder="35"
            />
          </div>
          <button type="submit" className="btn btn-success">
            {editingId ? "Update Class" : "Create Class"}
          </button>
        </form>
      )}

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <input
          className="form-input"
          type="text"
          placeholder="Search classes..."
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
      ) : classes.length === 0 ? (
        <div className="alert alert-info">No classes found</div>
      ) : (
        <>
          <div className="grid">
            {currentClasses.map((cls) => (
              <div key={cls.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{cls.className}</h3>
                  <span className="card-badge">{cls.status}</span>
                </div>
                <div className="card-content">
                  <p>
                    <strong>Department:</strong> {cls.departmentName}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {cls.capacity || 35} students
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(cls.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="btn-group" style={{ marginTop: "1rem" }}>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() =>
                      (window.location.href = `/explorer?cls=${cls.classId}`)
                    }
                  >
                    View Chain
                  </button>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => startEdit(cls)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteClass(cls.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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

export default Classes;
