# Developer Guide: Instructor Subsystem

Welcome to the MyLearn project! This guide will help you set up the environment from scratch, provision the database, and run all our automated tests for the Instructor subsystem.

## 1. Initial Setup

After pulling down the repository, you'll need to install dependencies and configure your environment:

```bash
# Install all node packages
npm install

# Make sure you have a .env file containing the following variables:
# DATABASE_URL=""
# NEXT_PUBLIC_API_BASE_URL=""
# BETTER_AUTH_SECRET=
# BETTER_AUTH_URL=
```

## 2. Database Initialization

We use Prisma as our ORM. If this is a fresh pull, you must generate the client and push the schema to your database.

```bash
# Generate the Prisma Client
npx prisma generate

# Push the schema structure to your database
npx prisma db push
```

## 3. Instructor Test Account Provisioning

We've provided a seeding script to quickly create a test Instructor account (`demo_instructor@test.com` with password `password123`). This account is required for automated browser tests and is useful for manual UI testing or live demoing.

```bash
# Run the test seed script
npx tsx test-seed.ts
```

## 4. Running the API Unit Tests (Vitest)

We use Vitest to mock HTTP requests and test the specific isolated logic of the API endpoints directly (`/api/courses`).

```bash
# Run the Vitest test suite once
npx vitest run

# Run Vitest in watch mode (updates automatically as you write code)
npx vitest
```

## 5. Running the Browser UI Tests (Playwright)

We use Playwright to simulate a real user opening a Chromium browser, logging in as an instructor, and interacting with the UI.

Note: Playwright requires the Next.js development server to be actively running in the background because it hits `http://localhost:3000`.

```bash
# In Terminal 1: Start the Next.js app
npm run dev

# In Terminal 2: Run the Playwright test suite
npx playwright test tests/instructor-dashboard.spec.ts

# View the visual HTML report of the test results
npx playwright show-report
```

## Troubleshooting
If Playwright is failing due to timeout issues, ensure your development server is completely loaded, and you have run `test-seed.ts` first.
