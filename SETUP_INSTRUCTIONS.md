# TalentConnect - Database Setup Instructions

## Prerequisites
- A Supabase account (create one at https://supabase.com)
- Supabase CLI installed (optional, for running migrations)

## Setup Steps

### 1. Create a New Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be provisioned

### 2. Get Your Supabase Credentials
1. Go to Project Settings > API
2. Copy your `Project URL` and `anon public` key
3. Create a `.env.local` file in the root of this project
4. Add your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Run the Database Migration

#### Option A: Using Supabase Dashboard (Easiest)
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `database/initial_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the migration

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Disable Email Confirmation (Recommended for Development)

**IMPORTANT**: To allow users to log in immediately after signup without email confirmation:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider and click to expand settings
4. Toggle **OFF** the "Confirm email" option
5. Click **Save**

This allows users to access their dashboard immediately after signup without waiting for email confirmation. You can re-enable this in production if you need email verification.

### 5. Create Your First Admin User
1. Sign up through your app (it will create a talent user by default)
2. Go to Supabase Dashboard > SQL Editor
3. Run this query to make yourself an admin (replace YOUR_USER_EMAIL):
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin'::app_role
   from auth.users
   where email = 'YOUR_USER_EMAIL';
   ```

### 6. Import Initial Job Listings (Optional)

Once you're logged in as an admin:
1. Navigate to the Admin Dashboard
2. Go to the "Job Management" tab
3. Click "Import Jobs from API" button
4. This will automatically populate your database with 20 real job listings from Remotive's free API

This is useful for getting started with sample data so your platform doesn't look empty!

### 7. Verify Setup
1. Go to "Table Editor" in Supabase dashboard
2. You should see these tables:
   - profiles
   - user_roles
   - jobs
   - applications
   - talents
3. All tables should have RLS (Row Level Security) enabled

## Database Schema Overview

### Tables

#### `profiles`
- User profile information
- Automatically created when a user signs up
- Links to `auth.users`

#### `user_roles`
- **CRITICAL**: Stores user roles separately for security
- Roles: `admin`, `recruiter`, `talent`
- Users can have multiple roles
- Protected by RLS - only admins can modify

#### `jobs`
- Job postings created by recruiters
- Can be viewed by all authenticated users
- Only recruiters and admins can create
- Only poster or admin can edit/delete

#### `applications`
- Job applications from talents
- Visible to applicant, job poster, and admins
- Talents can apply to jobs
- Status updates allowed by applicant and job poster

#### `talents`
- Extended profile for talent users
- Skills, experience, bio, portfolio links
- Public to all authenticated users
- Only owner can edit

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Roles are stored in a separate table (NOT in profiles) to prevent privilege escalation
- The `has_role()` function uses `SECURITY DEFINER` to prevent RLS recursion
- Never store sensitive role information in client-side storage

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the migration SQL in your Supabase project

### "new row violates row-level security policy"
- Make sure you're logged in
- Check that your user has the correct role in `user_roles` table

### Can't see data in tables
- Verify RLS policies are set correctly
- Check that you're authenticated
- For testing, you can temporarily disable RLS on a table (NOT recommended for production)

## Next Steps

1. Install the required dependency:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Restart your dev server to load the new environment variables

3. Test the authentication flow by signing up as a new user

4. Create admin users using the SQL query in step 4 above

## Support

For issues with Supabase setup:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
