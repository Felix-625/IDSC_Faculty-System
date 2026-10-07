const express = require("express");
const router = express.Router();

const facultyService = require("../services/faculty.service");

router.get("/", (req, res) => {
  res.json(facultyService.getAllFaculty());
});

router.post("/", (req, res) => {
  const data = req.body;

  if (
    !data.facultyId ||
    !data.name ||
    !data.department ||
    !data.position ||
    !data.employmentType
  ) {
    return res.status(400).json({
      type: "https://example.com/problems/bad-request",
      title: "Bad Request",
      status: 400,
      detail: "Required faculty fields are missing.",
      instance: req.originalUrl
    });
  }

  const created = facultyService.createFaculty(data);

  res.status(201).json(created);
});

router.get("/:facultyId", (req, res) => {
  const item = facultyService.getFacultyById(
    req.params.facultyId
  );

  if (!item) {
    return res.status(404).json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: `Faculty ${req.params.facultyId} was not found.`,
      instance: req.originalUrl
    });
  }

  res.json(item);
});

router.put("/:facultyId", (req, res) => {
  const updated = facultyService.updateFaculty(
    req.params.facultyId,
    req.body
  );

  if (!updated) {
    return res.status(404).json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: `Faculty ${req.params.facultyId} was not found.`,
      instance: req.originalUrl
    });
  }

  res.json(updated);
});

router.get("/:facultyId/salary", (req, res) => {
  const item = facultyService.getFacultyById(
    req.params.facultyId
  );

  if (!item) {
    return res.status(404).json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: `Faculty ${req.params.facultyId} was not found.`,
      instance: req.originalUrl
    });
  }

  res.json({
    facultyId: item.facultyId,
    employmentType: item.employmentType,
    salary: item.employmentType === "FULL_TIME" ? 45000 : 25000,
    currency: "PHP",
    effectiveDate: "2026-09-01"
  });
});

module.exports = router;