const express = require("express");
const router = express.Router();

const courseService = require("../services/course.service");
const { sendProblem } = require("../utils/problem");
const { validateCourse, pickCourse } = require("../utils/validators");
const { authenticate, requireRole } = require("../middleware/auth");

const notFound = (req, res) =>
  sendProblem(req, res, 404, `Course ${req.params.courseCode} was not found.`);

router.use(authenticate);

router.get("/", (req, res) => {
  const dept = req.user.role === "AVP" ? req.query.department : req.user.department;
  res.json(courseService.getAllCourses(dept));
});

router.post("/", requireRole("DEAN"), (req, res) => {
  const data = pickCourse(req.body || {});

  // Deans can only register courses for their own department; AVP can register for any.
  if (req.user.role !== "AVP") {
    data.department = req.user.department;
  }

  const errors = validateCourse(data);
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  if (courseService.getCourseByCode(data.courseCode)) {
    return sendProblem(req, res, 409, `Course ${data.courseCode} already exists.`);
  }

  res.status(201).json(courseService.createCourse(data));
});

router.get("/:courseCode", (req, res) => {
  const course = courseService.getCourseByCode(req.params.courseCode);
  if (!course) return notFound(req, res);

  // Deans cannot view courses from other departments
  if (req.user.role === "DEAN" && course.department !== req.user.department) {
    return sendProblem(req, res, 403, "You can only access courses belonging to your department.");
  }

  res.json(course);
});

router.put("/:courseCode", requireRole("DEAN"), (req, res) => {
  const existing = courseService.getCourseByCode(req.params.courseCode);
  if (!existing) return notFound(req, res);

  // Deans can only update courses in their own department
  if (req.user.role !== "AVP" && existing.department !== req.user.department) {
    return sendProblem(req, res, 403, "You can only update courses belonging to your department.");
  }

  const data = pickCourse(req.body || {});
  if (req.user.role !== "AVP") {
    data.department = req.user.department;
  }

  const errors = validateCourse(data);
  if (data.courseCode && data.courseCode !== req.params.courseCode) {
    errors.push("courseCode in the body must match the courseCode in the URL.");
  }
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  const updated = courseService.updateCourse(req.params.courseCode, data);
  res.json(updated);
});

router.delete("/:courseCode", requireRole("DEAN"), (req, res) => {
  const existing = courseService.getCourseByCode(req.params.courseCode);
  if (!existing) return notFound(req, res);

  // Deans can only delete courses in their own department
  if (req.user.role !== "AVP" && existing.department !== req.user.department) {
    return sendProblem(req, res, 403, "You can only delete courses belonging to your department.");
  }

  if (courseService.isCourseAssigned(req.params.courseCode)) {
    return sendProblem(
      req, res, 409,
      `Course ${req.params.courseCode} is assigned to a faculty member. Mark it INACTIVE instead of deleting it.`
    );
  }

  courseService.deleteCourse(req.params.courseCode);
  res.status(204).send();
});

module.exports = router;