// =============================================================================
// REGISTRAR ADAPTER
// The only place that knows where student/enrollment data comes from.
// When REGISTRAR_API_URL is configured in .env, it calls the Registrar's live API.
// Otherwise, it falls back seamlessly to local database/mock data.
// =============================================================================
const { students, enrollments } = require("../data/student.data");

const sameOffering = (e, o) =>
  e.courseCode === o.courseCode &&
  e.section === o.section &&
  e.semester === o.semester &&
  e.academicYear === o.academicYear;

function toStudentItem(student, enrollment) {
  if (!student) return null;
  return {
    studentId: student.studentId,
    name: student.name,
    program: student.program,
    yearLevel: student.yearLevel,
    section: student.section,
    enrollmentStatus: enrollment ? enrollment.enrollmentStatus : "ENROLLED",
  };
}

function getLocalEnrolledStudents(offering) {
  return enrollments
    .filter(e => sameOffering(e, offering) && e.enrollmentStatus === "ENROLLED")
    .map(e => toStudentItem(students.find(s => s.studentId === e.studentId), e))
    .filter(Boolean);
}

async function getEnrolledStudents(offering) {
  const registrarUrl = process.env.REGISTRAR_API_URL;
  const apiKey = process.env.REGISTRAR_API_KEY;

  if (registrarUrl) {
    try {
      const query = new URLSearchParams({
        courseCode: offering.courseCode || "",
        section: offering.section || "",
        semester: offering.semester || "",
        academicYear: offering.academicYear || "",
      });

      const response = await fetch(`${registrarUrl}/enrollments?${query.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { "x-api-key": apiKey }),
        },
      });

      if (response.ok) {
        const liveData = await response.json();
        return liveData;
      }
      console.warn(`Registrar API returned HTTP ${response.status}. Falling back to local roster.`);
    } catch (err) {
      console.warn(`Could not reach Registrar API (${err.message}). Using local roster.`);
    }
  }

  return getLocalEnrolledStudents(offering);
}

function getEnrolledStudentSync(studentId, offering) {
  return getLocalEnrolledStudents(offering).find(s => s.studentId === studentId) || null;
}

async function getEnrolledStudent(studentId, offering) {
  const list = await getEnrolledStudents(offering);
  return list.find(s => s.studentId === studentId) || null;
}

module.exports = {
  getEnrolledStudents,
  getEnrolledStudent,
  getEnrolledStudentSync,
  getLocalEnrolledStudents,
};
