const { User } = require("../models");
const courses = require("../data/course.data");

const sameSlot = (a, b) =>
  a.courseCode === b.courseCode &&
  a.section === b.section &&
  a.semester === b.semester &&
  a.academicYear === b.academicYear;

async function allFaculty() {
  return User.find({}).select("facultyId assignedSubjects").lean();
}

// ASG-001, ASG-002, ... based on the highest existing number.
function nextAssignmentId(everyone) {
  const all = everyone.flatMap(f => f.assignedSubjects || []);
  const max = all.reduce((highest, a) => {
    const n = parseInt(String(a.assignmentId).replace("ASG-", ""), 10);
    return Number.isNaN(n) ? highest : Math.max(highest, n);
  }, 0);
  return `ASG-${String(max + 1).padStart(3, "0")}`;
}

async function getAssignments(facultyId) {
  const f = await User.findOne({ facultyId }).select("assignedSubjects").lean();
  return f ? (f.assignedSubjects || []).map(a => ({ ...a, facultyId })) : null;
}

// FacultyCourseItem is a trimmed view of the same assignment data.
function toCourseItem(a) {
  const { assignmentId, facultyId, courseCode, courseName, units, section, semester, academicYear } = a;
  return { assignmentId, facultyId, courseCode, courseName, units, section, semester, academicYear };
}

async function assignSubject(facultyId, { courseCode, section, semester, academicYear }) {
  const f = await User.findOne({ facultyId }).select("facultyId employmentStatus").lean();
  if (!f) return { error: "faculty-not-found" };
  if (f.employmentStatus !== "ACTIVE") return { error: "faculty-inactive" };

  const course = courses.find(c => c.courseCode === courseCode);
  if (!course) return { error: "course-not-found" };
  if (course.status !== "ACTIVE") return { error: "course-inactive" };

  const requested = { courseCode, section, semester, academicYear };
  const everyone = await allFaculty();

  for (const other of everyone) {
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
    assignmentId: nextAssignmentId(everyone),
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

  await User.updateOne({ facultyId }, { $push: { assignedSubjects: assignment } });

  return { assignment };
}

async function removeAssignment(facultyId, assignmentId) {
  const result = await User.updateOne(
    { facultyId, "assignedSubjects.assignmentId": assignmentId },
    { $pull: { assignedSubjects: { assignmentId } } }
  );
  return result.modifiedCount > 0;
}

module.exports = { getAssignments, toCourseItem, assignSubject, removeAssignment };