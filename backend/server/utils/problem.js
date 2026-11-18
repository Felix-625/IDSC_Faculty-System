const TITLES = {
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
  404: "Not Found", 409: "Conflict", 500: "Internal Server Error"
};
const SLUGS = {
  400: "bad-request", 401: "unauthorized", 403: "forbidden",
  404: "not-found", 409: "conflict", 500: "internal-server-error"
};

function problem(status, detail, instance, extra = {}) {
  return {
    type: `https://example.com/problems/${SLUGS[status] || "error"}`,
    title: TITLES[status] || "Error",
    status,
    detail,
    instance,
    ...extra
  };
}

function sendProblem(req, res, status, detail, extra) {
  return res.status(status).json(problem(status, detail, req.originalUrl, extra));
}

module.exports = { problem, sendProblem };