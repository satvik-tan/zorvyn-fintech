const path = require("path");
const { execSync } = require("child_process");
const request = require("supertest");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const app = require("../src/app");
const prisma = require("../src/core/prisma");

jest.setTimeout(120000);

let adminToken;
let analystToken;
let viewerToken;

async function registerUser(payload) {
  return request(app).post("/api/auth/register").send(payload);
}

describe("Finance Dashboard API", () => {
  beforeAll(async () => {
    try {
      execSync("npx prisma migrate deploy", {
        stdio: "inherit",
        cwd: process.cwd(),
        env: process.env
      });
    } catch (error) {
      // Ignore migration deploy errors in test bootstrap and continue with db push.
    }

    // Ensure schema exists for tests when migrations are missing.
    execSync("npx prisma db push", {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env
    });

    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["admin@test.com", "analyst@test.com", "viewer@test.com", "new@test.com"]
        }
      }
    });

    await registerUser({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN"
    });

    await registerUser({
      name: "Analyst User",
      email: "analyst@test.com",
      password: "password123",
      role: "ANALYST"
    });

    await registerUser({
      name: "Viewer User",
      email: "viewer@test.com",
      password: "password123",
      role: "VIEWER"
    });

    adminToken = (
      await request(app).post("/api/auth/login").send({ email: "admin@test.com", password: "password123" })
    ).body.token;

    analystToken = (
      await request(app).post("/api/auth/login").send({ email: "analyst@test.com", password: "password123" })
    ).body.token;

    viewerToken = (
      await request(app).post("/api/auth/login").send({ email: "viewer@test.com", password: "password123" })
    ).body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Register success (201)", async () => {
    const response = await registerUser({
      name: "New User",
      email: "new@test.com",
      password: "password123",
      role: "VIEWER"
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.email).toBe("new@test.com");
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.token).toBeDefined();
  });

  test("Register duplicate email (409)", async () => {
    const response = await registerUser({
      name: "New User",
      email: "new@test.com",
      password: "password123"
    });

    expect(response.statusCode).toBe(409);
  });

  test("Register invalid email (400)", async () => {
    const response = await registerUser({
      name: "Bad Email",
      email: "invalid-email",
      password: "password123"
    });

    expect(response.statusCode).toBe(400);
  });

  test("Login success (200)", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe("admin@test.com");
    expect(response.body.token).toBeDefined();
  });

  test("Login wrong password (401)", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "wrongpass"
    });

    expect(response.statusCode).toBe(401);
  });

  test("Transactions admin creates (201)", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 1000,
        type: "INCOME",
        category: "Salary",
        date: new Date().toISOString(),
        notes: "Admin income"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.amount).toBe(1000);
  });

  test("Transactions analyst creates (201)", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        amount: 120,
        type: "EXPENSE",
        category: "Dining",
        date: new Date().toISOString(),
        notes: "Analyst expense"
      });

    expect(response.statusCode).toBe(201);
  });

  test("Transactions viewer blocked (403)", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        amount: 120,
        type: "EXPENSE",
        category: "Dining",
        date: new Date().toISOString()
      });

    expect(response.statusCode).toBe(403);
  });

  test("Transactions negative amount rejected (400)", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: -10,
        type: "EXPENSE",
        category: "Dining",
        date: new Date().toISOString()
      });

    expect(response.statusCode).toBe(400);
  });

  test("Transactions unauthenticated rejected (401)", async () => {
    const response = await request(app).post("/api/transactions").send({
      amount: 100,
      type: "INCOME",
      category: "Salary",
      date: new Date().toISOString()
    });

    expect(response.statusCode).toBe(401);
  });

  test("Dashboard summary returns total_income and net_balance", async () => {
    const response = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.total_income).not.toBeUndefined();
    expect(response.body.net_balance).not.toBeUndefined();
  });

  test("Dashboard categories analyst allowed (200)", async () => {
    const response = await request(app)
      .get("/api/dashboard/categories")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.income).toBeDefined();
    expect(response.body.expense).toBeDefined();
  });

  test("Dashboard categories viewer blocked (403)", async () => {
    const response = await request(app)
      .get("/api/dashboard/categories")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("Users list admin allowed (200)", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.rows)).toBe(true);
  });

  test("Users list analyst blocked (403)", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(response.statusCode).toBe(403);
  });
});
