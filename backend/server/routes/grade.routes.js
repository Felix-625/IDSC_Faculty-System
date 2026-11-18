const express = require("express");
const router = express.Router();

const assignmentService = require("../services/assignment.service");
const gradeService = require("../services/grade.service");
const registrar = require("../adapters/registrar.adapter");
const { authenticate, requireSelfOrDean } = require("../middleware/auth");
const { sendProblem } = require("../utils/problem");

const GRADE_PATH = "/:facultyId/courses/:courseCode/students/:studentId/grade";

// Checks the body, finds the faculty's assignment, and confirms the student is enrolled.
// Returns { assignment, student } or sends the error response and returns null.
function resolveForWrite(req, res) {
  const { facultyId, courseCode, studentId } = req.params;
  const { assignmentId, grade } = req.body || {};

  const errors = [];
  if (typeof assignmentId !== "string" || assignmentId.trim() === "") {
    errors.push("assignmentId is required and must be a non-empty string.");
  }
  if (!gradeService.isValidGrade(grade)) {
    errors.push(`grade is required and must be one of: ${gradeService.ALLOWED_GRADES.join(", ")}.`);
  }
  if (errors.length) {
    sendProblem(req, res, 400, errors.join(" "), { errors });
    return null;
  }

  const assignments = assignmentService.getAssignments(facultyId);
  if (!assignments) {
    sendProblem(req, res, 404, `Faculty ${facultyId} was not found.`);
    return null;
  }

  const assignment = assignments.find(a => a.assignmentId === assignmentId);
  if (!assignment) {
    sendProblem(req, res, 404, `Assignment ${assignmentId} was not found for faculty ${facultyId}.`);
    return null;
  }
  if (assignment.courseCode !== courseCode) {
    sendProblem(req, res, 400, `Assignment ${assignmentId} is for ${assignment.courseCode}, not ${courseCode}.`);
    return null;
  }

  const student = registrar.getEnrolledStudent(studentId, assignment);
  if (!student) {
    sendProblem(req, res, 404, `Student ${studentId} is not enrolled in this subject offering.`);
    return null;
  }

  return { assignment, student };
}

router.post(GRADE_PATH, authenticate, requireSelfOrDean, (req, res) => {
  const ctx = resolveForWrite(req, res);
  if (!ctx) return;

  if (gradeService.findGrade(ctx.assignment.assignmentId, req.params.studentId)) {
    return sendProblem(req, res, 409, "A grade already exists for this student and subject assignment. Use PUT to update it.");
  }

  const item = gradeService.createGrade(ctx.assignment, req.params.studentId, req.body.grade, req.user.facultyId);
  res.status(201).json(item);
});

router.put(GRADE_PATH, authenticate, requireSelfOrDean, (req, res) => {
  const ctx = resolveForWrite(req, res);
  if (!ctx) return;

  const existing = gradeService.findGrade(ctx.assignment.assignmentId, req.params.studentId);
  if (!existing) {
    return sendProblem(req, res, 404, "No grade exists yet for this student and subject assignment. Use POST to add it.");
  }

  res.json(gradeService.updateGrade(existing, req.body.grade, req.user.facultyId));
});

// assignmentId (query) is optional when the faculty has only one assignment for that course.
router.get(GRADE_PATH, authenticate, requireSelfOrDean, (req, res) => {
  const { facultyId, courseCode, studentId } = req.params;

  const assignments = assignmentService.getAssignments(facultyId);
  if (!assignments) return sendProblem(req, res, 404, `Faculty ${facultyId} was not found.`);

  let candidates = assignments.filter(a => a.courseCode === courseCode);
  if (typeof req.query.assignmentId === "string") {
    candidates = candidates.filter(a => a.assignmentId === req.query.assignmentId);
  }

  if (candidates.length === 0) {
    return sendProblem(req, res, 404, `No matching assignment for ${courseCode} was found for faculty ${facultyId}.`);
  }
  if (candidates.length > 1) {
    return sendProblem(req, res, 400,
      `Faculty ${facultyId} has several assignments for ${courseCode}. Add ?assignmentId= (one of: ${candidates.map(a => a.assignmentId).join(", ")}).`);
  }

  const grade = gradeService.findGrade(candidates[0].assignmentId, studentId);
  if (!grade) return sendProblem(req, res, 404, `No grade found for student ${studentId} in ${candidates[0].assignmentId}.`);

  res.json(grade);
});

router.get("/:facultyId/subjects/:assignmentId/grades", authenticate, requireSelfOrDean, (req, res) => {
  const { facultyId, assignmentId } = req.params;

  const assignments = assignmentService.getAssignments(facultyId);
  if (!assignments) return sendProblem(req, res, 404, `Faculty ${facultyId} was not found.`);
  if (!assignments.some(a => a.assignmentId === assignmentId)) {
    return sendProblem(req, res, 404, `Assignment ${assignmentId} was not found for faculty ${facultyId}.`);
  }

  res.json(gradeService.getGradesForAssignment(assignmentId));
});

module.exports = router;