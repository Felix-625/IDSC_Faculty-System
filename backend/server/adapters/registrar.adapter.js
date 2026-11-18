// =============================================================================
// REGISTRAR ADAPTER
// The only place that knows where student/enrollment data comes from.
// Today it reads mock data. When the Registrar group's API is ready, replace the
// bodies of these two functions with HTTP calls. Nothing else needs to change.
// Both return StudentItem objects (see openapi.yaml).
// =============================================================================
const { students, enrollments } = require("../data/student.data");

const sameOffering = (e, o) =>
  e.courseCode === o.courseCode &&
  e.section === o.section &&
  e.semester === o.semester &&
  e.academicYear === o.academicYear;

function toStudentItem(student, enrollment) {
  return {
    studentId: student.studentId,
    name: student.name,
    program: student.program,
    yearLevel: student.yearLevel,
    section: student.section,
    enrollmentStatus: enrollment.enrollmentStatus
  };
}

function getEnrolledStudents(offering) {
  return enrollments
    .filter(e => sameOffering(e, offering) && e.enrollmentStatus === "ENROLLED")
    .map(e => toStudentItem(students.find(s => s.studentId === e.studentId), e));
}

function getEnrolledStudent(studentId, offering) {
  return getEnrolledStudents(offering).find(s => s.studentId === studentId) || null;
}

module.exports = { getEnrolledStudents, getEnrolledStudent };