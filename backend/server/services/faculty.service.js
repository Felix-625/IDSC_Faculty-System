const { User } = require("../models");
const financeAdapter = require("../adapters/finance.adapter");
const { generateTempPassword } = require("../utils/password");

// Never send the password hash (or Mongo internals) to API clients.
const PUBLIC_FIELDS = "-password -__v -_id";

async function getAllFaculty(department) {
  const filter = {};
  if (department && department !== "ALL" && department !== "Academic Affairs") {
    filter.department = department;
  }
  return User.find(filter).select(PUBLIC_FIELDS).lean();
}

async function getFacultyById(facultyId) {
  return User.findOne({ facultyId }).select(PUBLIC_FIELDS).lean();
}

// Creates the account with a random temporary password, returned once.
async function createFaculty(data) {
  const temporaryPassword = generateTempPassword();
  const user = await User.create({
    employmentStatus: "ACTIVE",
    ...data,
    password: temporaryPassword,
    mustChangePassword: true,
    assignedSubjects: []
  });
  return { ...user.toJSON(), temporaryPassword };
}

async function updateFaculty(facultyId, data) {
  // Only profile fields - not the password or assignments.
  const { facultyId: _ignored, ...fields } = data;
  return User.findOneAndUpdate(
    { facultyId },
    { $set: fields },
    { returnDocument: "after", runValidators: true }
  ).select(PUBLIC_FIELDS).lean();
}

// Admin reset: new random temporary password, forced change at next login.
async function resetPassword(facultyId) {
  const user = await User.findOne({ facultyId });
  if (!user) return null;

  const temporaryPassword = generateTempPassword();
  user.password = temporaryPassword;
  user.mustChangePassword = true;
  await user.save();
  return { facultyId, temporaryPassword };
}

async function getSalary(facultyId) {
  const item = await getFacultyById(facultyId);
  if (!item) return null;

  return await financeAdapter.getFacultySalary(facultyId, item.employmentType);
}

module.exports = { getAllFaculty, getFacultyById, createFaculty, updateFaculty, resetPassword, getSalary };