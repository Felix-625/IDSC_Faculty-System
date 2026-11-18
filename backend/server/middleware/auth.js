const { verifyToken } = require("../utils/jwt");
const { sendProblem } = require("../utils/problem");
const facultyData = require("../data/faculty.data");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return sendProblem(req, res, 401, "Authentication is required to access this resource.");
  }

  const payload = verifyToken(token);
  if (!payload) {
    return sendProblem(req, res, 401, "The access token is invalid or has expired.");
  }

  const user = facultyData.find(f => f.facultyId === payload.sub);
  if (!user || user.employmentStatus !== "ACTIVE") {
    return sendProblem(req, res, 401, "The account for this token is no longer active.");
  }

  // Role comes from current data, not the token, so changes apply immediately.
  req.user = { facultyId: user.facultyId, role: user.position };
  next();
}

// PROGRAM_HEAD is treated as FACULTY until the spec defines its own permissions.
function requireRole(...roles) {
  return (req, res, next) => {
    const effective = req.user.role === "DEAN" ? "DEAN" : "FACULTY";
    if (!roles.includes(effective)) {
      return sendProblem(req, res, 403, "The authenticated user does not have permission to perform this action.");
    }
    next();
  };
}

// FACULTY may only access their own :facultyId. DEAN may access any.
function requireSelfOrDean(req, res, next) {
  if (req.user.role === "DEAN" || req.user.facultyId === req.params.facultyId) {
    return next();
  }
  return sendProblem(req, res, 403, "Faculty members can only access their own records.");
}

module.exports = { authenticate, requireRole, requireSelfOrDean };