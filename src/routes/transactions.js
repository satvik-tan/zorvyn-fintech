const express = require("express");
const { body } = require("express-validator");
const transactionService = require("../services/transactionService");
const { authenticate, authorize } = require("../middleware/auth");
const { validateRequest } = require("../middleware/errorHandler");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();
const validTypes = ["INCOME", "EXPENSE"];

router.get(
  "/",
  authenticate,
  authorize("read:transactions"),
  asyncHandler(async (req, res) => {
    const result = await transactionService.listTransactions(req.query);
    res.status(200).json(result);
  })
);

router.get(
  "/:id",
  authenticate,
  authorize("read:transactions"),
  asyncHandler(async (req, res) => {
    const result = await transactionService.getTransactionById(req.params.id);
    res.status(200).json(result);
  })
);

router.post(
  "/",
  authenticate,
  authorize("write:transactions"),
  [
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("amount must be a positive number"),
    body("type").isIn(validTypes).withMessage("type must be INCOME or EXPENSE"),
    body("category").trim().notEmpty().withMessage("category is required"),
    body("date").isISO8601().withMessage("date must be a valid ISO date"),
    body("notes").optional().isString().withMessage("notes must be a string"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await transactionService.createTransaction(req.body, req.user.id);
    res.status(201).json(result);
  })
);

router.patch(
  "/:id",
  authenticate,
  authorize("write:transactions"),
  [
    body("amount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("amount must be a positive number"),
    body("type")
      .optional()
      .isIn(validTypes)
      .withMessage("type must be INCOME or EXPENSE"),
    body("category")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("category is required"),
    body("date").optional().isISO8601().withMessage("date must be a valid ISO date"),
    body("notes").optional({ nullable: true }).isString().withMessage("notes must be a string"),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const result = await transactionService.updateTransaction(req.params.id, req.body);
    res.status(200).json(result);
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize("delete:transactions"),
  asyncHandler(async (req, res) => {
    await transactionService.deleteTransaction(req.params.id);
    res.status(204).send();
  })
);

module.exports = router;
