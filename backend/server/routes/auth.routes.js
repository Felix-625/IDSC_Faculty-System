const express = require("express");
const router = express.Router();

const authService = require("../services/auth.service");
const facultyService = require("../services/faculty.service");
const { authenticate } = require("../middleware/auth");
const { sendProblem } = require("../utils/problem");
const { MIN_PASSWORD_LENGTH } = require("../utils/password");

router.post("/login", async (req, res) => {
  const { facultyId, password } = req.body || {};

  if (typeof facultyId !== "string" || typeof password !== "string" || !facultyId || !password) {
    return sendProblem(req, res, 400, "facultyId and password are required.");
  }

  const result = await authService.login(facultyId, password);

  if (!result) return sendProblem(req, res, 401, "Invalid facultyId or password.");
  if (result.blocked) return sendProblem(req, res, 403, "This account is not active.");

  res.json(result);
});

router.get("/me", authenticate, async (req, res) => {
  res.json(await facultyService.getFacultyById(req.user.facultyId));
});

router.patch("/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || !currentPassword || !newPassword) {
    return sendProblem(req, res, 400, "currentPassword and newPassword are required.");
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return sendProblem(req, res, 400, `newPassword must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (newPassword === currentPassword) {
    return sendProblem(req, res, 400, "newPassword must be different from currentPassword.");
  }

  const ok = await authService.changePassword(req.user.facultyId, currentPassword, newPassword);
  if (!ok) return sendProblem(req, res, 401, "Current password is incorrect.");

  res.status(204).send();
});

module.exports = router;