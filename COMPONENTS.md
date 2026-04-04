# Component Reference

Documentation for all React components used in the Demokritos learning platform. Components are located in the `components/` directory and are built with React (Next.js App Router) and TypeScript.

---

## Table of Contents

- [Authentication Components](#authentication-components)
- [Course Management Components](#course-management-components)
- [Module Management Components](#module-management-components)
- [Student Assessment Components](#student-assessment-components)
- [Instructor Dashboard Components](#instructor-dashboard-components)
- [Communication Components](#communication-components)
- [Layout & Navigation Components](#layout--navigation-components)
- [Wrapper Components](#wrapper-components)
- [UI Primitives](#ui-primitives)

---

## Authentication Components

### `LoginForm`

**File:** `components/LoginForm.tsx`
**Type:** Client Component (`"use client"`)

A form that handles user login via email and password using the Better Auth client SDK.

| Prop | Type | Description |
|------|------|-------------|
| — | — | No props. Uses `authClient` directly. |

**Behavior:**
- Calls `authClient.signIn.email()` on form submission
- Redirects to `/courses` on success
- Displays inline error messages on failure

---

### `LoginFormWrapper`

**File:** `components/LoginFormWrapper.tsx`
**Type:** Client Component

Wraps the `LoginForm` with additional layout and an option to switch to sign-up. Renders associated links and styling for the login page.

---

### `SignUpForm`

**File:** `components/SignUpForm.tsx`
**Type:** Client Component (`"use client"`)

Registration form for creating a new account with name, email, and password.

| Prop | Type | Description |
|------|------|-------------|
| — | — | No props. |

**Behavior:**
- Calls `authClient.signUp.email()` on form submission
- Redirects to `/courses` on success

---

### `SignUpFormWrapper`

**File:** `components/SignUpFormWrapper.tsx`
**Type:** Client Component

Wraps `SignUpForm` with layout styling and a link to switch back to login.

---

### `RoleSetter`

**File:** `components/RoleSetter.tsx`
**Type:** Client Component

Utility component for setting the user role. Typically used in admin contexts.

---

## Course Management Components

### `CoursesSection`

**File:** `components/CoursesSection.tsx`
**Type:** Client Component

Displays the main courses dashboard with sections for "Courses You Teach" and "Enrolled Courses." Provides navigation to create or browse courses.

| Prop | Type | Description |
|------|------|-------------|
| — | — | Fetches data internally. |

---

### `CreateCourseForm`

**File:** `components/CreateCourseForm.tsx`
**Type:** Client Component (`"use client"`)

Modal form for creating a new course.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| — | — | — | No props. Submits to `POST /api/courses`. |

**Fields:**
- `courseName` — Required text input
- `courseDescription` — Optional textarea

**Behavior:**
- Posts to `/api/courses`
- Refreshes the page and closes the modal on success

---

### `EditCourseForm`

**File:** `components/EditCourseForm.tsx`
**Type:** Client Component (`"use client"`)

Modal form for editing an existing course's name and description.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the course to edit |
| `currentName` | `string` | Yes | Current course name (pre-filled) |
| `currentDescription` | `string` | No | Current description (pre-filled) |

**Behavior:**
- Sends `PUT /api/courses/:courseId`
- Refreshes and navigates back on success

---

### `DeleteCourseButton`

**File:** `components/DeleteCourseButton.tsx`
**Type:** Client Component (`"use client"`)

Button that triggers course deletion with a confirmation dialog.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the course to delete |

**Behavior:**
- Prompts for confirmation via `window.confirm()`
- Sends `DELETE /api/courses/:courseId`
- Redirects to `/courses` on success

---

### `EnrollButton`

**File:** `components/EnrollButton.tsx`
**Type:** Client Component (`"use client"`)

Enrollment button that toggles between "Enroll Now" and "Enrolled" states.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the course |

**Behavior:**
- Posts to `/api/courses/:courseId/enroll`
- Refreshes the page to reflect enrollment state

---

### `CourseEditorWrapper`

**File:** `components/CourseEditorWrapper.tsx`
**Type:** Client Component

Wrapper for course editing modals, providing backdrop and close behavior.

---

## Module Management Components

### `CreateModuleForm`

**File:** `components/CreateModuleForm.tsx`
**Type:** Client Component (`"use client"`)

Comprehensive form for creating course modules (Lecture, Assignment, or Quiz).

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the parent course |

**Features:**
- Dynamic form sections based on selected `moduleType`
- **Lecture**: Title and optional description
- **Assignment**: Title, description, PDF file upload, due date, optional AI autograding configuration (rubric, difficulty level)
- **Quiz**: Title, description, time limit, max attempts, optional due date, and a full question editor with multiple-choice options

**Sub-components used:**
- Quiz question editor with add/remove question and option helpers

---

### `EditModuleForm`

**File:** `components/EditModuleForm.tsx`
**Type:** Client Component (`"use client"`)

Edit form for existing modules. Mirrors `CreateModuleForm` structure but pre-fills current values.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the parent course |
| `moduleIndex` | `number` | Yes | 1-based index of the module |
| `currentModule` | `object` | Yes | Current module data for pre-population |

---

### `DeleteModuleButton`

**File:** `components/DeleteModuleButton.tsx`
**Type:** Client Component (`"use client"`)

Button to delete a module with confirmation.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the parent course |
| `moduleIndex` | `number` | Yes | Index of the module to delete |

---

### `CreateModuleWrapper` / `EditModuleWrapper`

**Files:** `components/CreateModuleWrapper.tsx`, `components/EditModuleWrapper.tsx`
**Type:** Client Components

Modal wrappers for create/edit module forms using Next.js intercepting routes.

---

## Student Assessment Components

### `QuizTaker`

**File:** `components/QuizTaker.tsx`
**Type:** Client Component (`"use client"`)

Full-featured quiz-taking interface with timer, question navigation, and auto-submission.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the course |
| `moduleIndex` | `number` | Yes | Module index within the course |
| `moduleId` | `string` | No | UUID of the module (for LRS tracking) |
| `studentId` | `string` | No | Current student ID (for LRS tracking) |
| `studentName` | `string` | No | Current student name (for LRS tracking) |
| `studentEmail` | `string` | No | Current student email (for LRS tracking) |
| `quizConfig` | `QuizConfig` | Yes | Quiz configuration (questions, time, attempts) |
| `existingSubmission` | `any` | Yes | Previous submission data (or `null`) |

**States:**
1. **Pre-start**: Shows quiz info (questions, time limit, attempts remaining)
2. **Active**: Countdown timer, question list with radio buttons
3. **Submitted**: Grade display and attempts remaining
4. **Exhausted**: No attempts remaining message
5. **Past due**: Deadline passed, no new attempts

**Features:**
- Auto-submits when timer expires
- Resumes active attempts if user refreshes
- Sends xAPI statements to LRS on completion via `QuizTracker`
- Displays best grade from previous attempts

---

### `QuizTracker`

**File:** `components/QuizTracker.tsx`
**Type:** Client Component (`"use client"`)

Invisible tracker component that sends xAPI telemetry statements during quiz attempts.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | Course identifier |
| `moduleId` | `string` | Yes | Module identifier |
| `studentId` | `string` | Yes | Student identifier |
| `studentName` | `string` | Yes | Student display name |
| `studentEmail` | `string` | Yes | Student email |

**Tracks:**
- `initialized` — Quiz attempt started
- `suspended` — Tab visibility changes (focus lost)
- Page unload events

---

### `AssignmentTaker`

**File:** `components/AssignmentTaker.tsx`
**Type:** Client Component (`"use client"`)

Assignment submission interface with file upload, grade display, and resubmission.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the course |
| `moduleIndex` | `number` | Yes | Module index |
| `moduleId` | `string` | Yes | UUID of the module |
| `studentId` | `string` | Yes | Current student ID |
| `existingSubmission` | `any \| null` | Yes | Previous submission data |
| `dueDate` | `string` | No | ISO 8601 deadline |

**States:**
1. **Not submitted**: File upload form (PDF only)
2. **Submitted**: Shows submission timestamp, download link, and resubmit option
3. **Graded**: Displays grade (0-100), pass/fail status, and instructor/AI feedback
4. **Past due**: Upload disabled, "Deadline Passed" badge

**Upload Flow:**
1. Client uploads file via `POST /api/gcs/upload` to get a signed URL
2. Client PUTs file binary to the signed URL
3. Client submits the file ID via `POST /api/courses/:courseId/modules/:moduleIndex/submit`

---

## Instructor Dashboard Components

### `InstructorAssignmentGrader`

**File:** `components/InstructorAssignmentGrader.tsx`
**Type:** Client Component (`"use client"`)

Table view of all student submissions for an assignment, with inline grading controls.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `submissions` | `any[]` | Yes | Array of submission objects with student data |
| `courseId` | `string` | Yes | UUID of the course |
| `moduleIndex` | `number` | Yes | Module index for the grade API |

**Features:**
- Tabular display: student name/email, submission date, PDF download link
- Inline grade input (0-100) and feedback textarea per student
- "Save Grade" button per row via `PUT /api/courses/:courseId/modules/:moduleIndex/grade`

---

### `InstructorLrsDashboard`

**File:** `components/InstructorLrsDashboard.tsx`
**Type:** Client Component (`"use client"`)

Analytics dashboard showing quiz behavioral data from the Veracity LRS.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | Course identifier |
| `moduleId` | `string` | Yes | Module identifier |

**Metric Cards Displayed:**
| Metric | Description |
|--------|-------------|
| Total Starts | Number of quiz `initialized` events |
| Completions | Number of quiz `completed` events |
| Avg Duration | Mean time to complete |
| Avg Tab Switches | Mean `suspended` events per student |

---

## Communication Components

### `DiscussionForum`

**File:** `components/DiscussionForum.tsx`
**Type:** Client Component (`"use client"`)

Real-time course discussion forum powered by Server-Sent Events (SSE).

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the course |
| `currentUserId` | `string` | Yes | ID of the logged-in user |
| `canPost` | `boolean` | Yes | Whether the user can post comments |
| `canDelete` | `boolean` | Yes | Whether the user can delete any comment (instructor privilege) |

**Features:**
- Live comment updates via SSE connection to `/api/courses/:courseId/comments/events`
- Auto-reconnect on connection loss (3-second retry)
- New comment posting with form validation
- Comment deletion (own comments or all comments for instructors)
- Instructor comments highlighted with a red "INSTRUCTOR" badge
- Comments sorted by most recent first

---

### `CourseCalendar`

**File:** `components/CourseCalendar.tsx`
**Type:** Client Component (`"use client"`)

Interactive monthly calendar view showing assignment and quiz deadlines, with Google Calendar sync.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseId` | `string` | Yes | UUID of the course |
| `modules` | `any[]` | Yes | Array of course module objects |

**Features:**
- Monthly calendar grid with day cells
- Color-coded event indicators (green = Assignment, orange = Quiz)
- Click events link to the module detail page
- "Today" highlight
- Month navigation (previous/next)
- **Google Calendar Sync** button:
  - Posts to `/api/courses/:courseId/calendar-sync`
  - Automatically triggers Google re-authentication if scope is insufficient
  - Shows sync status messages

---

## Layout & Navigation Components

### `Navbar`

**File:** `components/Navbar.tsx`
**Type:** Client Component (`"use client"`)

Top navigation bar with branding and user controls.

**Features:**
- "Demokrit.os" brand link to `/courses`
- User name display
- Sign-out button via `authClient.signOut()`
- Responsive layout

---

### `SimpleModalWrapper`

**File:** `components/SimpleModalWrapper.tsx`
**Type:** Client Component

Generic modal overlay with backdrop click-to-close behavior. Used by course and module forms.

---

## Wrapper Components

These are lightweight wrapper components that bridge server and client component boundaries in Next.js.

| Component | File | Purpose |
|-----------|------|---------|
| `CourseEditorWrapper` | `CourseEditorWrapper.tsx` | Wraps course editing modal |
| `CreateModuleWrapper` | `CreateModuleWrapper.tsx` | Wraps module creation modal |
| `EditModuleWrapper` | `EditModuleWrapper.tsx` | Wraps module editing modal |
| `LoginFormWrapper` | `LoginFormWrapper.tsx` | Wraps login form with layout |
| `SignUpFormWrapper` | `SignUpFormWrapper.tsx` | Wraps sign-up form with layout |

---

## UI Primitives

### `components/ui/`

Contains base UI components from **shadcn/ui** adapted for the project's design system. These provide consistent styling for buttons, inputs, and other interactive elements.

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `ui/button.tsx` | Styled button with variants (default, outline, ghost, etc.) |

### Shared Styles

Design tokens and reusable TailwindCSS class strings are defined in `lib/ui.ts`:
- `buttonBlueIndigo` — Primary action button style
- `buttonGrey` — Secondary/neutral button style
- `textH2Style` — Section heading style

---

## Component Architecture

```
components/
├── ui/                              # shadcn/ui base primitives
│   └── button.tsx
├── AssignmentTaker.tsx              # Student assignment submission
├── CourseCalendar.tsx               # Calendar view + Google sync
├── CourseEditorWrapper.tsx          # Modal wrapper
├── CoursesSection.tsx               # Main course dashboard
├── CreateCourseForm.tsx             # Course creation form
├── CreateModuleForm.tsx             # Module creation (lecture/quiz/assignment)
├── CreateModuleWrapper.tsx          # Modal wrapper
├── DeleteCourseButton.tsx           # Course deletion
├── DeleteModuleButton.tsx           # Module deletion
├── DiscussionForum.tsx              # Real-time comments (SSE)
├── EditCourseForm.tsx               # Course editing form
├── EditModuleForm.tsx               # Module editing form
├── EditModuleWrapper.tsx            # Modal wrapper
├── EnrollButton.tsx                 # Course enrollment
├── InstructorAssignmentGrader.tsx   # Submission grading table
├── InstructorLrsDashboard.tsx       # Quiz analytics dashboard
├── LoginForm.tsx                    # Email/password login
├── LoginFormWrapper.tsx             # Login page wrapper
├── Navbar.tsx                       # Top navigation bar
├── QuizTaker.tsx                    # Quiz attempt interface
├── QuizTracker.tsx                  # xAPI telemetry (invisible)
├── RoleSetter.tsx                   # Role management utility
├── SignUpForm.tsx                   # Registration form
├── SignUpFormWrapper.tsx            # Sign-up page wrapper
└── SimpleModalWrapper.tsx           # Generic modal overlay
```
