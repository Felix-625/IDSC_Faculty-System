const express = require("express");
const router = express.Router();

const scheduleService = require("../services/schedule.service");
const facultyService = require("../services/faculty.service");
const { authenticate, requireRole, requireSelfOrDean } = require("../middleware/auth");
const { sendProblem } = require("../utils/problem");
const { validateSchedule, pickSchedule, DAYS } = require("../utils/validators");

// Mounted at /api/v1 because it serves both /schedules and /faculty/:id/schedule.

const notFound = (req, res) =>
  sendProblem(req, res, 404, `Schedule ${req.params.scheduleId} was not found.`);

// Shared by POST and PUT.
function respondToFailure(req, res, result, data) {
  switch (result.error) {
    case "faculty-not-found":
      return sendProblem(req, res, 404, `Faculty ${data.facultyId} was not found.`);
    case "not-found":
      return notFound(req, res);
    case "not-assigned":
      return sendProblem(req, res, 400,
        `Faculty ${data.facultyId} is not assigned to ${data.courseCode} for section ${data.section}. Assign the subject first.`);
    case "conflict":
      return sendProblem(req, res, 409, result.message);
    default:
      return null;
  }
}

router.get("/schedules", authenticate, requireRole("DEAN"), (req, res) => {
  const { section, facultyId, day } = req.query;

  if (day !== undefined && !DAYS.includes(day)) {
    return sendProblem(req, res, 400, `day must be one of: ${DAYS.join(", ")}.`);
  }

  let schedules = scheduleService.getSchedules({
    section: typeof section === "string" ? section : undefined,
    facultyId: typeof facultyId === "string" ? facultyId : undefined,
    day
  });

  // If user is DEAN, scope schedules to faculties of their department
  if (req.user.role !== "AVP") {
    const deptFaculties = new Set(facultyService.getAllFaculty(req.user.department).map(f => f.facultyId));
    schedules = schedules.filter(s => deptFaculties.has(s.facultyId));
  }

  res.json(schedules);
});

router.post("/schedules", authenticate, requireRole("DEAN"), (req, res) => {
  const data = pickSchedule(req.body || {});

  const errors = validateSchedule(data);
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  const result = scheduleService.createSchedule(data);
  if (result.error) return respondToFailure(req, res, result, data);

  res.status(201).json(result.schedule);
});

router.get("/schedules/:scheduleId", authenticate, requireRole("DEAN", "FACULTY"), (req, res) => {
  const schedule = scheduleService.getScheduleById(req.params.scheduleId);
  if (!schedule) return notFound(req, res);

  // Faculty may only read their own classes.
  if (req.user.role !== "DEAN" && schedule.facultyId !== req.user.facultyId) {
    return sendProblem(req, res, 403, "Faculty members can only access their own records.");
  }

  res.json(schedule);
});

router.put("/schedules/:scheduleId", authenticate, requireRole("DEAN"), (req, res) => {
  const data = pickSchedule(req.body || {});

  const errors = validateSchedule(data);
  if (errors.length) return sendProblem(req, res, 400, errors.join(" "), { errors });

  const result = scheduleService.updateSchedule(req.params.scheduleId, data);
  if (result.error) return respondToFailure(req, res, result, data);

  res.json(result.schedule);
});

router.delete("/schedules/:scheduleId", authenticate, requireRole("DEAN"), (req, res) => {
  if (!scheduleService.deleteSchedule(req.params.scheduleId)) return notFound(req, res);
  res.status(204).send();
});

router.get("/faculty/:facultyId/schedule", authenticate, requireSelfOrDean, (req, res) => {
  const list = scheduleService.getFacultySchedule(req.params.facultyId);
  if (!list) return sendProblem(req, res, 404, `Faculty ${req.params.facultyId} was not found.`);
  res.json(list);
});

module.exports = router;