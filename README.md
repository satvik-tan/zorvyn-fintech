# Finance Dashboard Backend

Backend API for a finance dashboard built with Node.js, Express, Prisma ORM, and PostgreSQL.

## Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT auth (`jsonwebtoken`) + password hashing (`bcryptjs`)
- Request validation (`express-validator`)
- Logging (`morgan`)
- Testing (`jest` + `supertest`)

## Project Structure

```text
src/
	app.js
	core/
		config.js
		prisma.js
	middleware/
		auth.js
		errorHandler.js
	models/
		userModel.js
		transactionModel.js
	services/
		authService.js
		transactionService.js
		dashboardService.js
		userService.js
	routes/
		auth.js
		transactions.js
		users.js
		dashboard.js
	utils/
		seed.js
tests/
	api.test.js
prisma/
	schema.prisma
.env
package.json
```

## Environment Variables

Create/update `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
PORT=3000
```

Optional for tests:

```env
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/finance_test_db
```

If `TEST_DATABASE_URL` is set, tests use it; otherwise tests use `DATABASE_URL`.

## Install

```bash
npm install
```

## Database Setup

Generate Prisma client:

```bash
npm run db:generate
```

Apply schema to DB:

```bash
npx prisma db push
```

Or create migrations:

```bash
npm run db:migrate
```

## Run the API

Development:

```bash
npm run dev
```

Production/start mode:

```bash
npm start
```

Health check:

```bash
curl http://localhost:3000/health
```

## API Documentation (Swagger)

After starting the server, open:

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs.json`

## Seed Demo Data

```bash
npm run seed
```

Create/update a default admin user directly:

```bash
npm run create:admin
```

Defaults used by the script:

- `DEFAULT_ADMIN_EMAIL=admin@finance.local`
- `DEFAULT_ADMIN_NAME=Default Admin`
- `DEFAULT_ADMIN_PASSWORD=Admin@123456`

Seed users:

- `alice@example.com` / `password123` (ADMIN)
- `bob@example.com` / `password123` (ANALYST)
- `carol@example.com` / `password123` (VIEWER)

## Run Tests

```bash
npm test
```

## Quick Try (cURL)

Register:

```bash
curl -X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{
		"name": "Admin User",
		"email": "admin@example.com",
		"password": "password123",
		"role": "ADMIN"
	}'
```

Login and copy token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"admin@example.com","password":"password123"}'
```

Set token in shell:

```bash
TOKEN="paste_jwt_here"
```

Create transaction:

```bash
curl -X POST http://localhost:3000/api/transactions \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{
		"amount": 1250.50,
		"type": "INCOME",
		"category": "Salary",
		"date": "2026-04-06T00:00:00.000Z",
		"notes": "Monthly salary"
	}'
```

List transactions:

```bash
curl "http://localhost:3000/api/transactions?page=1&limit=10" \
	-H "Authorization: Bearer $TOKEN"
```

Dashboard summary:

```bash
curl http://localhost:3000/api/dashboard/summary \
	-H "Authorization: Bearer $TOKEN"
```

## Main Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Transactions:

- `GET /api/transactions`
- `GET /api/transactions/:id`
- `POST /api/transactions`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`

Users:

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

Dashboard:

- `GET /api/dashboard`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/categories`
- `GET /api/dashboard/trends`
- `GET /api/dashboard/recent`

## Notes

- Passwords are never returned in API responses.
- Transaction delete is soft delete (`isDeleted = true`).
- Role checks are done against fresh DB user data on each authenticated request.
- Auth access policy:
	- Only `ADMIN` can log in.
	- `POST /api/auth/register` requires authenticated `ADMIN`.
	- `GET /api/auth/me` requires authenticated `ADMIN`.
Build a Finance Dashboard Backend using Node.js, Express, Prisma ORM, and PostgreSQL.

