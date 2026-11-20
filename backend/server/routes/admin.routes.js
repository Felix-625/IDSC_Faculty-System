const express = require("express");
const router = express.Router();

const facultyService = require("../services/faculty.service");
const { sendProblem } = require("../utils/problem");
const { validateFaculty, pickFaculty } = require("../utils/validators");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.use(authenticate, requireAdmin);

const notFound = (req, res) =>
  sendProblem(req, res, 404, `Account ${req.params.facultyId} was not found.`);

// List all accounts. Optional filters: ?department=...&position=DEAN
router.get("/users", async (req, res) => {
  const { department, position } = req.query;
  let users = await facultyService.getAllFaculty(typeof department === "string" ? department : undefined);
  if (typeof position === "string") users = users.filter(u => u.position === position);
  res.json(users);
});

// Create an AVP, Dean or Faculty account. The response includes temporaryPassword ONCE.
router.post("/users", async (req, res) => {
  const data = pickFaculty(req.body || {});

  const errors = validateFaculty(data);
  if (!data.email) errors.push("email is required to create an account.");
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  if (await facultyService.getFacultyById(data.facultyId)) {
    return sendProblem(req, res, 409, `Account ${data.facultyId} already exists.`);
  }

  try {
    res.status(201).json(await facultyService.createFaculty(data));
  } catch (err) {
    if (err.code === 11000) return sendProblem(req, res, 409, "That email address is already used by another account.");
    throw err;
  }
});

// Edit details, change position/department, or deactivate (employmentStatus: "INACTIVE").
router.put("/users/:facultyId", async (req, res) => {
  const existing = await facultyService.getFacultyById(req.params.facultyId);
  if (!existing) return notFound(req, res);
  if (existing.position === "ADMIN") {
    return sendProblem(req, res, 403, "Administrator accounts cannot be edited here.");
  }

  const data = pickFaculty(req.body || {});
  const errors = validateFaculty(data);
  if (data.facultyId && data.facultyId !== req.params.facultyId) {
    errors.push("facultyId in the body must match the facultyId in the URL.");
  }
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  try {
    res.json(await facultyService.updateFaculty(req.params.facultyId, data));
  } catch (err) {
    if (err.code === 11000) return sendProblem(req, res, 409, "That email address is already used by another account.");
    throw err;
  }
});

// Forgotten password: issues a new temporary password (returned once).
router.post("/users/:facultyId/reset-password", async (req, res) => {
  const existing = await facultyService.getFacultyById(req.params.facultyId);
  if (!existing) return notFound(req, res);
  if (existing.position === "ADMIN") {
    return sendProblem(req, res, 403, "Administrator passwords cannot be reset here.");
  }
  res.json(await facultyService.resetPassword(req.params.facultyId));
});

module.exports = router;