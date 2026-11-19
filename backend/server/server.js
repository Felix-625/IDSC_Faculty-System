require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

const facultyRoutes = require("./routes/faculty.routes");
const courseRoutes = require("./routes/course.routes");
const studentRoutes = require("./routes/student.routes");
const gradeRoutes = require("./routes/grade.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const announcementRoutes = require("./routes/announcement.routes");

const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/faculty", facultyRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/faculty", studentRoutes);
app.use("/api/v1/faculty", gradeRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1", scheduleRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  connectDB();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  });
}

module.exports = app;