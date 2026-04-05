const express = require("express");
const { query } = require("express-validator");
const dashboardService = require("../services/dashboardService");
const { authenticate, authorize } = require("../middleware/auth");
const { validateRequest } = require("../middleware/errorHandler");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("read:dashboard"),
  [
    query("from_date").optional().isISO8601().withMessage("from_date must be ISO date"),
    query("to_date").optional().isISO8601().withMessage("to_date must be ISO date"),
    query("months").optional().isInt({ min: 1, max: 24 }).withMessage("months must be between 1 and 24"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await dashboardService.getFullSnapshot({
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      months: req.query.months || 6,
      limit: req.query.limit || 10,
      type: req.query.type
    });
    res.status(200).json(result);
  })
);

router.get(
  "/summary",
  authenticate,
  authorize("read:dashboard"),
  [
    query("from_date").optional().isISO8601().withMessage("from_date must be ISO date"),
    query("to_date").optional().isISO8601().withMessage("to_date must be ISO date"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await dashboardService.getSummary(req.query);
    res.status(200).json(result);
  })
);

router.get(
  "/categories",
  authenticate,
  authorize("read:insights"),
  [
    query("type").optional().isIn(["INCOME", "EXPENSE"]).withMessage("type must be INCOME or EXPENSE"),
    query("from_date").optional().isISO8601().withMessage("from_date must be ISO date"),
    query("to_date").optional().isISO8601().withMessage("to_date must be ISO date"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await dashboardService.getCategoryBreakdown(req.query);
    res.status(200).json(result);
  })
);

router.get(
  "/trends",
  authenticate,
  authorize("read:insights"),
  [
    query("months").optional().isInt({ min: 1, max: 24 }).withMessage("months must be between 1 and 24"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await dashboardService.getMonthlyTrends({ months: req.query.months || 6 });
    res.status(200).json(result);
  })
);

router.get(
  "/recent",
  authenticate,
  authorize("read:dashboard"),
  [
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be between 1 and 50"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await dashboardService.getRecentActivity({ limit: req.query.limit || 10 });
    res.status(200).json(result);
  })
);

module.exports = router;
