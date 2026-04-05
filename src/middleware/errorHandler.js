const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((item) => ({
        field: item.path,
        message: item.msg
      }))
    });
  }

  return next();
}

function globalErrorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err && err.code === "P2002") {
    return res.status(409).json({
      error: "Resource already exists",
      fields: err.meta && err.meta.target ? err.meta.target : []
    });
  }

  if (err && err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });
}

module.exports = {
  validateRequest,
  globalErrorHandler
};
