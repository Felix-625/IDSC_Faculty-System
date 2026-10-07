const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const facultyRoutes = require("./routes/faculty.routes");
const courseRoutes = require("./routes/course.routes");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load("./openapi.yaml");

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api/v1/faculty", facultyRoutes);
app.use("/api/v1/courses", courseRoutes);

app.use((req, res) => {
  res.status(404).json({
    type: "https://example.com/problems/not-found",
    title: "Not Found",
    status: 404,
    detail: "The requested endpoint does not exist.",
    instance: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});