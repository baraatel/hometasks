# HomeTasker — Admin User Manual (Homeowners & Managers)

This manual is for **Homeowners / Household Managers** who configure, schedule, translate, and maintain chores in HomeTasker.  
For household helpers, maids, and service workers, see **[USER_MANUAL.md](./USER_MANUAL.md)**.  
For PIN credentials and environment secrets, see **[ADMIN_CREDENTIALS.md](./ADMIN_CREDENTIALS.md)**.

---

## 1. Accessing & Locking the Admin Panel

1. Open HomeTasker and tap the **Manage** tab (`/manage`).
2. Enter your 4-digit **Admin PIN** (see your local `ADMIN_CREDENTIALS.md` or Lovable Cloud secret `ADMIN_PIN`).
3. **Brute-Force Protection:** If an incorrect PIN is entered **5 times in 60 seconds**, the keypad locks temporarily for **60 seconds** and displays a lockout warning.
4. **Always Lock Before Handing Over Shared Devices:** Tap the **Lock (`🔒`)** icon in the top-right corner of `/manage` when you finish making edits. Refreshing or reopening `/manage` also automatically re-verifies your session with the server.

---

## 2. Creating a New Chore (Single-Input Fast Mode)

You never need to type a chore 9 times. Write it once in your preferred language and let HomeTasker translate it for your household staff:

1. Tap **`+ Add chore`** in the top-right corner of `/manage`.
2. **Select an Icon (Emoji):**
   - Pick from 8 localized categories: *Cleaning, Laundry, Kitchen, Bathroom, Shopping, Garden & Outdoor, Kids & Pets,* and *Errands & Other* — or type any custom emoji in the box below.
3. **Choose Input Language (`Written in`):**
   - Defaults to your current app language (`en`, `ar`, `hi`, `fil`, `ne`, `si`, `ta`, `ur`, or `bn`).
4. **Enter Chore Name & Optional Notes:**
   - **Chore name** (required): e.g., *"Clean the kitchen"* or *"تنظيف المطبخ"*.
   - **Notes (optional)**: Specific instructions shown right below the chore title on every card, e.g., *"Use green sponge for counters; empty sink strainer"*.
5. **One-Click Auto-Translate:**
   - Tap **`✨ Auto-translate to all languages`**.
   - HomeTasker calls the AI translation gateway and fills idiomatic, respectful, everyday household phrasing across all 8 other languages.
6. **Review & Fine-Tune (`🌐 Translations` Accordion):**
   - Expand **`🌐 Translations (x / 8)`** to inspect or adjust any language's title or notes inline.
   - Each language input automatically uses the correct reading direction (`RTL` for Arabic & Urdu, `LTR` for the other 7 languages).
   - **Graceful Fallback:** If you leave any language blank, HomeTasker automatically falls back to your original input language so cards never appear blank.

---

## 3. Scheduling & Time-of-Day Grouping

Choose how often the chore appears on the daily checklist:

| Recurrence | When It Appears | Typical Examples |
| :--- | :--- | :--- |
| **Daily** | Every day; automatically resets at local midnight | Dishwashing & Kitchen, Floor Mopping |
| **Weekly** | On the specific weekdays you toggle (`Sun`–`Sat`) | Laundry (Sun & Wed), Water Plants (Mon & Thu), Bathroom Cleaning (Sat) |
| **One-off** | Once on a single chosen calendar date | AC filter cleaning, deep-clean guest room |

- **Time (optional):** Setting a time (e.g., `09:00`, `14:00`, `18:00`) displays a time pill on the chore card and automatically groups Today's checklist into **Morning** (`< 12:00`), **Afternoon** (`12:00–16:59`), **Evening** (`17:00+`), and **Anytime**.
- **Live Preview:** Check the preview card at the bottom of the dialog to verify exactly how the chore will look before tapping **Save**.

---

## 4. Editing, Reordering & Deleting Chores

- **Reorder Priority:** Use the **Up (`↑`)** and **Down (`↓`)** buttons on any row in `/manage` to control the exact order chores appear on Today's list. Changes sync live to all devices.
- **Edit Chore:** Tap the **Pencil (`✏️`)** icon to modify icons, notes, schedules, or translations.
- **Delete Chore:** Open the chore with the Pencil icon and tap **Delete**. *(Note: Deleting a chore permanently removes both the chore and its completion logs.)*

---

## 5. Display Modes: Dark Mode, Light Mode & Kiosk Mode

- **Light & Dark Mode (`☀️` / `🌙`):** Tap the Moon/Sun icon in the top header to switch instantly between Light Mode and Dark Mode. By default, HomeTasker follows each device's system preference and remembers manual selections without page-load flicker.
- **Wall-Mounted Tablet Kiosk Mode (`🖥️ Kiosk mode`):** On the **Today** tab (`/`), tap **Kiosk mode** to enter a high-contrast dark, extra-large card layout designed for kitchen tablets. The browser Screen Wake Lock keeps the display awake automatically. Tap **Exit kiosk** to return to standard mode.

---

## 6. Onboarding a New Helper / Maid

1. Open HomeTasker on the helper's phone or kitchen tablet.
2. Point them to the **Globe (`🌐`)** button in the top corner (or show them the **9-Language Onboarding Card** in [USER_MANUAL.md](./USER_MANUAL.md)).
3. Show them the **Speaker (`🔊`)** button on each card so they can hear chores read aloud in their own language.
4. *(Optional)* Add HomeTasker to their home screen (**Chrome → Install app** / **Safari → Add to Home Screen**) for one-tap offline-ready access.

---

## 7. Applying Database Updates & Troubleshooting

- **Updating the Database:**
  - Push Git changes to your Lovable-connected branch to auto-run Drizzle migrations (`drizzle/migrations/*.sql`), or paste SQL directly in your **Lovable Cloud / Supabase SQL Editor**.
- **Auto-Translate Shows an Error:**
  - Ensure `LOVABLE_API_KEY` is set in your server environment variables and has active credits. You can always type or edit translations manually inside the `🌐 Translations` accordion.
- **Helper Cannot Check Off a Chore:**
  - Check Wi-Fi connectivity and confirm the device's date/time is correct—for database security, RLS policies only permit ticking logs for **today $\pm 1$ day**.
- **Forgot or Need to Rotate Admin PIN:**
  - See [ADMIN_CREDENTIALS.md](./ADMIN_CREDENTIALS.md) to update `ADMIN_PIN` in your environment or Lovable Cloud secrets.

