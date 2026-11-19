const POSITIONS = ["FACULTY", "DEAN", "AVP"];
const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "OTHER"];
const EMPLOYMENT_STATUSES = ["ACTIVE", "INACTIVE", "RESIGNED", "ON_LEAVE"];
const COURSE_STATUSES = ["ACTIVE", "INACTIVE"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = v => typeof v !== "string" || v.trim() === "";

function validateFaculty(data) {
  const errors = [];
  for (const field of ["facultyId", "name", "department"]) {
    if (isBlank(data[field])) errors.push(`${field} is required and must be a non-empty string.`);
  }
  if (!POSITIONS.includes(data.position)) {
    errors.push(`position is required and must be one of: ${POSITIONS.join(", ")}.`);
  }
  if (!EMPLOYMENT_TYPES.includes(data.employmentType)) {
    errors.push(`employmentType is required and must be one of: ${EMPLOYMENT_TYPES.join(", ")}.`);
  }
  if (data.employmentStatus !== undefined && !EMPLOYMENT_STATUSES.includes(data.employmentStatus)) {
    errors.push(`employmentStatus must be one of: ${EMPLOYMENT_STATUSES.join(", ")}.`);
  }
  if (data.email !== undefined && (typeof data.email !== "string" || !EMAIL_RE.test(data.email))) {
    errors.push("email must be a valid email address.");
  }
  if (data.specialization !== undefined && typeof data.specialization !== "string") {
    errors.push("specialization must be a string.");
  }
  return errors;
}

function validateCourse(data) {
  const errors = [];
  for (const field of ["courseCode", "courseName"]) {
    if (isBlank(data[field])) errors.push(`${field} is required and must be a non-empty string.`);
  }
  if (!Number.isInteger(data.units) || data.units <= 0) {
    errors.push("units is required and must be a positive integer.");
  }
  if (data.status !== undefined && !COURSE_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${COURSE_STATUSES.join(", ")}.`);
  }
  for (const field of ["description", "department", "semester", "academicYear"]) {
    if (data[field] !== undefined && typeof data[field] !== "string") {
      errors.push(`${field} must be a string.`);
    }
  }
  return errors;
}

function validateAssignment(data) {
  const errors = [];
  for (const field of ["courseCode", "section", "semester", "academicYear"]) {
    if (isBlank(data[field])) errors.push(`${field} is required and must be a non-empty string.`);
  }
  if (!isBlank(data.academicYear)) {
    const m = /^(\d{4})-(\d{4})$/.exec(data.academicYear);
    if (!m || Number(m[2]) !== Number(m[1]) + 1) {
      errors.push("academicYear must look like 2026-2027 (consecutive years).");
    }
  }
  return errors;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateSchedule(data) {
  const errors = [];
  for (const field of ["facultyId", "courseCode", "section"]) {
    if (isBlank(data[field])) errors.push(`${field} is required and must be a non-empty string.`);
  }
  if (!DAYS.includes(data.day)) {
    errors.push(`day is required and must be one of: ${DAYS.join(", ")}.`);
  }
  for (const field of ["startTime", "endTime"]) {
    if (typeof data[field] !== "string" || !TIME_RE.test(data[field])) {
      errors.push(`${field} is required and must be a 24-hour time like 07:00.`);
    }
  }
  if (TIME_RE.test(data.startTime) && TIME_RE.test(data.endTime) && data.startTime >= data.endTime) {
    errors.push("endTime must be later than startTime.");
  }
  if (data.room !== undefined && typeof data.room !== "string") {
    errors.push("room must be a string.");
  }
  return errors;
}

function validateAnnouncement(data) {
  const errors = [];
  for (const field of ["title", "content"]) {
    if (isBlank(data[field])) errors.push(`${field} is required and must be a non-empty string.`);
  }
  return errors;
}

const pick = (data, fields) =>
  Object.fromEntries(fields.filter(f => data[f] !== undefined).map(f => [f, data[f]]));

const FACULTY_FIELDS = [
  "facultyId", "name", "email", "department", "position",
  "employmentType", "specialization", "employmentStatus"
];
const COURSE_FIELDS = [
  "courseCode", "courseName", "description", "units",
  "department", "semester", "academicYear", "status"
];

module.exports = {
  validateFaculty,
  validateCourse,
  validateAssignment,
  validateSchedule,
  validateAnnouncement,
  DAYS,
  pickSchedule: data => pick(data, ["facultyId", "courseCode", "section", "day", "startTime", "endTime", "room"]),
  pickAnnouncement: data => pick(data, ["title", "content"]),
  pickAssignment: data => pick(data, ["courseCode", "section", "semester", "academicYear"]),
  pickFaculty: data => pick(data, FACULTY_FIELDS),
  pickCourse: data => pick(data, COURSE_FIELDS)
};