const schedules = require("../data/schedule.data");
const { User } = require("../models");
const { DAYS } = require("../utils/validators");

const toMinutes = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const overlaps = (a, b) =>
  toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime);

function nextScheduleId() {
  const max = schedules.reduce((highest, s) => {
    const n = parseInt(String(s.scheduleId).replace("SCH-", ""), 10);
    return Number.isNaN(n) ? highest : Math.max(highest, n);
  }, 0);
  return `SCH-${String(max + 1).padStart(3, "0")}`;
}

const byDayThenTime = (a, b) =>
  DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime);

function getSchedules({ section, facultyId, day } = {}) {
  return schedules
    .filter(s =>
      (!section || s.section === section) &&
      (!facultyId || s.facultyId === facultyId) &&
      (!day || s.day === day))
    .sort(byDayThenTime);
}

function getScheduleById(scheduleId) {
  return schedules.find(s => s.scheduleId === scheduleId);
}

async function getFacultySchedule(facultyId) {
  if (!(await User.exists({ facultyId }))) return null;
  return getSchedules({ facultyId });
}

// A schedule must belong to a subject the faculty member is actually assigned to.
async function findAssignment(facultyId, courseCode, section) {
  const f = await User.findOne({ facultyId }).select("assignedSubjects").lean();
  if (!f) return undefined;
  return (f.assignedSubjects || []).find(
    a => a.courseCode === courseCode && a.section === section && a.assignmentStatus === "ASSIGNED"
  );
}

// Same faculty, room or section cannot be in two places at the same time (same term).
function findConflict(candidate, ignoreId) {
  for (const other of schedules) {
    if (other.scheduleId === ignoreId) continue;
    if (other.semester !== candidate.semester || other.academicYear !== candidate.academicYear) continue;
    if (other.day !== candidate.day || !overlaps(other, candidate)) continue;

    const when = `${other.day} ${other.startTime}-${other.endTime}`;
    if (other.facultyId === candidate.facultyId) {
      return `Faculty ${candidate.facultyId} already has ${other.courseCode} (${other.section}) on ${when}.`;
    }
    if (candidate.room && other.room === candidate.room) {
      return `Room ${candidate.room} is already used by ${other.courseCode} (${other.section}) on ${when}.`;
    }
    if (other.section === candidate.section) {
      return `Section ${candidate.section} already has ${other.courseCode} on ${when}.`;
    }
  }
  return null;
}

// Returns { schedule } or { error: "faculty-not-found" | "not-assigned" | "conflict", message }.
async function build(data, scheduleId, ignoreId) {
  if (!(await User.exists({ facultyId: data.facultyId }))) return { error: "faculty-not-found" };

  const assignment = await findAssignment(data.facultyId, data.courseCode, data.section);
  if (!assignment) return { error: "not-assigned" };

  const schedule = {
    scheduleId,
    facultyId: data.facultyId,
    courseCode: data.courseCode,
    section: data.section,
    day: data.day,
    startTime: data.startTime,
    endTime: data.endTime,
    ...(data.room !== undefined && { room: data.room }),
    assignmentId: assignment.assignmentId,
    semester: assignment.semester,
    academicYear: assignment.academicYear
  };

  const message = findConflict(schedule, ignoreId);
  if (message) return { error: "conflict", message };

  return { schedule };
}

async function createSchedule(data) {
  const result = await build(data, nextScheduleId());
  if (result.schedule) schedules.push(result.schedule);
  return result;
}

async function updateSchedule(scheduleId, data) {
  const index = schedules.findIndex(s => s.scheduleId === scheduleId);
  if (index === -1) return { error: "not-found" };

  const result = await build(data, scheduleId, scheduleId);
  if (result.schedule) schedules[index] = result.schedule;
  return result;
}

function deleteSchedule(scheduleId) {
  const index = schedules.findIndex(s => s.scheduleId === scheduleId);
  if (index === -1) return false;
  schedules.splice(index, 1);
  return true;
}

module.exports = {
  getSchedules, getScheduleById, getFacultySchedule,
  createSchedule, updateSchedule, deleteSchedule
};