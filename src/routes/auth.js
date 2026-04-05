const express = require("express");
const { body } = require("express-validator");
const authService = require("../services/authService");
const { validateRequest } = require("../middleware/errorHandler");
const { authenticate, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const validRoles = ["VIEWER", "ANALYST", "ADMIN"];

router.post(
  "/register",
  authenticate,
  requireRole("ADMIN"),
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(validRoles)
      .withMessage("role must be VIEWER, ANALYST, or ADMIN"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  })
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("valid email is required"),
    body("password").notEmpty().withMessage("password is required"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
  })
);

module.exports = router;
