# API Reference

Full documentation for the Demokritos REST API. All endpoints are served under `/api/` via Next.js App Router.

> **Authentication**: Unless stated otherwise, all endpoints require an authenticated session via [Better Auth](https://better-auth.com). Session cookies are automatically managed. Unauthenticated requests receive a `401 Unauthorized` response.

---

## Table of Contents

- [Authentication](#authentication)
- [User](#user)
- [Courses](#courses)
- [Enrollment](#enrollment)
- [Modules](#modules)
- [Submissions](#submissions)
- [Grading](#grading)
- [Comments & Discussion](#comments--discussion)
- [File Management (GCS)](#file-management-gcs)
- [Google Calendar Sync](#google-calendar-sync)
- [Quiz Analytics (LRS)](#quiz-analytics-lrs)
- [Error Handling](#error-handling)

---

## Authentication

Authentication is handled by **Better Auth** with a catch-all route. It supports email/password login and Google OAuth social sign-in.

### `GET|POST /api/auth/[...all]`

All auth operations (sign-up, sign-in, sign-out, OAuth callbacks, session management) are delegated to the Better Auth handler. See the [Better Auth documentation](https://better-auth.com/docs) for available sub-routes such as:

- `POST /api/auth/sign-up/email` — Register with email and password
- `POST /api/auth/sign-in/email` — Sign in with email and password
- `GET /api/auth/sign-in/social?provider=google` — Google OAuth sign-in
- `POST /api/auth/sign-out` — Sign out
- `GET /api/auth/session` — Get current session

**Google OAuth Scopes Requested:**
- `openid`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/calendar.events`

---

## User

### `GET /api/user`

Retrieve profile information and enrollment data for the currently authenticated user.

**Response** `200 OK`
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "STUDENT | INSTRUCTOR | ADMIN",
  "emailVerified": false,
  "image": "string | null",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601",
  "enrollments": [
    {
      "studentId": "string",
      "courseId": "uuid",
      "courseStatus": "INCOMPLETE | PASSED | DROPPED"
    }
  ]
}
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `401` | Unauthorized | Not logged in |
| `404` | User Not Found | User record does not exist in database |

---

## Courses

### `POST /api/courses`

Create a new course. The authenticated user becomes the managing instructor.

**Request Body:**
```json
{
  "courseName": "string (required)",
  "courseDescription": "string (optional)"
}
```

**Response** `201 Created`
```json
{
  "courseId": "uuid",
  "courseName": "string",
  "courseDescription": "string | null",
  "totalEnrolled": 0,
  "totalCompleted": 0,
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | courseName is required and must be a string | Missing or invalid name |
| `401` | Unauthorized | Not logged in |

---

### `PUT /api/courses/:courseId`

Update an existing course. Requires managing instructor or admin role.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | `uuid` | The unique course identifier |

**Request Body:**
```json
{
  "courseName": "string (optional)",
  "courseDescription": "string (optional)"
}
```

**Response** `200 OK` — Updated course object.

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | No fields provided to update | Empty request body |
| `400` | courseName must be a non-empty string | Invalid course name |
| `403` | Forbidden: You do not manage this course | Not the instructor/admin |
| `404` | Course not found | Invalid courseId |

---

### `DELETE /api/courses/:courseId`

Delete a course and all associated data (enrollments, modules, comments, managing records). Requires managing instructor or admin role.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | `uuid` | The unique course identifier |

**Response** `200 OK`
```json
{ "message": "Course deleted successfully" }
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `403` | Forbidden: You do not manage this course | Not the instructor/admin |
| `404` | Course not found | Invalid courseId |

---

## Enrollment

### `POST /api/courses/:courseId/enroll`

Enroll the current user in a course as a student. Increments the course's `totalEnrolled` count.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | `uuid` | The course to enroll in |

**Response** `201 Created`
```json
{
  "studentId": "string",
  "courseId": "uuid",
  "courseStatus": "INCOMPLETE"
}
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `404` | Course not found | Invalid courseId |

---

### `DELETE /api/courses/:courseId/enroll`

Drop the current user from a course. Decrements the course's `totalEnrolled` count.

**Response** `200 OK`
```json
{ "message": "Successfully dropped course." }
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `404` | Not enrolled in this course | User was not enrolled |

---

## Modules

### `POST /api/courses/:courseId/modules`

Create a new module within a course. Requires managing instructor or admin. The module is automatically assigned the next sequential index.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | `uuid` | The parent course |

**Request Body:**
```json
{
  "moduleTitle": "string (required)",
  "moduleDescription": "string (optional)",
  "moduleType": "LECTURE | ASSIGNMENT | QUIZ (required)",
  "moduleResourceUri": "string (optional, S3 path for attached files)",
  "quizConfig": {
    "timeLimit": "number (minutes)",
    "maxAttempts": "number",
    "dueDate": "ISO 8601 (optional)",
    "questions": [
      {
        "id": "string",
        "text": "string",
        "options": ["string", "string", "..."],
        "correctOptionIndex": "number"
      }
    ]
  },
  "assignmentConfig": {
    "dueDate": "ISO 8601 (required for assignments)",
    "aiGradingEnabled": "boolean (optional)",
    "aiRubric": "string (optional)",
    "aiDifficulty": "lenient | standard | strict (optional)"
  }
}
```

> **Note**: `quizConfig` is only required when `moduleType` is `QUIZ`. `assignmentConfig` is only used when `moduleType` is `ASSIGNMENT`.

**Response** `201 Created` — The created module object.

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | moduleTitle is required | Missing title |
| `400` | moduleType must be LECTURE, ASSIGNMENT, or QUIZ | Invalid type |
| `400` | Invalid quiz configuration payload | Zod validation failed |
| `403` | Forbidden: You do not manage this course | Not the instructor/admin |

---

### `PUT /api/courses/:courseId/modules/:moduleIndex`

Update an existing module. Requires managing instructor or admin.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | `uuid` | The parent course |
| `moduleIndex` | `integer` | The 1-based module index |

**Request Body:** Same fields as `POST` (all optional).

**Response** `200 OK` — Updated module object.

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | Invalid module index | Non-numeric index |
| `400` | No valid fields provided to update | Empty payload |
| `403` | Forbidden | Not the instructor/admin |
| `404` | Module not found | No module at that index |

---

### `DELETE /api/courses/:courseId/modules/:moduleIndex`

Delete a module and re-index subsequent modules. Also cleans up associated submissions.

**Response** `200 OK`
```json
{ "message": "Module deleted successfully" }
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | Invalid module index | Non-numeric index |
| `403` | Forbidden | Not the instructor/admin |
| `404` | Module not found | No module at that index |

---

## Submissions

### `POST /api/courses/:courseId/modules/:moduleIndex/start`

Initialize a quiz attempt. Records the start time for timer enforcement. If an active attempt exists and hasn't expired, it returns the existing start time (allowing resume).

**Response** `200 OK`
```json
{
  "message": "Attempt initialized",
  "activeAttemptStartTime": "ISO 8601"
}
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `403` | The deadline for this quiz has passed | Past due date |
| `403` | Maximum attempts reached | No remaining attempts |
| `404` | Quiz not found | Module isn't a quiz |

---

### `POST /api/courses/:courseId/modules/:moduleIndex/submit`

Submit a quiz attempt or an assignment.

#### Quiz Submission

**Request Body:**
```json
{
  "answers": { "<questionId>": "<selectedOptionIndex>", "..." : "..." },
  "timeSpent": "number (seconds)"
}
```

**Response** `200 OK`
```json
{
  "message": "Quiz evaluated successfully",
  "grade": 85.0,
  "isPass": true,
  "attemptsRemaining": 2
}
```

#### Assignment Submission

**Request Body:**
```json
{
  "assignmentFileUrl": "string (file ID from GCS upload)"
}
```

**Response** `200 OK`
```json
{ "message": "Assignment submitted successfully" }
```

> **AI Autograding**: If `aiGradingEnabled` is set on the assignment's configuration, the submission is automatically graded using Google Gemini AI. The grade and feedback are stored immediately.

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | Invalid submission payload | Missing answers for quiz |
| `400` | No assignment file URL provided | Missing file reference |
| `400` | Module type does not accept submissions | Lecture modules |
| `403` | The deadline for this assignment has passed | Past due date |
| `403` | Maximum attempts reached | No more quiz attempts |
| `404` | Module not found | Invalid module index |

---

## Grading

### `PUT /api/courses/:courseId/modules/:moduleIndex/grade`

Manually grade or update a student's submission. Requires managing instructor or admin.

**Request Body:**
```json
{
  "studentId": "string (required)",
  "grade": "number 0-100 (required)",
  "feedback": "string (optional)"
}
```

**Response** `200 OK`
```json
{
  "message": "Grade updated successfully",
  "submission": { "..." }
}
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | Missing studentId or grade | Incomplete payload |
| `403` | Forbidden: Not an instructor for this course | Not the instructor/admin |
| `404` | Module not found | Invalid module index |

---

## Comments & Discussion

Real-time course discussion powered by **Server-Sent Events (SSE)**.

### `GET /api/courses/:courseId/comments`

Retrieve all comments for a course, ordered by most recent first.

**Response** `200 OK`
```json
[
  {
    "commentId": "uuid",
    "text": "string",
    "authorId": "string",
    "authorName": "string",
    "authorRole": "STUDENT | INSTRUCTOR",
    "createdAt": "ISO 8601"
  }
]
```

---

### `POST /api/courses/:courseId/comments`

Post a new comment. Requires enrollment (student) or managing relationship (instructor).

**Request Body:**
```json
{
  "text": "string (required)"
}
```

**Response** `200 OK` — The created comment object.

The comment is also **broadcast in real-time** to all connected SSE clients.

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | Comment cannot be empty | Blank text |
| `403` | Please enroll to post a comment | Not enrolled/managing |

---

### `DELETE /api/courses/:courseId/comments/:commentId`

Delete a comment. Instructors can delete any comment; students can only delete their own.

**Response** `200 OK`
```json
{ "message": "Comment deleted" }
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `403` | Forbidden | Not the author or instructor |
| `404` | Not found | Comment doesn't exist or wrong course |

---

### `GET /api/courses/:courseId/comments/events`

Establish a **Server-Sent Events (SSE)** connection for real-time comment updates.

**Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Types:**
| Type | Payload | Description |
|------|---------|-------------|
| `initial` | `{ comments: Comment[] }` | Full comment list on connection |
| `new_comment` | `{ comment: Comment }` | A new comment was posted |
| `delete_comment` | `{ commentId: string }` | A comment was deleted |
| `error` | `{ message: string }` | Server-side error |

---

## File Management (GCS)

File uploads and downloads via Google Cloud Storage with S3-compatible presigned URLs.

### `POST /api/gcs/upload`

Upload a file to cloud storage. Returns a presigned URL that the client must use to PUT the actual file data.

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | `File` | The file to upload |
| `uploadType` | `string` | `MODULE` (instructor resource) or `SUBMISSION` (student submission) |
| `moduleId` | `string` | UUID of the target module |

**Response** `200 OK`
```json
{
  "signedUrl": "https://storage.googleapis.com/...",
  "key": "uploads/users/<userId>/<fileId>-<filename>",
  "fileId": "uuid"
}
```

> **Important**: The `signedUrl` expires after 5 minutes. After receiving it, the client must `PUT` the file binary to the URL. Store the `fileId` for subsequent access—do not persist the signed URL.

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | No file uploaded | Missing file |
| `400` | Invalid content type | Not multipart/form-data |
| `400` | File does not have a matching upload type | Invalid uploadType |
| `400` | File upload does not have a valid moduleId | Invalid moduleId |

---

### `GET /api/gcs/:fileId/download`

Download a file from cloud storage. Generates a short-lived presigned download URL and redirects the client to it.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `fileId` | `uuid` | The file identifier |

**Response** `302 Redirect` — Redirects to the signed download URL.

**Authorization**: Requires enrollment in the course associated with the file, or managing/admin role.

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `403` | You are not enrolled in this course | Insufficient access |
| `404` | File not found | Invalid fileId |
| `409` | Malformed Course ID | Orphaned file record |

---

### `POST /api/upload`

Legacy local file upload endpoint. Saves PDF files to `public/uploads/`.

> **Deprecated**: Prefer `/api/gcs/upload` for cloud-based storage.

**Content-Type:** `multipart/form-data`

**Response** `201 Created`
```json
{
  "success": true,
  "url": "/uploads/<uuid>-<filename>"
}
```

---

## Google Calendar Sync

### `POST /api/courses/:courseId/calendar-sync`

Sync all course deadlines (assignment and quiz due dates) to the authenticated user's Google Calendar. Requires a linked Google account with calendar permissions.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | `uuid` | The course to sync |

**Response** `200 OK`
```json
{
  "message": "Successfully synced 3 active course deadlines to your Google Calendar."
}
```

**Calendar Events Created:**
- **Summary**: `[Course Name] Due: Module Title`
- **Duration**: 1 hour block starting at the due date
- **Description**: Module description with a direct link to the module page

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `403` | Google_Account_Not_Linked | No Google OAuth tokens stored |
| `403` | Google_Insufficient_Scopes | Token lacks calendar.events scope |
| `404` | Course not found | Invalid courseId |

---

## Quiz Analytics (LRS)

Proxy endpoints for the **Veracity Learning Record Store (LRS)** using the xAPI specification.

### `POST /api/lrs`

Forward an xAPI statement to the LRS. Used by the quiz component to report student activity (starts, completions, tab switches).

**Request Body:** A valid [xAPI statement](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#statements).

```json
{
  "actor": {
    "name": "Student Name",
    "account": { "homePage": "http://ece1724.local", "name": "<studentId>" }
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": { "en-US": "completed" }
  },
  "object": {
    "id": "http://ece1724.local/course/<courseId>/module/<moduleId>"
  },
  "result": {
    "score": { "scaled": 0.85, "raw": 85, "min": 0, "max": 100 },
    "success": true,
    "duration": "PT120S"
  },
  "timestamp": "ISO 8601"
}
```

**Response** `200 OK`
```json
{ "success": true, "data": { "..." } }
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `503` | LRS capability is currently disabled | Missing LRS env vars |

---

### `GET /api/lrs`

Retrieve xAPI statements for a specific module. Requires managing instructor or admin role.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | `uuid` | The course containing the module |
| `moduleId` | `uuid` | The specific module to query |

**Response** `200 OK`
```json
{
  "success": true,
  "statements": [ { "xAPI statement objects" } ]
}
```

**Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| `400` | Missing courseId or moduleId parameters | Incomplete query |
| `403` | Forbidden: You do not manage this course | Not the instructor/admin |
| `503` | LRS capability is currently disabled | Missing LRS env vars |

---

## Error Handling

All API endpoints return errors in a consistent JSON format:

```json
{
  "error": "Human-readable error message"
}
```

### Standard HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful read/update/delete |
| `201` | Created | Successful resource creation |
| `302` | Redirect | File download redirect |
| `400` | Bad Request | Invalid input / validation failure |
| `401` | Unauthorized | No authenticated session |
| `403` | Forbidden | Insufficient permissions or scope |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Data integrity issue |
| `500` | Internal Server Error | Unexpected server failure |
| `503` | Service Unavailable | External service not configured |
