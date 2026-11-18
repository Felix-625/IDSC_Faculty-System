const express = require("express");
const router = express.Router();

const facultyService = require("../services/faculty.service");
const { sendProblem } = require("../utils/problem");
const assignmentService = require("../services/assignment.service");
const {
  validateFaculty, pickFaculty, validateAssignment, pickAssignment
} = require("../utils/validators");
const { authenticate, requireRole, requireSelfOrDean } = require("../middleware/auth");

const notFound = (req, res) =>
  sendProblem(req, res, 404, `Faculty ${req.params.facultyId} was not found.`);

router.use(authenticate);

router.get("/", requireRole("DEAN"), (req, res) => {
  res.json(facultyService.getAllFaculty());
});

router.post("/", requireRole("DEAN"), (req, res) => {
  const data = pickFaculty(req.body || {});

  const errors = validateFaculty(data);
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  if (facultyService.getFacultyById(data.facultyId)) {
    return sendProblem(req, res, 409, `Faculty ${data.facultyId} already exists.`);
  }

  res.status(201).json(facultyService.createFaculty(data));
});

router.get("/:facultyId", requireSelfOrDean, (req, res) => {
  const item = facultyService.getFacultyById(req.params.facultyId);
  if (!item) return notFound(req, res);
  res.json(item);
});

router.put("/:facultyId", requireRole("DEAN"), (req, res) => {
  const data = pickFaculty(req.body || {});

  const errors = validateFaculty(data);
  if (data.facultyId && data.facultyId !== req.params.facultyId) {
    errors.push("facultyId in the body must match the facultyId in the URL.");
  }
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  const updated = facultyService.updateFaculty(req.params.facultyId, data);
  if (!updated) return notFound(req, res);
  res.json(updated);
});

router.get("/:facultyId/salary", requireSelfOrDean, (req, res) => {
  const salary = facultyService.getSalary(req.params.facultyId);
  if (!salary) return notFound(req, res);
  res.json(salary);
});

router.get("/:facultyId/subjects", requireSelfOrDean, (req, res) => {
  const assignments = assignmentService.getAssignments(req.params.facultyId);
  if (!assignments) return notFound(req, res);
  res.json(assignments);
});

router.post("/:facultyId/subjects", requireRole("DEAN"), (req, res) => {
  const data = pickAssignment(req.body || {});

  const errors = validateAssignment(data);
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  const result = assignmentService.assignSubject(req.params.facultyId, data);

  switch (result.error) {
    case "faculty-not-found":
      return notFound(req, res);
    case "course-not-found":
      return sendProblem(req, res, 404, `Course ${data.courseCode} was not found.`);
    case "faculty-inactive":
      return sendProblem(req, res, 400, "Subjects can only be assigned to ACTIVE faculty members.");
    case "course-inactive":
      return sendProblem(req, res, 400, `Course ${data.courseCode} is INACTIVE and cannot be assigned.`);
    case "duplicate":
      return sendProblem(req, res, 409, "This subject, section, semester and academic year is already assigned to this faculty member.");
    case "slot-taken":
      return sendProblem(req, res, 409, `This subject, section, semester and academic year is already assigned to ${result.takenBy}.`);
    default:
      return res.status(201).json(result.assignment);
  }
});

router.delete("/:facultyId/subjects/:assignmentId", requireRole("DEAN"), (req, res) => {
  if (!assignmentService.getAssignments(req.params.facultyId)) return notFound(req, res);

  const removed = assignmentService.removeAssignment(req.params.facultyId, req.params.assignmentId);
  if (!removed) {
    return sendProblem(req, res, 404, `Assignment ${req.params.assignmentId} was not found for faculty ${req.params.facultyId}.`);
  }

  res.status(204).send();
});

router.get("/:facultyId/courses", requireSelfOrDean, (req, res) => {
  const assignments = assignmentService.getAssignments(req.params.facultyId);
  if (!assignments) return notFound(req, res);
  res.json(assignments.map(assignmentService.toCourseItem));
});
module.exports = router;