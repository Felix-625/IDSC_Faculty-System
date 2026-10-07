const faculty = require("../data/faculty.data");

function getAllFaculty() {
  return faculty;
}

function getFacultyById(facultyId) {
  return faculty.find(item => item.facultyId === facultyId);
}

function createFaculty(data) {
  faculty.push(data);
  return data;
}

function updateFaculty(facultyId, data) {
  const index = faculty.findIndex(
    item => item.facultyId === facultyId
  );

  if (index === -1) {
    return null;
  }

  faculty[index] = {
    ...faculty[index],
    ...data,
    facultyId
  };

  return faculty[index];
}

module.exports = {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty
};