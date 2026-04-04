# Developer Guide: Demokritos

Welcome to the Demokritos project! This guide walks you through every step needed to get the application running locally from a fresh clone, including all external service setup.

---

## 1. Clone and Install Dependencies

```bash
git clone https://github.com/Zeryllium/ece1724-w26-project.git
cd ece1724-w26-project
npm install
```

---

## 2. Environment Variables

Copy the example env file and fill in the values described in the sections below:

```bash
cp .env.example .env
```

Your `.env` file needs the following variables:

```env
# App
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=

# Database
DATABASE_URL=

# Google OAuth (Calendar + Auth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Cloud Storage
S3_ACCESS_KEY_ID=
S3_ACCESS_KEY_SECRET=
S3_BUCKET_NAME=
S3_ENDPOINT=https://storage.googleapis.com
S3_REGION=
S3_FORCE_PATH_STYLE=true

# Google Gemini AI (Autograding)
GEMINI_API_KEY=

# Veracity LRS (Quiz Analytics)
LRS_ENDPOINT=
LRS_KEY=
LRS_SECRET=
```

### Generating `BETTER_AUTH_SECRET`

Run either of the following to generate a secure random secret:

```bash
openssl rand -base64 32
```

or visit https://better-auth.com/docs/installation for alternatives. Paste the result as the value of `BETTER_AUTH_SECRET`.

---

## 3. Database Setup (PostgreSQL + Prisma)

You need a running PostgreSQL instance. Set `DATABASE_URL` in your `.env` to your connection string, for example:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/demokritos"
```

Then run the following to generate the Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
```

---

## 4. Google OAuth Setup (for Auth and Calendar Sync)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or use an existing one).
2. In the left sidebar, go to **APIs & Services → Library**.
   - Search for and enable **Google Calendar API**.
3. Go to **APIs & Services → OAuth consent screen**.
   - Select **External** as the user type and click **Create**.
   - Fill in the app name (e.g. "Demokritos"), support email, and developer contact.
   - On the **Scopes** page, click **Add or Remove Scopes** and add:
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Add yourself (and any testers) as test users on the **Test Users** page.
4. Go to **APIs & Services → Credentials** and click **Create Credentials → OAuth Client ID**.
   - Application type: **Web application**.
   - Under **Authorized redirect URIs**, add: `http://localhost:3000/api/auth/callback/google`
   - Click **Create**. Copy the **Client ID** and **Client Secret** into your `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## 5. Google Cloud Storage (GCS) Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and navigate to **Cloud Storage → Buckets**.
2. Click **Create** and choose a name and region. Leave all other settings as default. **Turn off public access** (this is important).
3. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) if you have not already.
4. Apply the CORS configuration using the provided `cors-config.json` file in the repo:
   ```bash
   gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=cors-config.json
   ```
5. Verify the CORS config was applied:
   ```bash
   gcloud storage buckets describe gs://YOUR_BUCKET_NAME --format="json"
   ```
6. In the GCS Console, go to **Settings → Interoperability** and click **Create a key for a service account** (or your user account). This gives you an **Access Key** and **Secret**.
7. Fill in your `.env` with the values from step 6 and your bucket details:
   ```env
   S3_ACCESS_KEY_ID=<your_access_key>
   S3_ACCESS_KEY_SECRET=<your_secret>
   S3_BUCKET_NAME=<your_bucket_name>
   S3_ENDPOINT=https://storage.googleapis.com
   S3_REGION=<region_you_chose_e.g._us-central1>
   S3_FORCE_PATH_STYLE=true
   ```

---

## 6. Google Gemini API Key (AI Autograding)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API Key** and copy the generated key.
4. Add it to your `.env`:
   ```env
   GEMINI_API_KEY=<your_gemini_api_key>
   ```

---

## 7. Veracity LRS Setup (Quiz Analytics)

1. Create a free account at [lrs.io](https://lrs.io/ui/users/home/0/).
2. Once logged in, click **Create a new LRS** and give it any name.
3. Inside the LRS, navigate to **Management → Access Keys** and click **Create Access Key**.
4. Copy the **Endpoint**, **Key**, and **Secret** into your `.env`:
   ```env
   LRS_ENDPOINT=https://cloud.scorm.com/lrs/<your-lrs-id>/
   LRS_KEY=<your_access_key>
   LRS_SECRET=<your_access_secret>
   ```

---

## 8. Running the Development Server

Once all environment variables are set and the database is initialized, start the app:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 9. Running the API Unit Tests (Vitest)

Vitest mocks HTTP requests and tests the API endpoint logic in isolation. No running server is needed.

Test files:
- `tests/general.api.test.ts`
- `tests/instructor.api.test.ts`
- `tests/student.api.test.ts`

```bash
# Run the full test suite once
npx vitest run

# Run a specific test file
npx vitest run tests/student.api.test.ts

# Run in watch mode (re-runs on file changes)
npx vitest
```

---

## 10. Running the Browser UI Tests (Playwright)

Playwright drives a real Chromium browser against the running app. The development server must be running before you start these tests.

Test files:
- `tests/general.spec.ts`
- `tests/instructor.spec.ts`
- `tests/student.spec.ts`

```bash
# Terminal 1: Start the dev server
npm run dev

# Terminal 2: Run the full Playwright suite
npx playwright test

# Run a specific file
npx playwright test tests/instructor.spec.ts

# View the HTML test report
npx playwright show-report
```

---

## Troubleshooting

**Playwright tests timing out**: Make sure `npm run dev` has fully started and the app is accessible at `http://localhost:3000` before running tests.

**Prisma errors on startup**: Run `npx prisma generate` again after any schema changes and make sure `DATABASE_URL` is correctly set in `.env`.

**Google Calendar sync returns 403**: The OAuth consent screen scope must include `https://www.googleapis.com/auth/calendar.events`. Re-authorize through the app (it will prompt you automatically).

**GCS uploads failing**: Double-check the CORS config was applied with `gcloud storage buckets describe`. Also ensure `S3_FORCE_PATH_STYLE=true` is set.

**Gemini autograding not working**: Confirm `GEMINI_API_KEY` is valid and the key has not hit its free-tier quota limit. Check the Google AI Studio dashboard.
