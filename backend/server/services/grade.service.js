const grades = require("../data/grade.data");

// Philippine grading scale + Incomplete, Dropped, Withdrawn marks.
const NUMERIC_GRADES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];
const NON_NUMERIC_MARKS = ["INC", "DRP", "W"];
const ALLOWED_GRADES = [...NUMERIC_GRADES, ...NON_NUMERIC_MARKS];

const isValidGrade = value => {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "number") return NUMERIC_GRADES.includes(value);
  if (typeof value === "string") {
    const upper = value.trim().toUpperCase();
    if (NON_NUMERIC_MARKS.includes(upper)) return true;
    const parsed = parseFloat(upper);
    if (!isNaN(parsed) && NUMERIC_GRADES.includes(parsed)) return true;
  }
  return false;
};

const normalizeGrade = value => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const upper = value.trim().toUpperCase();
    if (NON_NUMERIC_MARKS.includes(upper)) return upper;
    const parsed = parseFloat(upper);
    if (!isNaN(parsed) && NUMERIC_GRADES.includes(parsed)) return parsed;
  }
  return value;
};

function deriveRemarks(grade) {
  if (typeof grade === "number") {
    return grade <= 3.0 ? "PASSED" : "FAILED";
  }
  if (grade === "INC") return "INCOMPLETE";
  if (grade === "DRP") return "DROPPED";
  if (grade === "W") return "WITHDRAWN";
  return "PENDING";
}

function findGrade(assignmentId, studentId) {
  return grades.find(g => g.assignmentId === assignmentId && g.studentId === studentId);
}

function getGradesForAssignment(assignmentId) {
  return grades.filter(g => g.assignmentId === assignmentId);
}

function createGrade(assignment, studentId, gradeInput, updatedBy, extra = {}) {
  const grade = (gradeInput !== undefined && gradeInput !== null && gradeInput !== "")
    ? normalizeGrade(gradeInput)
    : (extra.components?.final ? normalizeGrade(extra.components.final) : null);

  const item = {
    assignmentId: assignment.assignmentId,
    facultyId: assignment.facultyId,
    studentId,
    courseCode: assignment.courseCode,
    courseName: assignment.courseName,
    section: assignment.section,
    semester: assignment.semester,
    academicYear: assignment.academicYear,
    grade,
    components: {
      prelim: extra.components?.prelim ? normalizeGrade(extra.components.prelim) : undefined,
      midterm: extra.components?.midterm ? normalizeGrade(extra.components.midterm) : undefined,
      preFinal: extra.components?.preFinal ? normalizeGrade(extra.components.preFinal) : undefined,
      final: extra.components?.final ? normalizeGrade(extra.components.final) : (grade || undefined),
    },
    remarks: extra.remarks || deriveRemarks(grade),
    reason: extra.reason,
    status: extra.status || "POSTED",
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  grades.push(item);
  return item;
}

function updateGrade(existing, gradeInput, updatedBy, extra = {}) {
  const grade = (gradeInput !== undefined && gradeInput !== null && gradeInput !== "")
    ? normalizeGrade(gradeInput)
    : (extra.components?.final ? normalizeGrade(extra.components.final) : existing.grade);

  existing.grade = grade;
  existing.components = {
    prelim: extra.components?.prelim !== undefined
      ? (extra.components.prelim ? normalizeGrade(extra.components.prelim) : undefined)
      : existing.components?.prelim,
    midterm: extra.components?.midterm !== undefined
      ? (extra.components.midterm ? normalizeGrade(extra.components.midterm) : undefined)
      : existing.components?.midterm,
    preFinal: extra.components?.preFinal !== undefined
      ? (extra.components.preFinal ? normalizeGrade(extra.components.preFinal) : undefined)
      : existing.components?.preFinal,
    final: extra.components?.final !== undefined
      ? (extra.components.final ? normalizeGrade(extra.components.final) : undefined)
      : (grade || existing.components?.final),
  };
  existing.remarks = extra.remarks || deriveRemarks(grade);
  if (extra.reason) existing.reason = extra.reason;
  existing.status = existing.status === "FINALIZED" ? "FINALIZED" : "UPDATED";
  existing.updatedAt = new Date().toISOString();
  existing.updatedBy = updatedBy;
  return existing;
}

module.exports = {
  NUMERIC_GRADES,
  NON_NUMERIC_MARKS,
  ALLOWED_GRADES,
  isValidGrade,
  normalizeGrade,
  deriveRemarks,
  findGrade,
  getGradesForAssignment,
  createGrade,
  updateGrade
};
