import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/App.css";

// Pages
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Explorer from "./pages/Explorer";
import StudentLedger from "./pages/StudentLedger";

function App() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/initialize", {
        method: "GET",
      });
      const data = await response.json();
      if (
        data.success === false &&
        data.message === "System already initialized"
      ) {
        setInitialized(true);
      }
    } catch (error) {
      console.error("Error checking initialization:", error);
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/initialize", {
        method: "GET",
      });
      const data = await response.json();
      if (data.success) {
        setInitialized(true);
        alert("System initialized successfully!");
      }
    } catch (error) {
      console.error("Error initializing system:", error);
      alert("Error initializing system");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>🔗 BAMS - Blockchain Attendance Management System</h1>
            <p>Multi-layered Hierarchical Blockchain Architecture</p>
          </div>
        </header>

        <nav className="app-nav">
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/departments">Departments</Link>
            </li>
            <li>
              <Link to="/classes">Classes</Link>
            </li>
            <li>
              <Link to="/students">Students</Link>
            </li>
            <li>
              <Link to="/attendance">Attendance</Link>
            </li>
            <li>
              <Link to="/ledger">Ledger</Link>
            </li>
            <li>
              <Link to="/explorer">Explorer</Link>
            </li>
          </ul>

          {!initialized && (
            <button
              className="init-btn"
              onClick={handleInitialize}
              disabled={loading}
            >
              {loading ? "Initializing..." : "Initialize System"}
            </button>
          )}
        </nav>

        <main className="app-main">
          {!initialized ? (
            <div className="init-message">
              <h2>System Not Initialized</h2>
              <p>
                Click "Initialize System" to populate with default departments,
                classes, and students.
              </p>
              <button onClick={handleInitialize} className="init-btn-large">
                Initialize System
              </button>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/students" element={<Students />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/ledger" element={<StudentLedger />} />
              <Route path="/explorer" element={<Explorer />} />
            </Routes>
          )}
        </main>

        <footer className="app-footer">
          <p>
            &copy; 2025 BAMS - Blockchain-Based Attendance Management System |
            Created by Muhammad Waleed
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
