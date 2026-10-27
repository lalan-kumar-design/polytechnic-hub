# Implementation Plan: Firebase Admin Portal & Dynamic Learning Hub

Integrate Firebase Authentication and Cloud Firestore into Polytechnic Hub using the provided project credentials (`polytechnic-hub-82685`), create an `/admin` management portal, and dynamically connect students' course/semester views to live Firestore content.

---

## 1. Firebase Configuration & Data Model

### 1.1 Firebase Client Setup (`lib/firebase/config.js`)
Initialize Firebase App, Authentication, and Firestore using the provided configuration:
- `projectId: "polytechnic-hub-82685"`
- `apiKey`, `authDomain`, `storageBucket`, `messagingSenderId`, `appId`

### 1.2 Firestore Collections Architecture
- **`branches`**: Pre-seeded and custom branches (`civil`, `electrical`, `mechanical`, `computer-science`, `electronics`).
- **`subjects`**:
  - `id`: string
  - `name`: string (e.g. "Applied Mathematics - I")
  - `branchId`: string
  - `semester`: number (1 - 6)
  - `code`: string (optional course code)
  - `createdAt`: timestamp
- **`folders`**:
  - `id`: string
  - `subjectId`: string
  - `title`: string (e.g. "Unit 1: Differential Calculus", "2024 Previous Year Questions")
  - `order`: number
- **`notes`**:
  - `id`: string
  - `subjectId`: string
  - `folderId`: string (or root)
  - `title`: string
  - `contentType`: `"html"` | `"pdf_url"` | `"drive_link"`
  - `content`: string (HTML code, direct PDF link, or Google Drive sharing link)
  - `description`: string
  - `createdAt`: timestamp
- **`quizzes`**:
  - `id`: string
  - `subjectId`: string
  - `folderId`: string
  - `title`: string
  - `contentType`: `"html"` (HTML code containing interactive quiz widgets or forms)
  - `createdAt`: timestamp

---

## 2. Admin Portal (`/admin`)

### 2.1 Admin Authentication (`app/admin/page.js`)
- Accessible at `/admin`.
- If unauthenticated, displays the dark blue Polytechnic Hub branded Admin Login form:
  - Email & Password login with Firebase `signInWithEmailAndPassword`.
  - First-time Initial Admin Setup toggle: if no admin exists or user wants to register the primary admin email/password, allows creating the initial admin with `createUserWithEmailAndPassword`.
- When authenticated, displays the full Admin Dashboard.

### 2.2 Admin Dashboard Features
- **Header & Stats**: Total branches, subjects, folders, notes, and quizzes count; quick logout button.
- **Subject Management**:
  - Select Branch & Semester (1st to 6th).
  - Add new subject with title, code, and icon.
  - Edit and delete existing subjects.
- **Folder Management**:
  - Create units/folders inside any subject (e.g., "Unit 1", "Unit 2", "PYQ Papers", "Reference Materials").
  - Organize notes and quizzes cleanly under folders.
- **Notes Publisher**:
  - Add notes with selection of content format:
    1. **Raw HTML**: Rich interactive content or styled lecture notes with live preview.
    2. **Direct PDF URL**: Link to any web-hosted PDF file.
    3. **Google Drive Link**: Auto-converts standard Google Drive sharing links (`/view`, `/file/d/...`) into embeddable / previewable viewers.
- **Quiz Publisher**:
  - Publish HTML quizzes directly into folders with immediate preview.
- **Live Content Listing**:
  - Instant list of all created items with deletion and editing controls.

---

## 3. Dynamic Student Experience

### 3.1 Course & Branch Selection (`app/courses/page.js`)
- Displays engineering branches with live subject counts retrieved from Firestore.
- Selecting a branch navigates to the semester selector with that branch in context.

### 3.2 Semester Selection (`app/semester/page.js` & `app/semester/[semester]/page.js`)
- Select semester (1st to 6th).
- `/semester/[semester]`: Dynamically fetches and displays subjects for that semester and branch from Firestore.
- Clicking any subject opens the subject content view (`/subject/[id]`).

### 3.3 Dynamic Subject & Content Viewer (`app/subject/[id]/page.js`)
- Displays all folders (Units, PYQ, Quizzes) for that subject.
- Notes reader:
  - If **HTML**: Renders the formatted HTML notes cleanly within the hub styling.
  - If **PDF or Google Drive**: Embeds responsive viewer with direct open/download options.
- Quiz tab:
  - Renders interactive quizzes embedded seamlessly.

---

## 4. Dependencies & Verification

### 4.1 Dependency Installation
- Install `firebase` package via `install_applet_package`.

### 4.2 Verification Steps
1. Verify package installation and dev server status.
2. Verify `/admin` route loads login screen and initial admin creation works.
3. Test creating a subject, creating a folder, and publishing:
   - An HTML note
   - A Google Drive link note
   - An HTML quiz
4. Test student view at `/semester/[semester]` and `/subject/[id]` to verify live rendering and responsive viewers.
5. Run `compile_applet` and `lint_applet` to confirm zero errors.
