# AI Interaction Records
## Session 1: Diagnosing Google Calendar Sync 403 Scope Error

### Prompt (sent to AI)

"I'm getting this error when trying to sync a course's deadlines to Google Calendar:

```
Google Calendar Sync Error: Error: Request had insufficient authentication scopes.
    at async POST (app\api\courses\[courseId]\calendar-sync\route.ts:67:12)
  code: 403,
  status: 403
```
The user is already signed in with Google OAuth through Better Auth. Why would the scopes be insufficient?"

### AI Response (trimmed)

"The issue is that your initial Google OAuth sign-in flow only requests the basic profile and email scopes. The `calendar.events` scope (`https://www.googleapis.com/auth/calendar.events`) is a sensitive scope that must be explicitly requested during the OAuth consent step.

Better Auth stores the access token and refresh token in the `Account` table from the original sign-in. If the user signed in before the calendar scope was added to the OAuth consent screen, their stored token will not have that permission, and any call to `calendar.events.insert()` will return a 403.

**Suggested fix:** Re-trigger the OAuth consent flow with the additional scope using `authClient.linkSocial()`, passing the required scope. Check the stored token's scope before calling the Calendar API, and if it's missing `calendar.events`, return an error code the frontend can detect and use to prompt re-authorization."

### What the Team Did With It

- **What was useful:** The diagnosis was correct. The root cause was that the `calendar.events` scope had not been included in the original OAuth sign-in request, so the stored token in the `Account` table lacked that permission. The suggestion to use `authClient.linkSocial()` to trigger an incremental authorization was the right approach for Better Auth specifically.

- **What was incorrect, misleading, or not applicable:** The AI suggested checking the stored token's scope string before calling the API, but in practice the scope field in the `Account` table is not always reliably populated in Better Auth's schema. Instead of checking the token upfront, the team implemented a try/catch around the `calendar.events.insert()` call and specifically caught the `403` status code. When a 403 is caught, the API route returns a structured JSON error with the key `Google_Insufficient_Scopes` rather than a generic 500.

- **How it was verified:** The frontend `CalendarSyncButton` component was updated to read this specific error code and, when detected, call `authClient.linkSocial({ provider: "google", scopes: ["https://www.googleapis.com/auth/calendar.events"] })` automatically. This triggers a Google consent popup for the missing scope without ending the user's session. The full flow was tested manually end-to-end: signing in with a fresh Google account, attempting a calendar sync (which triggers the 403 and re-auth popup), granting the scope, and then retrying the sync successfully with events appearing in Google Calendar.

## Session 2: Integrating xAPI Statement Forwarding and Gemini AI Autograding

### Prompt (sent to AI)

"We need two things. First, we want to send xAPI statements to a Veracity LRS when a student submits a quiz, so instructors can see analytics. The LRS uses HTTP Basic Auth with a key and secret. Second, we want to optionally autograde assignment PDF submissions using the Gemini API. The instructor sets a rubric and strictness level when creating the assignment, and when a student submits, Gemini should read the PDF, apply the rubric, and return a numeric grade (0 to 100) with written feedback. Both of these need to be secure and only work for authenticated users. Where do we put this logic and how do we structure it?"

### AI Response (trimmed)

"For the LRS integration, create a Next.js API route (`/api/lrs`) that acts as a secure proxy. The frontend should never hold the LRS key and secret directly, instead it sends the raw xAPI statement to your route, and the route adds the `Authorization: Basic <base64(key:secret)>` header and forwards it to `<LRS_ENDPOINT>/statements` with `X-Experience-API-Version: 1.0.3`. For the GET side, accept `courseId` and `moduleId` query params, verify the requesting user is an instructor for that course, then query the LRS filtering by activity ID.

For the Gemini autograder, install `@google/genai`. When a student submits, check if `assignmentConfig.aiGradingEnabled` is true, then upload the PDF to Gemini's File API using `ai.files.upload()` referencing a local file path. Use `ai.models.generateContent()` with `responseMimeType: 'application/json'` and a `responseSchema` to get a structured `{ grade: number, feedback: string }` back. Store both in the submission's `assignmentState` JSON field."

