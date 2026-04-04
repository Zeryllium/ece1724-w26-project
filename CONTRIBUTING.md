# Contributing to Demokritos

Thank you for your interest in contributing to **Demokritos**! We welcome contributions of all kinds—bug fixes, new features, documentation improvements, and more. This guide walks you through the process.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community and the project
- Show empathy towards other community members

---

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/ece1724-w26-project.git
   cd ece1724-w26-project
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your environment**: Copy `.env.example` to `.env` and fill in the required values. See the [Development Guide](README.md#development-guide) for detailed setup instructions.
5. **Initialize the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## Development Workflow

1. Create a new branch from `main` for your feature or fix.
2. Make your changes with clear, small commits.
3. Write or update tests to cover your changes.
4. Ensure **all tests pass** before submitting.
5. Open a **Pull Request** against `main`.

---

## Branching Strategy

| Branch Pattern | Purpose |
|---|---|
| `main` | Production-ready code |
| `feature/<description>` | New features (e.g., `feature/quiz-analytics`) |
| `fix/<description>` | Bug fixes (e.g., `fix/calendar-scope-error`) |
| `docs/<description>` | Documentation changes (e.g., `docs/api-reference`) |
| `refactor/<description>` | Code refactoring with no behavior changes |

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Each commit message should be structured as:

```
<type>(<scope>): <short description>

<optional body>
```

**Types:**
- `feat` — A new feature
- `fix` — A bug fix
- `docs` — Documentation only changes
- `style` — Formatting, missing semicolons, etc. (no logic change)
- `refactor` — Code restructuring without changing behavior
- `test` — Adding or updating tests
- `chore` — Build process, dependency updates, etc.

**Examples:**
```
feat(quiz): add time-limit enforcement on quiz submission
fix(calendar): resolve insufficient OAuth scopes for Google Calendar sync
docs(api): add endpoint documentation for /api/courses
test(enrollment): add unit tests for enrollment edge cases
```

---

## Pull Request Process

1. **Ensure your branch is up-to-date** with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. **Run the full test suite**:
   ```bash
   npx vitest run
   ```
3. **Open a Pull Request** with:
   - A clear title following the commit message convention
   - A description of **what** changed and **why**
   - Links to any related issues
   - Screenshots or recordings for UI changes
4. **Address review feedback** promptly and push updates.
5. **Squash commits** before merging if requested.

### PR Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] All existing tests pass (`npx vitest run`)
- [ ] New features include corresponding tests
- [ ] Documentation is updated if applicable
- [ ] No sensitive data (API keys, secrets) is committed

---

## Coding Standards

### TypeScript

- Use **TypeScript** for all source files.
- Prefer explicit types over `any` where feasible.
- Use `interface` for object shapes and `type` for unions/intersections.

### React Components

- Use **functional components** with hooks.
- Mark client components with `"use client"` at the top of the file.
- Keep components focused—split large components into smaller sub-components.
- Use existing shared styles from `lib/ui.ts` for consistency.

### API Routes

- All API routes are in `app/api/` following the Next.js App Router convention.
- Always validate and sanitize user input before processing.
- Return consistent JSON error responses with an `error` field:
  ```json
  { "error": "Description of the error" }
  ```
- Use appropriate HTTP status codes (400, 401, 403, 404, 500).
- Authenticate endpoints using `auth.api.getSession()` where required.

### Database

- Use **Prisma ORM** for all database interactions.
- When making schema changes, create a migration:
  ```bash
  npx prisma migrate dev --name <migration-name>
  ```
- Use `prisma.$transaction()` for operations that must be atomic.

### Styling

- Use **Tailwind CSS** for styling.
- Follow the existing color palette and spacing conventions.
- Use the shared design tokens from `lib/ui.ts`.

---

## Testing

### Unit Tests (Vitest)

We use **Vitest** to test API route logic with mocked HTTP requests.

```bash
# Run all tests once
npx vitest run

# Run a specific test file
npx vitest run tests/student.api.test.ts

# Run in watch mode
npx vitest
```

### End-to-End Tests (Playwright)

We use **Playwright** for browser-based UI testing. The dev server must be running.

```bash
# Terminal 1: Start the app
npm run dev

# Terminal 2: Run Playwright tests
npx playwright test

# View results
npx playwright show-report
```

### Writing Tests

- Place API unit tests in `tests/` with the naming pattern `*.api.test.ts`.
- Place Playwright tests in `tests/` with the naming pattern `*.spec.ts`.
- Test both **success** and **failure** paths.
- Mock external dependencies (database, cloud storage) in unit tests.

---

## Reporting Issues

If you find a bug or have a feature request:

1. **Search existing issues** to avoid duplicates.
2. **Open a new issue** with:
   - A clear, descriptive title
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Screenshots or error logs if applicable
   - Your environment details (OS, Node.js version, browser)

---

## Questions?

If you have questions about contributing, feel free to email [rohan.datta@mail.utoronto.ca].

Thank you for helping make Demokritos better! 🎓
