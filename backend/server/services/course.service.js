const courses = require("../data/course.data");
const { User } = require("../models");

function getAllCourses(department) {
  if (department && department !== "ALL" && department !== "Academic Affairs") {
    return courses.filter(course => course.department === department);
  }
  return courses;
}

function getCourseByCode(courseCode) {
  return courses.find(course => course.courseCode === courseCode);
}

function createCourse(data) {
  const course = { status: "ACTIVE", ...data };
  courses.push(course);
  return course;
}

function updateCourse(courseCode, data) {
  const index = courses.findIndex(course => course.courseCode === courseCode);
  if (index === -1) return null;

  courses[index] = { ...courses[index], ...data, courseCode };
  return courses[index];
}

async function isCourseAssigned(courseCode) {
  const found = await User.exists({
    assignedSubjects: { $elemMatch: { courseCode, assignmentStatus: "ASSIGNED" } }
  });
  return Boolean(found);
}

function deleteCourse(courseCode) {
  const index = courses.findIndex(course => course.courseCode === courseCode);
  if (index === -1) return false;

  courses.splice(index, 1);
  return true;
}

module.exports = {
  getAllCourses, getCourseByCode, createCourse,
  updateCourse, deleteCourse, isCourseAssigned
};