`````markdown
# 🧠 Instructure: OnboardLink Codebase Audit & Modular Refactor

**Prepared for:** Trae  
**Objective:** Inspect, isolate, and restructure the OnboardLink codebase to enforce client/server separation, strict TypeScript usage, and full alignment with Next.js 15+ architecture.

---

## 📌 Project Context

**Platform:** OnboardLink  
**Purpose:** Streamlined onboarding portal for IMTOs partnering with Sterling Bank  
**Stack Overview:**
- **Frontend:** Next.js 15.3.3, React 18, TypeScript, Tailwind, Radix UI
- **Backend:** Firebase (Auth, Firestore, Storage), Google Genkit
- **Validation:** Zod + React Hook Form
- **State Management:** React Context API

---

## 🧩 PHASE 1: Codebase Inspection & Classification

### 1. Crawl the Codebase
- Traverse the entire project directory.
- Record for every file:
  - **Path**
  - **Imports/Exports**
  - **Purpose**
  - **Execution Context:** `client`, `server`, `shared`, `hybrid`
  - **Role:** `UI`, `form`, `firebase`, `auth`, `route`, `util`, `schema`

📄 **Output:** A JSON or Markdown map of the codebase.

---

### 2. Tag All Modules
Categorize each file into one of the following:

| Tag     | Description                                                  |
|---------|--------------------------------------------------------------|
| `client` | Contains browser-only code (hooks, components, `window`)     |
| `server` | Runs exclusively on server (API handlers, Firebase Admin)    |
| `shared` | Safe to use on both client and server (schemas, types, utils)|
| `hybrid` | Contains mixed logic – must be split into clean boundaries   |

🛑 Flag and document all `hybrid` modules for refactor.

---

## 🧱 PHASE 2: Modular Codebase Restructure

### 1. Folder Structure Proposal

```plaintext
/app
  /api                → API routes & server actions
  /dashboard          → Admin & Partner UIs
  /onboarding         → Multi-step flows
/components           → UI-only, no side effects
/hooks                → Custom React hooks
/lib
  /auth               → Session, login, auth roles
  /firebase
    client.ts         → Firebase Web SDK
    admin.ts          → Firebase Admin SDK
  /schemas            → Zod validation logic
  /utils              → Pure functions
/types                → Shared types & interfaces
/middleware           → Next.js middleware (auth, logging)
````

✅ **Goal:** Clear separation of UI, server logic, validation, and configuration.

---

### 2. Firebase Logic Separation

* `lib/firebase/client.ts`

  * Firebase Web SDK (Firestore, Auth for client)
* `lib/firebase/admin.ts`

  * Admin SDK (only used in `api/` or server actions)

❌ No Admin SDK should appear in React components or `/app/page.tsx`.

---

### 3. Server Actions Implementation

Replace direct Firebase logic in routes with **typed Server Actions**:

```ts
'use server'

import { admin } from '@/lib/firebase/admin'

export async function submitApplication(formData: ApplicationData) {
  await admin.firestore().collection('submissions').add(formData)
}
```

✅ Keep all business logic **server-side**, use server actions or `/api`.

---

### 4. Zod + TypeScript Discipline

* All schemas live in `lib/schemas`
* Use `z.infer<typeof SchemaName>` for consistent typing
* Share schemas between form components and server actions

```ts
const SubmissionSchema = z.object({ companyName: z.string().min(1) })
type Submission = z.infer<typeof SubmissionSchema>
```

---

## 🧪 PHASE 3: Quality Assurance & CI/CD Setup

### 1. ESLint & Prettier

Configure:

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"]
}
```

Add scripts:

```json
"scripts": {
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write ."
}
```

---

### 2. Testing Bootstrap

Install and scaffold:

* `jest` or `vitest`
* `@testing-library/react`
* Add tests for:

  * Zod schemas
  * Firebase logic
  * API routes

---

### 3. CI/CD Prep

* Add GitHub Actions or Vercel CI:

  * Type check
  * Lint
  * Build
  * Run tests
* Setup `.env.local`, `.env.staging`, `.env.production`
* Add Husky pre-commit hooks

---

## 🛡️ PHASE 4: Security, Logging & Performance

### 1. Security Enhancements

* Ensure server-only logic is inaccessible from the client
* Validate all uploads:

  * File type
  * Size
  * Malware scan (stub/mock if needed)
* Implement rate limits on API and uploads
* Add session timeouts

---

### 2. Logging & Audit Trail

* Create logging middleware or utilities for:

  * Admin actions
  * Submission updates
  * Errors & exceptions

---

### 3. Performance & Optimization

* Use `next/image` for image delivery
* Apply lazy loading to large dashboard components
* Index Firestore collections for dashboard queries
* Use caching headers and SWR for static data

---

## ✅ FINAL DELIVERABLES

1. `codebase-map.json` – Architecture overview with tags
2. Refactored folder structure
3. Updated TypeScript-safe schemas and types
4. Secure Firebase abstraction
5. Linting + testing setup
6. Documentation:

   * Folder roles
   * Module boundaries
   * Zod schemas
   * Auth flow
7. Security audit checklist

---

## 📈 Success Criteria

| Criteria                            | Status |
| ----------------------------------- | ------ |
| Codebase modularized                | ✅      |
| Server logic separated from UI      | ✅      |
| Full TypeScript & Zod typing        | ✅      |
| Firebase usage abstracted properly  | ✅      |
| Testing & linting integrated        | ✅      |
| Clear documentation for all modules | ✅      |

---

## 🧠 Tips for Execution

* Run `pnpm type-check`, `pnpm lint`, `pnpm test` before every commit
* Keep logic dumb on the client
* Use `use server` wherever possible
* Avoid premature optimization – clean boundaries first

---

**“Structure breeds scalability. Let’s make it ironclad.”**

```