Project Structure
src/
app.js # Express app setup
core/
config.js # env vars, role constants, permission map
prisma.js # Prisma client singleton
middleware/
auth.js # authenticate (JWT verify), authorize(permission), requireRole(...roles)
errorHandler.js # validateRequest (express-validator), globalErrorHandler
models/ # thin wrappers over Prisma calls (no raw SQL)
services/
authService.js
transactionService.js
dashboardService.js
userService.js
routes/
auth.js
transactions.js
users.js
dashboard.js
utils/
seed.js
tests/
api.test.js # supertest integration tests
prisma/
schema.prisma
.env
package.json

Tech Stack
Runtime: Node.js
Framework: Express
ORM: Prisma
Database: PostgreSQL
Auth: JWT (jsonwebtoken) + bcryptjs
Validation: express-validator
Testing: Jest + Supertest
Logging: morgan
Prisma Schema (prisma/schema.prisma)
Define two models:

User:
id, name, email (unique), password, role (enum: VIEWER, ANALYST, ADMIN), isActive (default true), createdAt, updatedAt

Transaction:Build a Finance Dashboard Backend using Node.js, Express, Prisma ORM, and PostgreSQL.

Project Structure
src/
app.js # Express app setup
core/
config.js # env vars, role constants, permission map
prisma.js # Prisma client singleton
middleware/
auth.js # authenticate (JWT verify), authorize(permission), requireRole(...roles)
errorHandler.js # validateRequest (express-validator), globalErrorHandler
models/ # thin wrappers over Prisma calls (no raw SQL)
services/
authService.js
transactionService.js
dashboardService.js
userService.js
routes/
auth.js
transactions.js
users.js
dashboard.js
utils/
seed.js
tests/
api.test.js # supertest integration tests
prisma/
schema.prisma
.env
package.json

Tech Stack
Runtime: Node.js
Framework: Express
ORM: Prisma
Database: PostgreSQL
Auth: JWT (jsonwebtoken) + bcryptjs
Validation: express-validator
Testing: Jest + Supertest
Logging: morgan
Prisma Schema (prisma/schema.prisma)
Define two models:

User:
id, name, email (unique), password, role (enum: VIEWER, ANALYST, ADMIN), isActive (default true), createdAt, updatedAt

Transaction:
id, userId (FK -> User), amount (Float, >0), type (enum: INCOME, EXPENSE), category (String), date (DateTime), notes (String?), isDeleted (default false), createdAt, updatedAt

Add indexes on: Transaction.userId, Transaction.date, Transaction.type, Transaction.category

Roles and Permissions
Define a PERMISSIONS map in config.js:
viewer: ["read:transactions", "read:dashboard"]
analyst: ["read:transactions", "read:dashboard", "read:insights"]
admin: ["read:transactions", "read:dashboard", "read:insights", "write:transactions", "delete:transactions", "manage:users"]

Auth Middleware (src/middleware/auth.js)
authenticate: verifies Bearer JWT, fetches fresh user from DB via Prisma, attaches to req.user, rejects if user not found or isActive=false
authorize(permission): checks PERMISSIONS[req.user.role] includes the permission, returns 403 if not
requireRole(...roles): checks req.user.role is in the roles list, returns 403 if not
Routes
POST /api/auth/register
Validate: name (required), email (valid), password (min 6), role (optional, must be valid enum value)
Hash password with bcrypt, create user via Prisma, return user + JWT. Return 409 if email already exists.

POST /api/auth/login
Validate: email, password
Find user by email, check isActive, compare password with bcrypt, return user (without password) + JWT. Return 401 for wrong credentials.

GET /api/auth/me
authenticate middleware. Return req.user.

GET /api/transactions
authenticate + authorize("read:transactions")
Query params: page, limit, type, category, from_date, to_date (all optional)
Use Prisma findMany with where: { isDeleted: false }, include filters dynamically, include pagination (skip/take), include user name via relation. Return { rows, total, page, limit }.

GET /api/transactions/:id
authenticate + authorize("read:transactions")
Use Prisma findFirst where id matches and isDeleted=false. Return 404 if not found.

