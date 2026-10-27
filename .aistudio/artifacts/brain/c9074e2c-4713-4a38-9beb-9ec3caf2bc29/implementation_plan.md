# Implementation Plan: Automatic Fullscreen Landscape Mode & Quiz Security

Implement browser-native Fullscreen and Screen Orientation Lock (`screen.orientation.lock('landscape')`) for Notes (HTML, PDF, Google Drive) with seamless return to normal view, plus Fullscreen and anti-cheat security measures for Quizzes.

---

## 1. Notes Experience: Fullscreen + Landscape Orientation Lock

### 1.1 Trigger on Note Open (`app/subject/[id]/page.js`)
When a student taps "Open & Read →" on any note (HTML, PDF, or Google Drive):
1. **Request Fullscreen**: Call `modalRef.requestFullscreen()` or `document.documentElement.requestFullscreen()` on the user's click interaction (satisfying the browser's user-gesture requirement).
2. **Lock Orientation to Landscape**: Call `screen.orientation.lock('landscape')` or `screen.orientation.lock('landscape-primary')` inside a `try...catch` block.
3. **Smooth Fallback**: If orientation lock is unsupported (e.g. standard desktop or non-supported browser), render in full responsive landscape container without throwing errors or freezing.

### 1.2 Clean Exit & Loop Prevention ("ghoomte na rahe")
Prevent any freezing or getting stuck upon exit:
- **Unified Exit Handler**:
  - Unlocks orientation: `screen.orientation.unlock()`
  - Exits fullscreen: `if (document.fullscreenElement) document.exitFullscreen()`
  - Closes the active note state cleanly.
- **Event Listeners**:
  - Listen to `fullscreenchange` and `webkitfullscreenchange`: if the student exits fullscreen using the Android back button, swipe gesture, or Esc key, automatically unlock orientation and close the reader modal cleanly.
  - Listen to `keydown` (Escape key): perform safe exit.
  - Floating prominent "✕ Close Reader" button at top-right for intuitive one-tap exit.

---

## 2. Quiz Experience: Fullscreen + Quiz Security Features

### 2.1 Trigger on Quiz Start
When a student taps "Start Quiz →":
1. **Enter Fullscreen (Natural Orientation)**: Does NOT force landscape orientation, keeping standard convenient mobile reading orientation.
2. **Security & Integrity Shield**:
   - **Tab Switch & Focus Detection**: Listen to `visibilitychange` and `window.blur`. If student leaves the quiz or switches tabs, show a warning toast.
   - **Fullscreen Integrity**: If student minimizes or exits fullscreen during the quiz, display a warning modal prompting them to resume fullscreen or submit.
   - **Content Protection**: Disable text selection (`user-select: none`), right-click context menu (`contextmenu` preventDefault), and copy-paste shortcuts (`copy`, `cut`, `paste` preventDefault) inside the quiz container.
   - **Submission / Close**: Exits fullscreen and removes security listeners cleanly.

---

## 3. UI Styling & Optimizations

- Fullscreen note reader styled with a distraction-free dark theme (`#020d1c`), optimized landscape aspect ratios for wide tables, code blocks, Google Drive preview embeds, and PDFs.
- Floating semi-transparent top control bar containing:
  - Document Title & type badge
  - "Open in New Tab" link (for external PDFs/Drive)
  - Clear "✕ Exit Fullscreen" button with high hit-target area.

---

## 4. Verification & Testing

1. Open HTML notes, Google Drive PDFs, and direct PDF notes on mobile / responsive view to verify automatic Fullscreen + Landscape orientation lock trigger.
2. Exit via top Close button, Esc key, and back gesture to confirm immediate unlock and zero freezing/infinite loading.
3. Open Quizzes to verify Fullscreen activation in natural orientation and test anti-cheat protections (context menu prevention, copy prevention, tab switch notice).
4. Run `compile_applet` and `lint_applet` to confirm clean build.
