const express = require("express");
const router = express.Router();

const assignmentService = require("../services/assignment.service");
const registrar = require("../adapters/registrar.adapter");
const { authenticate, requireSelfOrDean } = require("../middleware/auth");
const { sendProblem } = require("../utils/problem");

router.get("/:facultyId/courses/:courseCode/students", authenticate, requireSelfOrDean, (req, res) => {
  const { facultyId, courseCode } = req.params;
  const { section, semester, academicYear } = req.query;

  const missing = ["section", "semester", "academicYear"].filter(
    name => typeof req.query[name] !== "string" || req.query[name].trim() === ""
  );
  if (missing.length) {
    return sendProblem(req, res, 400, `Missing required query parameter(s): ${missing.join(", ")}.`);
  }

  const assignments = assignmentService.getAssignments(facultyId);
  if (!assignments) return sendProblem(req, res, 404, `Faculty ${facultyId} was not found.`);

  const handled = assignments.some(
    a => a.courseCode === courseCode && a.section === section &&
         a.semester === semester && a.academicYear === academicYear &&
         a.assignmentStatus === "ASSIGNED"
  );
  if (!handled) {
    return sendProblem(req, res, 404,
      `Faculty ${facultyId} is not assigned to ${courseCode} (${section}, ${semester}, ${academicYear}).`);
  }

  res.json(registrar.getEnrolledStudents({ courseCode, section, semester, academicYear }));
});

module.exports = router;