POST /api/transactions
authenticate + authorize("write:transactions")
Validate: amount (positive float), type (INCOME|EXPENSE), category (required), date (valid date), notes (optional)
Create via Prisma. Return 201 with created record.

PATCH /api/transactions/:id
authenticate + authorize("write:transactions")
Validate fields optionally. Use Prisma update. Return 404 if not found or already deleted.

DELETE /api/transactions/:id
authenticate + authorize("delete:transactions")
Soft delete: Prisma update where id=x, set isDeleted=true. Return 204. Return 404 if not found.

GET /api/users
authenticate + requireRole("ADMIN")
Query params: page, limit, role, isActive. Use Prisma findMany with filters. Return paginated list (exclude password field).

GET /api/users/:id
authenticate + requireRole("ADMIN")
Return user by id (exclude password). 404 if not found.

PATCH /api/users/:id
authenticate + requireRole("ADMIN")
Allowed fields: name, role, isActive. Use Prisma update. Return updated user.

DELETE /api/users/:id
authenticate + requireRole("ADMIN")
Prevent admin from deactivating themselves (return 400). Set isActive=false via Prisma update. Return 204.

GET /api/dashboard
authenticate + authorize("read:dashboard")
Query params: from_date, to_date, months (default 6)
Return full snapshot: { summary, category_breakdown, monthly_trends, recent_activity }

GET /api/dashboard/summary
authorize("read:dashboard")
Use Prisma groupBy or aggregate to compute: total_income, total_expenses, net_balance, transaction_count. Apply optional date range filter. All values should default to 0 if null.

GET /api/dashboard/categories
authorize("read:insights")
Use Prisma groupBy on [category, type] where isDeleted=false. Apply optional type and date filters. Return { income: [{category, total, count}], expense: [...] }.

GET /api/dashboard/trends
authorize("read:insights")
Query param: months (default 6, max 24)
Use Prisma groupBy on date truncated to month for the last N months. Return array of { month (YYYY-MM), income, expenses, net, count }. Note: Prisma does not support date truncation natively — use $queryRaw with date_trunc('month', date) in PostgreSQL.

GET /api/dashboard/recent
authorize("read:dashboard")
Query param: limit (default 10, max 50)
Use Prisma findMany where isDeleted=false, orderBy createdAt desc, include user name. Return array.

Dashboard Service (dashboardService.js)
getSummary({ from_date, to_date }): use prisma.transaction.aggregate for _sum of amount grouped by type via two separate aggregate calls or groupBy
getCategoryBreakdown({ type, from_date, to_date }): prisma.transaction.groupBy(['category','type']) with _sum and _count
getMonthlyTrends({ months }): use prisma.$queryRaw with date_trunc
getRecentActivity({ limit }): prisma.transaction.findMany with include user
getFullSnapshot: call all four and return combined object
Validation and Error Handling
validateRequest middleware: runs validationResult from express-validator, returns 400 with { error: "Validation failed", details: [{field, message}] }
globalErrorHandler: catch-all Express error handler, handles Prisma P2002 (unique constraint) as 409, err.status if set, fallback 500
All service methods should throw errors with a .status property for HTTP errors (404, 400, etc.)
Seed Script (src/utils/seed.js)
Create 3 users: alice@example.com (ADMIN), bob@example.com (ANALYST), carol@example.com (VIEWER), all with password "password123"
Create ~25 transactions spread across the past 6 months with varied types, categories (Salary, Freelance, Rent, Groceries, Utilities, Transport, Dining, Investments, Subscriptions), and amounts.
Use prisma.user.createMany and prisma.transaction.createMany. Log credentials at end.

Tests (tests/api.test.js)
Use Jest + Supertest. Use a separate test DB (TEST_DATABASE_URL env var). Run prisma migrate deploy before tests.
Cover:

