const express = require("express");
const router = express.Router();

const courseService = require("../services/course.service");

router.get("/", (req, res) => {
  res.json(courseService.getAllCourses());
});

router.post("/", (req, res) => {
  const data = req.body;

  if (!data.courseCode || !data.courseName || !data.units) {
    return res.status(400).json({
      type: "https://example.com/problems/bad-request",
      title: "Bad Request",
      status: 400,
      detail: "courseCode, courseName and units are required.",
      instance: req.originalUrl
    });
  }

  res.status(201).json(
    courseService.createCourse(data)
  );
});

router.get("/:courseCode", (req, res) => {
  const course = courseService.getCourseByCode(
    req.params.courseCode
  );

  if (!course) {
    return res.status(404).json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: `Course ${req.params.courseCode} was not found.`,
      instance: req.originalUrl
    });
  }

  res.json(course);
});

router.put("/:courseCode", (req, res) => {
  const updated = courseService.updateCourse(
    req.params.courseCode,
    req.body
  );

  if (!updated) {
    return res.status(404).json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: `Course ${req.params.courseCode} was not found.`,
      instance: req.originalUrl
    });
  }

  res.json(updated);
});

router.delete("/:courseCode", (req, res) => {
  const deleted = courseService.deleteCourse(
    req.params.courseCode
  );

  if (!deleted) {
    return res.status(404).json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: `Course ${req.params.courseCode} was not found.`,
      instance: req.originalUrl
    });
  }

  res.status(204).send();
});

module.exports = router;