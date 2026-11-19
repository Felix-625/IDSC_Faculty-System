const faculty = require("../data/faculty.data");

function getAllFaculty(department) {
  if (department && department !== "ALL" && department !== "Academic Affairs") {
    return faculty.filter(item => item.department === department);
  }
  return faculty;
}

function getFacultyById(facultyId) {
  return faculty.find(item => item.facultyId === facultyId);
}

function createFaculty(data) {
  const item = {
    employmentStatus: "ACTIVE",
    ...data,
    assignedSubjects: [],
    updatedAt: new Date().toISOString()
  };
  faculty.push(item);
  return item;
}

function updateFaculty(facultyId, data) {
  const index = faculty.findIndex(item => item.facultyId === facultyId);
  if (index === -1) return null;

  faculty[index] = {
    ...faculty[index],
    ...data,
    facultyId,
    assignedSubjects: faculty[index].assignedSubjects,
    updatedAt: new Date().toISOString()
  };
  return faculty[index];
}

const SALARY_BY_TYPE = { FULL_TIME: 45000, PART_TIME: 25000, OTHER: 25000 };

function getSalary(facultyId) {
  const item = getFacultyById(facultyId);
  if (!item) return null;

  return {
    facultyId: item.facultyId,
    employmentType: item.employmentType,
    salary: SALARY_BY_TYPE[item.employmentType],
    currency: "PHP",
    effectiveDate: "2026-09-01"
  };
}

module.exports = { getAllFaculty, getFacultyById, createFaculty, updateFaculty, getSalary };