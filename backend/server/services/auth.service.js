const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { signToken, EXPIRES_IN } = require("../utils/jwt");

// Compared against when the ID is unknown, so "no such user" and "wrong password"
// take about the same time and IDs can't be probed.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

async function login(facultyId, password) {
  const user = await User.findOne({ facultyId });

  if (!user) {
    await bcrypt.compare(String(password), DUMMY_HASH);
    return null;
  }
  if (!(await user.matchPassword(String(password)))) return null;

  if (user.employmentStatus !== "ACTIVE") return { blocked: true };

  return {
    accessToken: signToken({ sub: user.facultyId, role: user.position }),
    tokenType: "Bearer",
    expiresIn: EXPIRES_IN,
    mustChangePassword: user.mustChangePassword === true,
    user: {
      facultyId: user.facultyId,
      name: user.name,
      email: user.email,
      position: user.position,
      department: user.department
    }
  };
}

// Returns true on success, false if the current password is wrong.
async function changePassword(facultyId, currentPassword, newPassword) {
  const user = await User.findOne({ facultyId });
  if (!user || !(await user.matchPassword(String(currentPassword)))) return false;

  user.password = newPassword; // hashed by the pre-save hook
  user.mustChangePassword = false;
  await user.save();
  return true;
}

module.exports = { login, changePassword };