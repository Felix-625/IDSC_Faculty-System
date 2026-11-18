const express = require("express");
const router = express.Router();

const authService = require("../services/auth.service");
const facultyService = require("../services/faculty.service");
const { authenticate } = require("../middleware/auth");
const { sendProblem } = require("../utils/problem");

router.post("/login", (req, res) => {
  const { facultyId, password } = req.body || {};

  if (typeof facultyId !== "string" || typeof password !== "string" || !facultyId || !password) {
    return sendProblem(req, res, 400, "facultyId and password are required.");
  }

  const result = authService.login(facultyId, password);

  if (!result) return sendProblem(req, res, 401, "Invalid facultyId or password.");
  if (result.blocked) return sendProblem(req, res, 403, "This account is not active.");

  res.json(result);
});

router.get("/me", authenticate, (req, res) => {
  res.json(facultyService.getFacultyById(req.user.facultyId));
});

module.exports = router;