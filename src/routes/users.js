const express = require("express");
const { body } = require("express-validator");
const userService = require("../services/userService");
const { authenticate, requireRole } = require("../middleware/auth");
const { validateRequest } = require("../middleware/errorHandler");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();
const validRoles = ["VIEWER", "ANALYST", "ADMIN"];

router.get(
  "/",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const result = await userService.listUsers(req.query);
    res.status(200).json(result);
  })
);

router.get(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const result = await userService.getUserById(req.params.id);
    res.status(200).json(result);
  })
);

router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  [
    body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
    body("role")
      .optional()
      .isIn(validRoles)
      .withMessage("role must be VIEWER, ANALYST, or ADMIN"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const payload = {
      ...(req.body.name !== undefined ? { name: req.body.name } : {}),
      ...(req.body.role !== undefined ? { role: req.body.role } : {}),
      ...(req.body.isActive !== undefined ? { isActive: req.body.isActive } : {})
    };

    const result = await userService.updateUser(req.params.id, payload);
    res.status(200).json(result);
  })
);

router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await userService.deactivateUser(req.params.id, req.user.id);
    res.status(204).send();
  })
);

module.exports = router;
