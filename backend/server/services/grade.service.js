const grades = require("../data/grade.data");

// Philippine grading scale. Edit this list if your school uses different values.
const ALLOWED_GRADES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];

const isValidGrade = value => typeof value === "number" && ALLOWED_GRADES.includes(value);

function findGrade(assignmentId, studentId) {
  return grades.find(g => g.assignmentId === assignmentId && g.studentId === studentId);
}

function getGradesForAssignment(assignmentId) {
  return grades.filter(g => g.assignmentId === assignmentId);
}

function createGrade(assignment, studentId, grade, updatedBy) {
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
    status: "POSTED",
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  grades.push(item);
  return item;
}

function updateGrade(existing, grade, updatedBy) {
  existing.grade = grade;
  existing.status = "UPDATED";
  existing.updatedAt = new Date().toISOString();
  existing.updatedBy = updatedBy;
  return existing;
}

module.exports = {
  ALLOWED_GRADES, isValidGrade, findGrade,
  getGradesForAssignment, createGrade, updateGrade
};