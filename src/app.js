const express = require("express");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { PORT } = require("./core/config");
const { swaggerSpec } = require("./docs/swagger");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/users");
const dashboardRoutes = require("./routes/dashboard");
const { globalErrorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(globalErrorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