Register: success (201), duplicate email (409), invalid email (400)
Login: success (200), wrong password (401)
Transactions: admin creates (201), analyst creates (201), viewer blocked (403), negative amount rejected (400), unauthenticated rejected (401)
Dashboard summary: returns total_income and net_balance
Dashboard categories: analyst allowed (200), viewer blocked (403)
Users list: admin allowed (200), analyst blocked (403)
Environment Variables (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
PORT=3000

package.json scripts
start: node src/app.js
dev: nodemon src/app.js
seed: node src/utils/seed.js
test: jest --runInBand
db:migrate: prisma migrate dev
db:generate: prisma generate

Key Implementation Notes
Prisma client should be a singleton (instantiate once, export)
Never return password field in any user response — use Prisma select or delete from object
JWT payload: { userId, role }
On authenticate, always re-fetch user from DB (don't trust token role for permission checks, role may have changed)
Soft delete: never hard delete transactions, set isDeleted=true
All monetary values stored as Float in Prisma / DOUBLE PRECISION in Postgres
Date field on Transaction is DateTime in Prisma; accept ISO date strings from client
Pagination: skip = (page-1)*limit, take = limit
For monthly trends, use prisma.$queryRawSELECT date_trunc('month', date) as month, ...
prisma has been setup, in .env

prompt me for anyother thing needed.
id, userId (FK -> User), amount (Float, >0), type (enum: INCOME, EXPENSE), category (String), date (DateTime), notes (String?), isDeleted (default false), createdAt, updatedAt

Add indexes on: Transaction.userId, Transaction.date, Transaction.type, Transaction.category

Roles and Permissions
Define a PERMISSIONS map in config.js:
viewer: ["read:transactions", "read:dashboard"]
analyst: ["read:transactions", "read:dashboard", "read:insights"]
admin: ["read:transactions", "read:dashboard", "read:insights", "write:transactions", "delete:transactions", "manage:users"]

Auth Middleware (src/middleware/auth.js)
authenticate: verifies Bearer JWT, fetches fresh user from DB via Prisma, attaches to req.user, rejects if user not found or isActive=false
authorize(permission): checks PERMISSIONS[req.user.role] includes the permission, returns 403 if not
requireRole(...roles): checks req.user.role is in the roles list, returns 403 if not
Routes
POST /api/auth/register
Validate: name (required), email (valid), password (min 6), role (optional, must be valid enum value)
Hash password with bcrypt, create user via Prisma, return user + JWT. Return 409 if email already exists.

POST /api/auth/login
Validate: email, password
Find user by email, check isActive, compare password with bcrypt, return user (without password) + JWT. Return 401 for wrong credentials.

GET /api/auth/me
authenticate middleware. Return req.user.

GET /api/transactions
authenticate + authorize("read:transactions")
Query params: page, limit, type, category, from_date, to_date (all optional)
Use Prisma findMany with where: { isDeleted: false }, include filters dynamically, include pagination (skip/take), include user name via relation. Return { rows, total, page, limit }.

GET /api/transactions/:id
authenticate + authorize("read:transactions")
Use Prisma findFirst where id matches and isDeleted=false. Return 404 if not found.

POST /api/transactions
authenticate + authorize("write:transactions")
Validate: amount (positive float), type (INCOME|EXPENSE), category (required), date (valid date), notes (optional)
Create via Prisma. Return 201 with created record.

PATCH /api/transactions/:id
authenticate + authorize("write:transactions")
Validate fields optionally. Use Prisma update. Return 404 if not found or already deleted.

DELETE /api/transactions/:id
authenticate + authorize("delete:transactions")
Soft delete: Prisma update where id=x, set isDeleted=true. Return 204. Return 404 if not found.

GET /api/users
authenticate + requireRole("ADMIN")
Query params: page, limit, role, isActive. Use Prisma findMany with filters. Return paginated list (exclude password field).

GET /api/users/:id
authenticate + requireRole("ADMIN")
Return user by id (exclude password). 404 if not found.

PATCH /api/users/:id
authenticate + requireRole("ADMIN")
Allowed fields: name, role, isActive. Use Prisma update. Return updated user.

DELETE /api/users/:id
authenticate + requireRole("ADMIN")
Prevent admin from deactivating themselves (return 400). Set isActive=false via Prisma update. Return 204.

GET /api/dashboard
authenticate + authorize("read:dashboard")
Query params: from_date, to_date, months (default 6)
Return full snapshot: { summary, category_breakdown, monthly_trends, recent_activity }

GET /api/dashboard/summary
authorize("read:dashboard")
Use Prisma groupBy or aggregate to compute: total_income, total_expenses, net_balance, transaction_count. Apply optional date range filter. All values should default to 0 if null.

GET /api/dashboard/categories
authorize("read:insights")
Use Prisma groupBy on [category, type] where isDeleted=false. Apply optional type and date filters. Return { income: [{category, total, count}], expense: [...] }.

GET /api/dashboard/trends
authorize("read:insights")
Query param: months (default 6, max 24)
Use Prisma groupBy on date truncated to month for the last N months. Return array of { month (YYYY-MM), income, expenses, net, count }. Note: Prisma does not support date truncation natively — use $queryRaw with date_trunc('month', date) in PostgreSQL.

GET /api/dashboard/recent
authorize("read:dashboard")
Query param: limit (default 10, max 50)
Use Prisma findMany where isDeleted=false, orderBy createdAt desc, include user name. Return array.

Dashboard Service (dashboardService.js)
getSummary({ from_date, to_date }): use prisma.transaction.aggregate for _sum of amount grouped by type via two separate aggregate calls or groupBy
getCategoryBreakdown({ type, from_date, to_date }): prisma.transaction.groupBy(['category','type']) with _sum and _count
getMonthlyTrends({ months }): use prisma.$queryRaw with date_trunc
getRecentActivity({ limit }): prisma.transaction.findMany with include user
getFullSnapshot: call all four and return combined object
Validation and Error Handling
validateRequest middleware: runs validationResult from express-validator, returns 400 with { error: "Validation failed", details: [{field, message}] }
globalErrorHandler: catch-all Express error handler, handles Prisma P2002 (unique constraint) as 409, err.status if set, fallback 500
All service methods should throw errors with a .status property for HTTP errors (404, 400, etc.)
Seed Script (src/utils/seed.js)
Create 3 users: alice@example.com (ADMIN), bob@example.com (ANALYST), carol@example.com (VIEWER), all with password "password123"
Create ~25 transactions spread across the past 6 months with varied types, categories (Salary, Freelance, Rent, Groceries, Utilities, Transport, Dining, Investments, Subscriptions), and amounts.
Use prisma.user.createMany and prisma.transaction.createMany. Log credentials at end.

Tests (tests/api.test.js)
Use Jest + Supertest. Use a separate test DB (TEST_DATABASE_URL env var). Run prisma migrate deploy before tests.
Cover:

Register: success (201), duplicate email (409), invalid email (400)
Login: success (200), wrong password (401)
Transactions: admin creates (201), analyst creates (201), viewer blocked (403), negative amount rejected (400), unauthenticated rejected (401)
Dashboard summary: returns total_income and net_balance
Dashboard categories: analyst allowed (200), viewer blocked (403)
Users list: admin allowed (200), analyst blocked (403)
Environment Variables (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
PORT=3000

package.json scripts
start: node src/app.js
dev: nodemon src/app.js
seed: node src/utils/seed.js
test: jest --runInBand
db:migrate: prisma migrate dev
db:generate: prisma generate

Key Implementation Notes
Prisma client should be a singleton (instantiate once, export)
Never return password field in any user response — use Prisma select or delete from object
JWT payload: { userId, role }
On authenticate, always re-fetch user from DB (don't trust token role for permission checks, role may have changed)
Soft delete: never hard delete transactions, set isDeleted=true
All monetary values stored as Float in Prisma / DOUBLE PRECISION in Postgres
Date field on Transaction is DateTime in Prisma; accept ISO date strings from client
Pagination: skip = (page-1)*limit, take = limit
For monthly trends, use prisma.$queryRawSELECT date_trunc('month', date) as month, ...
prisma has been setup, in .env

prompt me for anyother thing needed.