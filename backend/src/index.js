const express = require("express");
const cors = require("cors");
const path = require("path");

// Import blockchain components
const { BlockchainManager } = require("./blockchain");
const BlockchainService = require("./services/BlockchainService");
const DatabaseService = require("./services/DatabaseService");

// Import controllers
const DepartmentController = require("./controllers/DepartmentController");
const ClassController = require("./controllers/ClassController");
const StudentController = require("./controllers/StudentController");
const AttendanceController = require("./controllers/AttendanceController");
const ExplorerController = require("./controllers/ExplorerController");

// Import routes
const setupRoutes = require("./routes/api");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Initialize blockchain system
const dataDir = path.join(__dirname, "../data");
const blockchainManager = new BlockchainManager(4); // difficulty = 4 for PoW
const databaseService = new DatabaseService(dataDir);
const blockchainService = new BlockchainService(
  blockchainManager,
  databaseService
);

// Initialize controllers
const departmentController = new DepartmentController(blockchainService);
const classController = new ClassController(blockchainService);
const studentController = new StudentController(blockchainService);
const attendanceController = new AttendanceController(blockchainService);
const explorerController = new ExplorerController(blockchainService);

// Setup routes
setupRoutes(
  app,
  departmentController,
  classController,
  studentController,
  attendanceController,
  explorerController
);

// Initialize system with default data on first run
let isInitialized = false;

app.get("/api/initialize", (req, res) => {
  try {
    if (isInitialized) {
      return res.json({
        success: false,
        message: "System already initialized",
      });
    }

    console.log("Initializing BAMS with default data...");
    blockchainService.initializeSystem();
    isInitialized = true;

    res.json({
      success: true,
      message:
        "System initialized with default departments, classes, and students",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   Blockchain-Based Attendance Management      ║
║              System (BAMS)                     ║
╚════════════════════════════════════════════════╝

✓ Server running on http://localhost:${PORT}
✓ API available at http://localhost:${PORT}/api
✓ Initialize system: GET http://localhost:${PORT}/api/initialize

Ready to accept requests...
  `);
});

module.exports = app;
