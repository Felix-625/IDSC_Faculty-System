const { sendProblem } = require("../utils/problem");

function notFoundHandler(req, res) {
  return sendProblem(req, res, 404, "The requested endpoint does not exist.");
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return sendProblem(req, res, 400, "Request body is not valid JSON.");
  }
  if (err.type === "entity.too.large") {
    return sendProblem(req, res, 400, "Request body is too large.");
  }
  console.error(err);
  return sendProblem(req, res, 500, "An unexpected error occurred while processing the request.");
}

module.exports = { notFoundHandler, errorHandler };