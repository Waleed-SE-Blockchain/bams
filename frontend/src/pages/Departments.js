import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.departments.getAll();
      if (response.data.success) {
        setDepartments(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.departments.create({
        name: formData.name,
        description: formData.description,
      });
      if (response.data.success) {
        alert("Department created successfully");
        setFormData({ name: "", description: "" });
        setShowForm(false);
        fetchDepartments();
      }
    } catch (err) {
      console.error("Error creating department:", err);
      alert("Error creating department");
    }
  };

  const handleUpdateDepartment = async (e, id) => {
    e.preventDefault();
    try {
      const response = await apiService.departments.update(id, {
        name: formData.name,
        description: formData.description,
      });
      if (response.data.success) {
        alert("Department updated successfully");
        setFormData({ name: "", description: "" });
        setEditingId(null);
        fetchDepartments();
      }
    } catch (err) {
      console.error("Error updating department:", err);
      alert("Error updating department");
    }
  };

  const startEdit = (dept) => {
    setFormData({
      name: dept.departmentName,
      description: dept.description || "",
    });
    setEditingId(dept.departmentId);
    setShowForm(true);
  };

  const handleDeleteDepartment = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will mark the department as deleted in the blockchain."
      )
    ) {
      try {
        await apiService.departments.delete(id);
        alert("Department marked as deleted");
        fetchDepartments();
      } catch (err) {
        console.error("Error deleting department:", err);
        alert("Error deleting department");
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDepartments();
      setCurrentPage(1);
      return;
    }
    try {
      const response = await apiService.departments.search(searchQuery);
      if (response.data.success) {
        setDepartments(response.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error searching departments:", err);
      alert("Error searching departments");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = departments.slice(startIndex, endIndex);

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
        <h2>Departments</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "" });
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "Add Department"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form
          onSubmit={
            editingId
              ? (e) => handleUpdateDepartment(e, editingId)
              : handleCreateDepartment
          }
          style={{
            marginBottom: "2rem",
            background: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "0.5rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              className="form-input"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="E.g., School of Computing"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Department description"
            />
          </div>
          <button type="submit" className="btn btn-success">
            {editingId ? "Update Department" : "Create Department"}
          </button>
        </form>
      )}

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <input
          className="form-input"
          type="text"
          placeholder="Search departments..."
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
            fetchDepartments();
          }}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="alert alert-info">No departments found</div>
      ) : (
        <>
          <div className="grid">
            {currentDepartments.map((dept) => (
              <div key={dept.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{dept.departmentName}</h3>
                  <span className="card-badge">{dept.status}</span>
                </div>
                <div className="card-content">
                  <p>
                    <strong>ID:</strong> {dept.departmentId}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(dept.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {dept.status === "active" ? "✓ Active" : "✗ Deleted"}
                  </p>
                </div>
                <div className="btn-group" style={{ marginTop: "1rem" }}>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() =>
                      (window.location.href = `/explorer?dept=${dept.departmentId}`)
                    }
                  >
                    View Chain
                  </button>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => startEdit(dept)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteDepartment(dept.departmentId)}
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

export default Departments;
