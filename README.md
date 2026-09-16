# MedGuide — Clean Standalone Project

This copy is detached from the previous owner's DesignArena/Vercel/Supabase configuration. UI and app features are kept intact, while project-specific tracking, restore hooks, hardcoded credentials and the old Google auth proxy have been removed.

## 1. Requirements
- Node.js 20+
- npm
- A Supabase project (needed for Google login and database-backed features; not required just to open the app locally)
- A Vercel account for deployment

## 2. Create your Supabase backend
1. Create a new Supabase project.
2. Open **SQL Editor** and run `supabase/setup.sql` once.
3. In **Project Settings -> API**, copy:
   - Project URL
   - Publishable/anon key
   - Service role key
4. For Google login, enable **Authentication -> Providers -> Google** in Supabase and configure the Google OAuth credentials there. Add your local and production URLs in Supabase Auth redirect URL settings.

## 3. Local setup

For the first visual/local check, you can run the app **without any `.env.local` file**. The login page, Demo Mode, Phone OTP demo flow, symptom guidance and other frontend-only features will open normally. Google login and database-backed lists/actions need your own Supabase project.

Install and start:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

When you are ready to connect your own backend, copy `.env.example` to `.env.local` and fill in your own values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Restart `npm run dev` after saving `.env.local`.

`npm run dev` starts the Vite frontend and a small local adapter for the existing `/api/*.js` serverless routes, so the backend features work locally too.

## 4. Production build check

```bash
npm run build
```

## 5. Deploy on Vercel
1. Push this folder to your own GitHub repository or import it directly into Vercel.
2. Framework preset: **Vite**.
3. Add these Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.
5. Add the final Vercel URL to Supabase Auth allowed redirect URLs. If Google auth is enabled, ensure the Google provider configuration in Supabase is complete.

## Security
Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_*` variable. The service-role key is used only by the server-side `/api` functions.


## If you ever get a white screen
This cleaned version does not crash when Supabase environment variables are missing. If a white screen appears after your own edits, open browser DevTools -> Console and check the first red error. Also make sure you start the project with `npm run dev` rather than opening `index.html` directly.

## Password account signup / login

The login page now starts with **Create Account** using Email or Phone + Password. Existing users can switch to **Sign In** with the same credentials. Google and Phone OTP remain available below as alternate login methods.

For this to work with your own backend:

1. Create/connect your Supabase project and fill `.env.local` from `.env.example`.
2. In Supabase **Authentication > Providers**, keep **Email** enabled.
3. For phone + password accounts, enable **Phone** authentication and configure an SMS provider if your Supabase settings require phone confirmation.
4. If **Confirm email** is enabled, new email users must click the verification link before password sign-in.
5. Google login still requires the Google provider to be enabled separately in Supabase.

Do not put the Supabase service-role key in frontend environment variables. Only the public anon/publishable key belongs in `VITE_SUPABASE_ANON_KEY`.
