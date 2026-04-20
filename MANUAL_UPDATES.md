# Manual Updates Required

This file lists things that **cannot be automated** and must be updated manually before going live.

---

## 1. Environment Variables (`.env.local`)

Copy `env.template` to `.env.local` and fill in all values:

```bash
cp env.template .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (keep secret) |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | Your n8n instance → Webhook node → Production URL |

---

## 2. n8n Workflow — Manual Node Fixes

After importing/updating the n8n workflow, verify these nodes manually:

### Webhook (Trigger Node)
- Method: `POST`
- Path: `/session-update`
- Expected body fields:
  - `session_date` (string, `YYYY-MM-DD`)
  - `session_time` (string, comma-separated e.g. `"06:30,07:30,08:30,17:00,18:00,19:00"`)
  - `type` (`"scheduled"` | `"cancelled"` | `"holiday"`)
  - `session_link` (string URL, only for `scheduled` type)

### Set Node — Fix Expressions
Make sure the Set node maps these fields correctly:
```
session_date  → {{ $json.body.session_date }}
session_time  → {{ $json.body.session_time }}
type          → {{ $json.body.type }}
session_link  → {{ $json.body.session_link }}
```

### Supabase Query Node — Active Users Only
Query must filter active users:
```sql
SELECT telegram_chat_id, username FROM user4
WHERE last_date > NOW()
```
Or use the Supabase filter: `last_date` → `gt` → `{{ $now.toISO() }}`

### Telegram Message Node — Dynamic Session Link
Replace any static link with the dynamic expression:

**For `scheduled` type:**
```
🧘 *Session Scheduled!*

📅 Date: {{ $json.session_date }}
⏰ Time: {{ $json.session_time }}
🔗 Join here: {{ $json.session_link }}

See you on the mat! 🙏
```

**For `cancelled` type:**
```
❌ *Session Cancelled*

📅 Date: {{ $json.session_date }}
⏰ Time: {{ $json.session_time }}

We'll notify you when the next session is scheduled.
```

Use an `IF` node before the Telegram node to branch on `type === "scheduled"` vs `"cancelled"`.

### Loop Node
- Ensure the loop iterates over the Supabase query results array
- Each iteration should send ONE Telegram message to ONE user's `telegram_chat_id`
- Set batch size to `1` to avoid rate limiting

---

## 3. Supabase — Database Schema Check

Verify the `user4` table has these columns:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `username` | text | |
| `whatsapp_no` | text | |
| `userpage_slug` | text | Unique, used for dashboard URL |
| `registration_date` | timestamptz | Set on registration |
| `last_date` | timestamptz | Trial end date (7 days from registration+1) |
| `telegram_chat_id` | text | Set when user verifies via Telegram bot |

Verify the `sessions` table:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `session_date` | date | Format: `YYYY-MM-DD` |
| `session_time` | text | e.g. `"06:30"` |
| `status` | text | `"scheduled"` or `"cancelled"` |
| `meeting_link` | text | nullable, YouTube/Meet URL |
| `notified` | boolean | default `false` |

**Unique constraint** on `(session_date, session_time)`.

### Create the `session_attendance` table (NEW)

```sql
CREATE TABLE session_attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES user4(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('attended', 'missed')),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, session_id)
);

-- Index for fast lookups
CREATE INDEX idx_session_attendance_user ON session_attendance(user_id);
CREATE INDEX idx_session_attendance_session ON session_attendance(session_id);
```

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `user4.id` |
| `session_id` | uuid | FK → `sessions.id` |
| `status` | text | `"attended"` or `"missed"` |
| `joined_at` | timestamptz | When user joined (null if missed) |
| `created_at` | timestamptz | Auto-set |

**Unique constraint** on `(user_id, session_id)` — one record per user per session.

Verify the `attendance` table (daily attendance):

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `user4.id` |
| `attendance_date` | date | `YYYY-MM-DD` |
| `status` | text | `"P"` (present) or `"A"` (absent) |
| `marked_by` | text | `"system"` or `"user"` |

### Supabase RLS for `session_attendance`

```sql
-- Allow authenticated users to read their own attendance
CREATE POLICY "Users can view own attendance" ON session_attendance
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow service role full access (for admin API routes)
CREATE POLICY "Service role full access" ON session_attendance
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 4. Admin Panel Access

The admin panel is at `/admin`. The login is at `/admin/login`.

Admin credentials are stored server-side — update them in your environment or Supabase directly.

---

## 5. Telegram Bot Setup

1. Create a bot via [@BotFather](https://t.me/BotFather) → get the bot token
2. Set the bot token in your n8n **Telegram credentials**
3. Users must start the bot (`/verify` command) after registration for `telegram_chat_id` to be stored
4. Verify the `/api/verify-user` route correctly saves `telegram_chat_id` to Supabase

---

## 6. Production Deployment Checklist

- [ ] `.env.local` filled with real values
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` points to live n8n webhook (not test URL)
- [ ] n8n workflow is **activated** (not just saved)
- [ ] Supabase RLS policies allow service role to read `user4` and write `sessions`
- [ ] `session_attendance` table created in Supabase (see SQL above)
- [ ] RLS policies applied to `session_attendance` table
- [ ] Test session scheduling end-to-end: schedule → n8n fires → Telegram message received
- [ ] Test admin Sessions section: view, edit, delete sessions
- [ ] Test admin Attendance section: user-wise summaries, detail drill-down
- [ ] Test user My Attendance section: stats cards, attendance table
- [ ] Test login modal with real user credentials
- [ ] Verify `/dashboard/[slug]` loads correctly for registered users
