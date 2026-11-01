# Hometasks

Here is a comprehensive developer prompt alongside a complete Product Requirement Document (PRD) tailored for an AI agent (such as Devin, Cursor, or Claude Code) to build the app end-to-end.
Part 1: Developer / Agent Prompt
Copy and paste this prompt directly into your AI coding agent:
You are an expert full-stack engineer building a responsive, multi-device household chore management Progressive Web App (PWA) called "HomeTasker".

### Objective
Create a simple, visual, synchronized daily checklist and scheduling web app tailored for domestic workers and household managers (husband/wife). It must run smoothly on phones, desktops, and wall-mounted tablets (iPad/Android).

### Core Requirements
1. **Multi-device Live Sync:** Real-time task status updates across multiple connected devices (Admin: Husband/Wife, Worker: Tablet/Phone).
2. **Visual-First Interface:** Every task must prominently display an Emoji or icon so it can be understood from a distance without reading dense text (e.g., 🧺 Laundry, 🧹 Floor Cleaning, 🚿 Bathroom, 🪴 Water Plants, 🍽️ Dishes).
3. **Task Checklist & Status:** Clicking/tapping a task toggles its completion (either hides it or dims/crosses it out).
4. **Task Scheduling & Views:**
   - Daily view (today's schedule).
   - Weekly/monthly recurring tasks.
   - Assignment with specific dates, times, and priority.
5. **Task Management (Admin):** Ability to quickly add, edit, reorder, and schedule tasks with emoji pickers, titles, times, and recurrences.
6. **Tablet / Kiosk Mode:** Clean, large-card UI mode with high contrast and big tap targets suitable for an old mounted tablet.

### Tech Stack Recommendation
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Lucide-react, Radix UI / Shadcn UI.
- **Backend/Database:** Supabase (PostgreSQL with Realtime enabled) or Firebase Firestore for zero-config live multi-device syncing.
- **PWA:** `next-pwa` or Vite PWA for installable fullscreen tablet support.

Proceed step-by-step: design the database schema, implement the responsive layout with tablet support, integrate realtime sync, and add rich visual chore templates.

Part 2: Product Requirement Document (PRD)
Product Requirement Document (PRD)
Project Name: HomeTasker (Household Chore & Routine Tracker)
Document Version: 1.0
Target Platform: Web / Mobile / Tablet (Progressive Web App)
1. Executive Summary & Problem Statement
In households with domestic workers, verbal instructions and fragmented reminders often lead to forgotten chores (e.g., watering plants, laundry days, bathroom sanitation), especially in busy households with small children. Language or literacy barriers can also make dense text lists inefficient.
Solution: A visual, multi-device, real-time shared checklist optimized for glanceability using prominent emojis, automatic recurring schedules, and seamless synchronization across phones and a shared wall-mounted tablet.
2. User Personas
 * House Manager (Admin - Husband/Wife): Needs to set up daily/weekly routines, assign specific times/dates, add one-off tasks, and monitor progress remotely from their smartphones.
 * Domestic Helper (Worker/Viewer): Needs an intuitive, high-visibility visual checklist on a dedicated tablet or personal phone to check off tasks as they are finished.
3. Core Features & Functional Requirements
3.1. Visual Checklist & Task Interaction
 * Visual Representation: Every task must include an emoji or icon (e.g., 🧺, 🧹, 🚿, 🪴, 🍽️) that renders prominently in large size (minimum 28–36px).
 * Toggle Completion: Tapping a task triggers a toggle interaction:
   * Option A (Default): Task dims (opacity reduced to 40%) and applies a strikethrough.
   * Option B: Task moves to a collapsed "Completed" section or disappears from the active view.
 * Reset Routine: Daily recurring tasks automatically uncheck/reset every midnight (configurable timezone).
3.2. Scheduling & Recurrence Engine
 * Cadence Options:
   * Daily: Tasks repeating every day (e.g., wash dishes, sweep floor).
   * Weekly Routine: Tasks repeating on specific weekdays (e.g., Laundry on Sun/Wed, Bathroom cleaning on Saturdays).
   * One-off / Scheduled: Specific tasks assigned to a particular date and optional time.
 * Time & Ordering: Ability to order tasks chronologically (morning, afternoon, evening) or by custom drag-and-drop priority.
3.3. Multi-Device Real-Time Sync
 * Instant bidirectional synchronization across:
   * Admin Phone A (e.g., Husband)
   * Admin Phone B (e.g., Wife)
   * Dedicated Tablet (mounted in the kitchen/laundry area)
   * Helper Phone (optional)
 * When a task is marked complete on any device, all other active screens update in real time (< 500ms latency).
3.4. Tablet / Kiosk Display Mode
 * Dedicated full-screen, high-contrast dashboard layout optimized for older or smaller tablets.
 * Prevents device sleep (via Screen Wake Lock API) when in Kiosk Mode.
 * Oversized touch targets (minimum 64px height per item) for easy interaction.
4. Data Model (Schema)
-- Household / Account
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Task Definition / Templates
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📋',
  category TEXT, -- e.g., 'Cleaning', 'Laundry', 'Outdoor'
  recurrence_type TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'custom', 'once'
  recurrence_days INT[], -- [1, 3, 5] for Mon/Wed/Fri (0 = Sunday)
  scheduled_time TIME,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Task Executions (Daily logs)
CREATE TABLE task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by TEXT, -- optional name/role
  UNIQUE(task_id, log_date)
);

5. Screen Layout & UX Specifications
| Screen | Key Elements |
|---|---|
| Today's Checklist (Main View) | Top date header, progress bar (e.g., "5 of 8 completed"), task list sorted by time/priority. Large cards with emoji on the left, bold title, time badge, and big checkbox on the right. |
| Add / Edit Task Modal | Emoji selector/grid, task name input, frequency picker (Daily, Weekly, Specific Date), time picker, and preview card. |
| Weekly Schedule View | Calendar/grid view displaying days of the week and which recurring chores fall on which days. |
| Tablet Kiosk View | Stripped-down interface removing admin settings, maximizing task font size, and displaying clock and completion status. |
6. Pre-Configured Starter Chores
The app should come seeded with these defaults for quick setup:
 * 🧺 غسيل الملابس / Laundry (Daily / Bi-weekly)
 * 🧹 مسح وتنظيف الأرضيات / Floor Mopping (Daily)
 * 🚿 تنظيف الحمام / Bathroom Cleaning (Weekly)
 * 🪴 سقي الزرع / Water Plants (2x per week)
 * 🍽️ غسيل الصحون والمطبخ / Dishwashing & Kitchen (Daily)
7. Implementation Roadmap for the Agent
 * Sprint 1 (Scaffolding & DB): Set up Next.js app, configure Supabase project, initialize tables, and enable Realtime on task_logs and tasks.
 * Sprint 2 (UI & Checklist): Build responsive task card components with emoji rendering, completion strike/dim toggles, and sound/haptic feedback.
 * Sprint 3 (Real-Time & Sync): Connect multiple test client sessions to verify instantaneous state updating across tabs/devices.
 * Sprint 4 (Recurrence & Admin Tools): Implement scheduling logic, midnight auto-reset, and quick task creation modal.
 * Sprint 5 (Tablet Mode & PWA): Add PWA manifest, service worker for caching, and full-screen Kiosk toggle.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hometasks.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/610341c6-5a25-42ea-b6a6-7d6843d50354).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
