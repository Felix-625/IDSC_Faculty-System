const crypto = require("crypto");
const faculty = require("../data/faculty.data");
const { signToken, EXPIRES_IN } = require("../utils/jwt");

// DEMO ONLY: every account uses this password until a real credential table exists.
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Password123!";

const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 32);

const salt = crypto.randomBytes(16);
const demoHash = hashPassword(DEMO_PASSWORD, salt);

function passwordMatches(password) {
  const candidate = hashPassword(String(password), salt);
  return crypto.timingSafeEqual(candidate, demoHash);
}

function login(facultyId, password) {
  const user = faculty.find(f => f.facultyId === facultyId);

  // Same result for "unknown user" and "wrong password" so IDs can't be probed.
  if (!user || !passwordMatches(password)) return null;

  if (user.employmentStatus !== "ACTIVE") return { blocked: true };

  return {
    accessToken: signToken({ sub: user.facultyId, role: user.position }),
    tokenType: "Bearer",
    expiresIn: EXPIRES_IN,
    user: {
      facultyId: user.facultyId,
      name: user.name,
      email: user.email,
      position: user.position
    }
  };
}

module.exports = { login };