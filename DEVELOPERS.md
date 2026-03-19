# Developer Guide: Instructor Subsystem

Welcome to the Demokritos project! This guide will help you set up the environment from scratch, provision the database, and run all our automated tests for the Instructor subsystem.

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

# Veracity LRS Configuration for Quiz Analytics
# LRS_ENDPOINT=""
# LRS_KEY=""
# LRS_SECRET=""

# Google GenAI Configuration for Assignment Autograding
# GEMINI_API_KEY=""

# Google Calendar OAuth Configuration
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

The Better Auth secret can be generated through https://better-auth.com/docs/installation or using the following:
```bash
openssl rand -base64 32
```

For quiz analytics, create a Veracity Learning account here: https://lrs.io/ui/users/home/0/
Create a new LRS with any name, then within that LRS, naivgate to Management -> Access Keys and create a new access key, which will give the configuration variables above.

For quiz analytics, create a Veracity Learning account here: https://lrs.io/ui/users/home/0/
Create a new LRS with any name, then within that LRS, naivgate to Management -> Access Keys and create a new access key, which will give the configuration variables above.

For Google Calendar Sync features, you must enable the Calendar API via Google Cloud Console, configure your OAuth Consent Screen with the `https://www.googleapis.com/auth/calendar.events` scope, and provision an OAuth Client ID explicitly bound to `http://localhost:3000/api/auth/callback/google` to test synchronization functionality locally.

## 2. Database Initialization

We use Prisma as our ORM. If this is a fresh pull, you must generate the client and push the schema to your database.

```bash
# Generate the Prisma Client
npx prisma generate

# Push the schema structure to your database
npx prisma db push
```

## 3. Running the API Unit Tests (Vitest)

We use Vitest to mock HTTP requests and test the specific isolated logic of the API endpoints directly (`/api/courses`, etc.). The test suites are now modularized into:
- `tests/general.api.test.ts`
- `tests/instructor.api.test.ts`
- `tests/student.api.test.ts`

```bash
# Run the entire Vitest test suite once
npx vitest run

# Run a specific Vitest suite
npx vitest run tests/student.api.test.ts

# Run Vitest in watch mode (updates automatically as you write code)
npx vitest
```

## 4. Running the Browser UI Tests (Playwright)

We use Playwright to simulate a real user opening a Chromium browser, interacting with the Unified Dashboard, and creating or enrolling in courses. The test suites are divided into:
- `tests/general.spec.ts`
- `tests/instructor.spec.ts`
- `tests/student.spec.ts`

Note: Playwright requires the Next.js development server to be actively running in the background because it hits `http://localhost:3000`.

```bash
# In Terminal 1: Start the Next.js app
npm run dev

# In Terminal 2: Run the entire Playwright test suite
npx playwright test

# Or run a specific Playwright test file
npx playwright test tests/instructor.spec.ts

# View the visual HTML report of the test results
npx playwright show-report
```

## Troubleshooting
If Playwright is failing due to timeout issues, ensure your development server is completely loaded.
