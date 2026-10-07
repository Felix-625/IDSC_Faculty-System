const courses = require("../data/course.data");

function getAllCourses() {
  return courses;
}

function getCourseByCode(courseCode) {
  return courses.find(
    course => course.courseCode === courseCode
  );
}

function createCourse(data) {
  courses.push(data);
  return data;
}

function updateCourse(courseCode, data) {
  const index = courses.findIndex(
    course => course.courseCode === courseCode
  );

  if (index === -1) {
    return null;
  }

  courses[index] = {
    ...courses[index],
    ...data,
    courseCode
  };

  return courses[index];
}

function deleteCourse(courseCode) {
  const index = courses.findIndex(
    course => course.courseCode === courseCode
  );

  if (index === -1) {
    return false;
  }

  courses.splice(index, 1);
  return true;
}

module.exports = {
  getAllCourses,
  getCourseByCode,
  createCourse,
  updateCourse,
  deleteCourse
};