### What the Team Did With It

- **What was useful:** The proxy pattern for the LRS was exactly right. By keeping credentials server-side and constructing the `Basic` auth header at runtime from environment variables matched how Veracity's API works. The AI also correctly identified that the GET endpoint needed a course ownership check before exposing any student data, which we implemented using the existing `isManaging()` helper. The `responseSchema` approach for Gemini structured output was accurate and worked without modification.

- **What was incorrect, misleading, or not applicable:** The AI suggested passing a local file path directly to `ai.files.upload()`, assuming the PDF would already be on the server's filesystem from a local upload endpoint. In our architecture, student submissions are stored in Google Cloud Storage (not locally), so the file path never exists on the server. We had to add a GCS download step first: fetch the file record from the database using the stored `fileId`, issue a `GetObjectCommand` against the S3-compatible GCS endpoint to stream the bytes, write them to `os.tmpdir()`, pass that temp path to Gemini, and delete the temp file in a `finally` block afterward.

- **How it was verified:** The LRS proxy was tested by submitting a quiz as a student and confirming the xAPI statement appeared in the Veracity dashboard under the correct activity ID. The AI grader was tested end-to-end by creating an assignment with a rubric, submitting a real PDF as a student, and confirming the submission record in the database had a non-zero `submissionGrade` and a populated `instructorFeedback` string. The instructor grading panel was also verified to display the AI-generated feedback alongside the grade.

## Session 3: Debugging GCS Pre-signed URL Checksum Mismatches
 
### Prompt (sent to AI)
 
"We are trying to upload student assignment PDFs directly to Google Cloud Storage using pre-signed URLs generated by `@aws-sdk/s3-request-presigner`. The backend successfully generates the URL, but when the browser tries to make a PUT request to that URL, GCS rejects it with a `403 AccessDenied` error. The terminal says the route ran successfully, but the browser network tab shows it failing. Here is our `PutObjectCommand`:
```typescript
const command = new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: key,
  Body: fileBuffer,
  ContentType: file.type || "application/octet-stream",
});
```
"
 
### AI Response (trimmed)
 
"The `403 AccessDenied` error is happening because of a Signature Mismatch. When you include the `Body` parameter in the `PutObjectCommand` while generating a pre-signed URL, the AWS SDK calculates a SHA256 or CRC32 checksum of that body and bakes it into the signed URL's authorized headers. 

However, when the client browser actually performs the `PUT` request, it likely isn't sending those exact calculated checksum headers, causing GCS to reject the payload. 

**Solution:** Remove the `Body: fileBuffer` parameter from your `PutObjectCommand` when generating the pre-signed URL. You are only signing the *intent* to upload a file of a certain type, you don't need to pass the file buffer to the presigner. You can optionally add `ContentLength: file.size` instead for validation."
 
### What Your Team Did With It
 
- **What was useful:** The technical explanation of how the AWS SDK Presigner handles the `Body` parameter was spot on. Removing the `Body` parameter instantly fixed the signature mismatch and allowed the browser's `PUT` request to succeed. It also saved our server memory since we no longer needed to read the entire `fileBuffer` into memory just to generate a URL.

- **What was incorrect, misleading, or not applicable:** The AI didn't address *why* the frontend was failing silently. We discovered that when GCS rejects a pre-signed URL upload, it returns an XML formatted error instead of JSON. Our frontend React components (`CreateModuleForm`, `AssignmentTaker`) were trying to parse the error with `await res.json()`, which was throwing an unhandled JSON parsing exception and halting the application. We had to adapt our frontend error handling to use `await res.text()` to cleanly catch and display the GCS XML errors.

- **How it was verified:** We tested the fix by attempting to upload a large PDF assignment file as a student. We verified in the browser's Network tab that the `PUT` request returned a `200 OK` and that no checksum headers were unexpectedly required. We also checked the Google Cloud Console to confirm the file actually appeared in the correct bucket path, and then implemented the XML text backup parser in our frontend catch blocks.