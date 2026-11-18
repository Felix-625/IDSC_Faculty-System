const faculty = require("../data/faculty.data");
const courses = require("../data/course.data");

const sameSlot = (a, b) =>
  a.courseCode === b.courseCode &&
  a.section === b.section &&
  a.semester === b.semester &&
  a.academicYear === b.academicYear;

function allAssignments() {
  return faculty.flatMap(f => f.assignedSubjects || []);
}

// ASG-001, ASG-002, ... based on the highest existing number.
function nextAssignmentId() {
  const max = allAssignments().reduce((highest, a) => {
    const n = parseInt(String(a.assignmentId).replace("ASG-", ""), 10);
    return Number.isNaN(n) ? highest : Math.max(highest, n);
  }, 0);
  return `ASG-${String(max + 1).padStart(3, "0")}`;
}

function getAssignments(facultyId) {
  const f = faculty.find(item => item.facultyId === facultyId);
  return f ? f.assignedSubjects || [] : null;
}

// FacultyCourseItem is a trimmed view of the same assignment data.
function toCourseItem(a) {
  const { assignmentId, facultyId, courseCode, courseName, units, section, semester, academicYear } = a;
  return { assignmentId, facultyId, courseCode, courseName, units, section, semester, academicYear };
}

function assignSubject(facultyId, { courseCode, section, semester, academicYear }) {
  const f = faculty.find(item => item.facultyId === facultyId);
  if (!f) return { error: "faculty-not-found" };
  if (f.employmentStatus !== "ACTIVE") return { error: "faculty-inactive" };

  const course = courses.find(c => c.courseCode === courseCode);
  if (!course) return { error: "course-not-found" };
  if (course.status !== "ACTIVE") return { error: "course-inactive" };

  const requested = { courseCode, section, semester, academicYear };

  for (const other of faculty) {
    const clash = (other.assignedSubjects || []).find(
      a => a.assignmentStatus !== "CANCELLED" && sameSlot(a, requested)
    );
    if (clash) {
      return other.facultyId === facultyId
        ? { error: "duplicate" }
        : { error: "slot-taken", takenBy: other.facultyId };
    }
  }

  const assignment = {
    assignmentId: nextAssignmentId(),
    facultyId,
    courseCode,
    courseName: course.courseName,
    units: course.units,
    section,
    semester,
    academicYear,
    assignmentStatus: "ASSIGNED",
    assignedAt: new Date().toISOString()
  };

  f.assignedSubjects = f.assignedSubjects || [];
  f.assignedSubjects.push(assignment);
  f.updatedAt = new Date().toISOString();

  return { assignment };
}

function removeAssignment(facultyId, assignmentId) {
  const f = faculty.find(item => item.facultyId === facultyId);
  if (!f) return false;

  const index = (f.assignedSubjects || []).findIndex(a => a.assignmentId === assignmentId);
  if (index === -1) return false;

  f.assignedSubjects.splice(index, 1);
  f.updatedAt = new Date().toISOString();
  return true;
}

module.exports = { getAssignments, toCourseItem, assignSubject, removeAssignment };