# GD ARENA — SUPABASE POSTGRESQL & AUTHENTICATION SETUP GUIDE

This guide provides step-by-step instructions to configure **Supabase** for GD Arena, explaining the database schema, Row Level Security (RLS) policies, authentication triggers, and production environment security.

---

## 1. ARCHITECTURE OVERVIEW

GD Arena uses Supabase as its primary cloud database and authentication provider:
* **Database Engine**: PostgreSQL 15+ hosted on Supabase Cloud.
* **Authentication**: Supabase Auth (Email + Password and persistent session JWTs).
* **Security Model**: Row Level Security (RLS) enforcing tenant isolation at the database level.
* **Fallback Mode**: If Supabase credentials are not configured, the backend automatically operates in an isolated In-Memory mode for local demonstrations.

```
+--------------------------------------------------------------------------------------------------+
|                              SUPABASE POSTGRESQL TABLE RELATIONSHIPS                             |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   auth.users (Supabase Managed Auth)                                                             |
|       |                                                                                          |
|       | 1:1 on auth.users(id)                                                                    |
|       v                                                                                          |
|   public.profiles                                                                                |
|       id (UUID PK, FK -> auth.users.id)                                                          |
|       display_name, email, avatar_url, created_at, updated_at                                    |
|       |                                                                                          |
|       | 1:N on user_id                                                                           |
|       v                                                                                          |
|   public.discussion_sessions                                                                     |
|       id (UUID PK), user_id (UUID FK), topic, difficulty, duration_minutes,                      |
|       participant_count, discussion_style, status, started_at, ended_at                          |
|       |                                               |                                          |
|       | 1:N on session_id                             | 1:1 on session_id                        |
|       v                                               v                                          |
|   public.discussion_messages                      public.session_reports                         |
|       id (UUID PK), session_id (UUID FK),             id (UUID PK), session_id (UUID FK),        |
|       speaker_type ('user'|'ai'|'system'),            user_id (UUID FK), overall_score,          |
|       speaker_name, personality, message_text,         8 placement dimension scores,              |
|       sequence_number, created_at                     strengths, improvements, summary           |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. STEP-BY-STEP MANUAL SETUP IN SUPABASE DASHBOARD

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New project** &rarr; select your organization.
3. Name: `GD-Arena` (or `gd-arena-prod`).
4. Database Password: Generate and securely save a strong password (you will not need to paste it in code; connection pooling handles it).
5. Region: Select **Singapore (`ap-southeast-1`)** or **Mumbai (`ap-south-1`)** for lowest latency from India.
6. Pricing Plan: Select **Free tier** (\$0/month).
7. Click **Create new project** and wait ~2 minutes for provisioning to finish.

### Step 2: Run the SQL Migration
1. In the Supabase sidebar, click **SQL Editor**.
2. Click **New query**.
3. Open the migration file from your repository:  
   [`supabase/migrations/20261010_initial_schema.sql`](file:///C:/Users/opgup/.gemini/antigravity/scratch/gd-arena/supabase/migrations/20261010_initial_schema.sql)
4. Copy the entire contents of the SQL file, paste it into the Supabase SQL Editor, and click **Run** (or press `Ctrl + Enter`).
5. Verify output: `Success. No rows returned.`

### Step 3: Retrieve Your API Keys
1. In the Supabase sidebar, click **Project Settings** (gear icon) &rarr; **API**.
2. Note down the following values:
   * **Project URL**: `https://<your-project-id>.supabase.co`
   * **Project API keys**:
     * `anon` / `public`: Safe to use in browser frontend.
     * `service_role` / `secret`: **CRITICAL**: Use ONLY in backend environment variables. Never expose in frontend code.

---

## 3. ROW LEVEL SECURITY (RLS) POLICIES EXPLAINED

All tables enforce strict Row Level Security (RLS) to prevent unauthorized access:

### A. `public.profiles`
* **SELECT**: `auth.uid() = id` (Students can only view their own user profile).
* **INSERT**: `WITH CHECK (auth.uid() = id)` (Trigger handles automatic insertion upon auth registration).
* **UPDATE**: `USING (auth.uid() = id)` (Students can update their own display name and avatar).

### B. `public.discussion_sessions`
* **SELECT**: `auth.uid() = user_id` (Students can only retrieve their own session history).
* **INSERT**: `WITH CHECK (auth.uid() = user_id)` (Students can only create sessions assigned to their account).
* **UPDATE**: `USING (auth.uid() = user_id)` (Students can only mark their own sessions as completed).

### C. `public.discussion_messages`
* **SELECT & INSERT**: Enforced via subquery:
  ```sql
  EXISTS (
      SELECT 1 FROM public.discussion_sessions s
      WHERE s.id = discussion_messages.session_id
      AND s.user_id = auth.uid()
  )
  ```
  Guarantees messages can only be read or created within discussions owned by the authenticated student.

### D. `public.session_reports`
* **SELECT**: `auth.uid() = user_id` (Reports and scores are strictly private to the candidate).
* **INSERT**: `WITH CHECK (auth.uid() = user_id)` (Reports are tied to the session owner).

---

## 4. ENVIRONMENT VARIABLES MAPPING

To activate Supabase in your deployed application, set the following environment variables:

### For Render Backend Service:
```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-secret-service-role-key>
SUPABASE_ANON_KEY=<your-public-anon-key>
```

### For Vercel Frontend Service:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-public-anon-key>
```
*(Notice: The `service_role` key is NEVER provided to Vercel or frontend code).*

---

## 5. SECURITY & SECRETS BEST PRACTICES

1. **Principle of Least Privilege**:
   * The client SPA only possesses the `anon` key. All operations with the `anon` key are constrained by RLS policies.
   * The backend Express service uses the `service_role` key only for system-level operations (e.g., automated test runs or demo fallbacks).
2. **Zero Hardcoded Secrets**:
   * Never commit actual Supabase keys to Git.
   * Ensure `.env` is listed in `.gitignore`.
   * Only commit `.env.example` containing placeholder strings.
3. **Automated User Onboarding**:
   * The `on_auth_user_created` trigger automatically inserts a matching row into `public.profiles` whenever a student registers via email/password, eliminating manual profile creation.
